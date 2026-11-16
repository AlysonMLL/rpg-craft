"""
Função do Arquivo: Comando "python manage.py seed_demo": cria os dois mundos de demonstração
públicos (is_demo) com conteúdo fictício (worlds/demo_data.py): personagens e relações, raças,
criaturas, missões, documentos, eras e eventos, mais algumas entradas na atividade recente.

Uso:
  python manage.py seed_demo                  cria os mundos que ainda não existem (sem imagens)
  python manage.py seed_demo --reset          apaga e recria os dois mundos de demonstração
  python manage.py seed_demo --images-only --assets-url https://SEU-SITE.vercel.app/demo
                                              só preenche as URLs das imagens nos mundos existentes
  --owner NOME   usuário dono (padrão: o primeiro superusuário)
  A URL base também pode vir da variável DEMO_ASSETS_URL.

Atenção: o banco local e o de produção são o mesmo; use sempre a URL PÚBLICA do site nas imagens.
Mundos de outros nomes (como o Meteora) nunca são tocados.

O que há aqui:
- Command.handle(): resolve o dono e escolhe entre criar, recriar ou só atualizar imagens.
- _seed_world(): cria um mundo inteiro numa transação (se algo falhar, nada fica pela metade).
- _update_images(): ajusta só as URLs de imagem por nome.
"""

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Max
from django.utils.text import slugify

from activity.models import Activity
from activity.services import log_activity
from characters.models import Character, Relationship
from lore.models import Document, Era, Quest, TimelineEvent
from peoples.models import Creature, Race
from worlds.demo_data import DEMO_WORLDS
from worlds.models import Tag, World


def _url(base, slug, relative):
    """Monta a URL pública de uma imagem; vazio quando não há base ou arquivo."""
    return f'{base}/{slug}/{relative}' if base and relative else ''


class Command(BaseCommand):
    help = 'Cria (ou recria) os mundos de demonstração públicos com conteúdo fictício.'

    def add_arguments(self, parser):
        parser.add_argument('--owner', help='Username do dono (padrão: o primeiro superusuário).')
        parser.add_argument('--reset', action='store_true', help='Apaga e recria os mundos de demonstração.')
        parser.add_argument('--images-only', action='store_true', help='Só atualiza as URLs das imagens.')
        parser.add_argument(
            '--assets-url',
            default=os.getenv('DEMO_ASSETS_URL', ''),
            help='URL pública da pasta das imagens (ex.: https://rpg-craft.vercel.app/demo).',
        )

    def handle(self, *args, **options):
        owner = self._get_owner(options['owner'])
        base = (options['assets_url'] or '').rstrip('/')

        if options['images_only']:
            if not base:
                raise CommandError('Informe --assets-url (ou a variável DEMO_ASSETS_URL).')
            self._update_images(owner, base)
            return

        last = World.objects.filter(owner=owner).aggregate(last=Max('display_order'))['last']
        order = 0 if last is None else last + 1

        for data in DEMO_WORLDS:
            existing = World.objects.filter(owner=owner, name=data['name'], is_demo=True)
            if existing.exists():
                if not options['reset']:
                    self.stdout.write(f'"{data["name"]}" já existe (use --reset para recriar). Pulando.')
                    continue
                for world in existing:
                    Activity.objects.filter(world=world).delete()  # sem entradas órfãs no feed
                    world.delete()
            self._seed_world(owner, data, base, order)
            order += 1

        self.stdout.write(self.style.SUCCESS('Pronto.'))

    def _get_owner(self, username):
        user_model = get_user_model()
        if username:
            owner = user_model.objects.filter(username=username).first()
            if owner is None:
                raise CommandError(f'Usuário "{username}" não encontrado.')
            return owner
        owner = user_model.objects.filter(is_superuser=True).order_by('id').first()
        if owner is None:
            raise CommandError('Nenhum superusuário encontrado. Use --owner NOME.')
        return owner

    @transaction.atomic
    def _seed_world(self, owner, data, base, order):
        slug = data['slug']
        year, month, day = data['now']
        world = World.objects.create(
            owner=owner,
            name=data['name'],
            synopsis=data['synopsis'],
            introduction_markdown=data['introduction_markdown'],
            is_demo=True,
            cover_image=_url(base, slug, data.get('cover')) or None,
            calendar_era_name=data['calendar_era_name'],
            now_year=year,
            now_month=month,
            now_day=day,
            display_order=order,
        )
        tags = [Tag.objects.get_or_create(slug=slugify(name), defaults={'name': name})[0] for name in data['tags']]
        world.tags.set(tags)

        # Personagens e relações
        characters = {}
        for position, item in enumerate(data['characters']):
            fields = {key: value for key, value in item.items() if key != 'img'}
            characters[item['name']] = Character.objects.create(
                world=world, portrait_url=_url(base, slug, item.get('img')), display_order=position, **fields
            )
        for source, target, kind, label, reverse_label, is_mutual in data['relationships']:
            Relationship.objects.create(
                world=world, source=characters[source], target=characters[target], kind=kind,
                label=label, reverse_label=reverse_label, is_mutual=is_mutual,
            )

        # Raças e criaturas
        races = [
            Race.objects.create(
                world=world, image_url=_url(base, slug, item.get('img')), display_order=position,
                **{key: value for key, value in item.items() if key != 'img'},
            )
            for position, item in enumerate(data['races'])
        ]
        creatures = [
            Creature.objects.create(
                world=world, image_url=_url(base, slug, item.get('img')), display_order=position,
                **{key: value for key, value in item.items() if key != 'img'},
            )
            for position, item in enumerate(data['creatures'])
        ]

        # Missões, documentos, eras e eventos
        quests = [Quest.objects.create(world=world, sort_order=position, **item) for position, item in enumerate(data['quests'])]
        documents = []
        for section, items in data['documents'].items():
            for position, item in enumerate(items):
                documents.append(Document.objects.create(world=world, section=section, sort_order=position, **item))
        for item in data['eras']:
            Era.objects.create(world=world, **item)
        events = [TimelineEvent.objects.create(world=world, **item) for item in data['events']]

        # Algumas entradas na atividade recente (visível aos visitantes)
        target = Activity.Target
        for kind, instance, label in [
            (target.WORLD, world, world.name),
            (target.CHARACTER, list(characters.values())[-1], None),
            (target.RACE, races[-1], None),
            (target.CREATURE, creatures[-1], None),
            (target.QUEST, quests[0], None),
            (target.DOCUMENT, documents[0], None),
            (target.EVENT, events[-1], None),
        ]:
            log_activity(
                owner=owner, verb=Activity.Verb.CREATED, target_type=kind, target_id=instance.id,
                label=label or getattr(instance, 'name', None) or instance.title, world=world,
            )

        self.stdout.write(self.style.SUCCESS(f'Criado: {world.name} (id {world.id}).'))

    def _update_images(self, owner, base):
        for data in DEMO_WORLDS:
            world = World.objects.filter(owner=owner, name=data['name'], is_demo=True).first()
            if world is None:
                self.stdout.write(self.style.WARNING(f'"{data["name"]}" não existe. Rode seed_demo antes.'))
                continue
            slug = data['slug']
            world.cover_image = _url(base, slug, data.get('cover')) or None
            world.save(update_fields=['cover_image'])
            for item in data['characters']:
                Character.objects.filter(world=world, name=item['name']).update(
                    portrait_url=_url(base, slug, item.get('img')), portrait_crop=None
                )
            for model, key in ((Race, 'races'), (Creature, 'creatures')):
                for item in data[key]:
                    model.objects.filter(world=world, name=item['name']).update(
                        image_url=_url(base, slug, item.get('img')), image_crop=None
                    )
            self.stdout.write(self.style.SUCCESS(f'Imagens atualizadas: {world.name}.'))