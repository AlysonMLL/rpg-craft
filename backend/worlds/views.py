"""
O que há aqui:
- TagViewSet: Categorias globais. Leitura liberada para qualquer pessoa; criar (POST /tags/)
  exige login e devolve a tag já existente quando o nome repete (sem duplicar).
- WorldViewSet: CRUD de Mundos. Leitura pública; escrita exige login e ser o dono.
- WorldViewSet.get_queryset(): visitante anônimo (modo convidado) vê só mundos 'is_demo';
  usuário logado vê os próprios mundos mais os 'is_demo'.
- WorldViewSet.perform_create(): Injeta automaticamente o usuário logado como 'owner'
  do mundo no momento de um POST, dispensando o envio desse dado no JSON da requisição.
- perform_create/update/destroy também registram a atividade (log de "Atividade recente").
- WorldViewSet.reorder(): POST /worlds/reorder/ com {"ids": [3, 1, 2]} grava a ordem
  personalizada (arrastar e soltar) dos mundos do usuário numa única transação.

Função do arquivo: Atuar como a camada de Controladores (Views) da API de Mundos.
Conecta o roteamento HTTP às operações de banco de dados, garantindo as regras de negócio
de isolamento de dados (Multi-tenancy RLS-like no nível da aplicação) e injetando
contexto de autenticação antes de passar os dados para os serializers.
"""

from django.db import transaction
from django.db.models import Count, IntegerField, OuterRef, Q, Subquery
from django.db.models.functions import Coalesce
from django.utils.text import slugify
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from activity.models import Activity
from activity.services import log_activity

from .models import World, Tag
from .permissions import IsOwnerOrReadOnly
from .serializers import WorldSerializer, TagSerializer
from characters.models import Character
from peoples.models import Creature, Race



class TagViewSet(mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def get_permissions(self):
        # Tags são públicas para leitura (popular selects); criar exige login
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        name = ' '.join(str(request.data.get('name', '')).split())
        slug = slugify(name)
        if not name or not slug or len(name) > 50:
            return Response(
                {'detail': 'Informe um nome de até 50 caracteres, com letras ou números.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mesmo nome (sem diferenciar maiúsculas) ou mesmo slug: devolve a que já existe
        existing = Tag.objects.filter(Q(name__iexact=name) | Q(slug=slug)).first()
        if existing:
            return Response(TagSerializer(existing).data, status=status.HTTP_200_OK)

        tag = Tag.objects.create(name=name, slug=slug)
        return Response(TagSerializer(tag).data, status=status.HTTP_201_CREATED)
    

class WorldViewSet(viewsets.ModelViewSet):
    serializer_class = WorldSerializer
    # Visitante só lê; para escrever é preciso estar logado E ser o dono do mundo
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    @staticmethod
    def _count_of(model):
        """Conta os itens do mundo por subconsulta (vários Count com JOIN multiplicariam as linhas)."""
        return Coalesce(
            Subquery(
                model.objects.filter(world=OuterRef('pk'))
                .order_by()
                .values('world')
                .annotate(total=Count('pk'))
                .values('total'),
                output_field=IntegerField(),
            ),
            0,
        )
    
    def get_queryset(self):
        queryset = (
            World.objects.prefetch_related('tags')
            .select_related('owner')
            .annotate(
                characters_count=self._count_of(Character),
                races_count=self._count_of(Race),
                creatures_count=self._count_of(Creature),
            )
        )

        # Modo convidado (sem token): apenas mundos de demonstração pública
        if not self.request.user.is_authenticated:
            return queryset.filter(is_demo=True)

        # Logado: os próprios mundos OU os mundos de demonstração pública
        return queryset.filter(Q(owner=self.request.user) | Q(is_demo=True)).distinct()

    def perform_create(self, serializer):
        # Quando o frontend manda um POST para criar um RPG, o Django atrela o dono automaticamente
        world = serializer.save(owner=self.request.user)
        log_activity(
            owner=world.owner, verb=Activity.Verb.CREATED, target_type=Activity.Target.WORLD,
            target_id=world.id, label=world.name, world=world,
        )

    def perform_update(self, serializer):
        world = serializer.save()
        # Só favoritar/desfavoritar não conta como atividade
        if set(serializer.validated_data) - {'is_favorite'}:
            log_activity(
                owner=world.owner, verb=Activity.Verb.UPDATED, target_type=Activity.Target.WORLD,
                target_id=world.id, label=world.name, world=world,
            )

    def perform_destroy(self, instance):
        owner, world_id, name = instance.owner, instance.id, instance.name
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.WORLD,
            target_id=world_id, label=name, world=None,
        )

    

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        """Recebe os ids dos mundos do usuário na ordem desejada e grava display_order."""
        ids = request.data.get('ids')
        if not isinstance(ids, list) or not all(
            isinstance(i, int) and not isinstance(i, bool) for i in ids
        ):
            return Response(
                {'detail': 'Envie "ids" como uma lista de números.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(set(ids)) != len(ids):
            return Response(
                {'detail': 'A lista de ids tem valores repetidos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Só os mundos do próprio usuário podem ser reordenados (demos de outros não)
        worlds = {w.id: w for w in World.objects.filter(owner=request.user, id__in=ids)}
        if len(worlds) != len(ids):
            return Response(
                {'detail': 'A lista contém mundos que não existem ou não são seus.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for position, world_id in enumerate(ids):
            worlds[world_id].display_order = position

        with transaction.atomic():
            World.objects.bulk_update(worlds.values(), ['display_order'])

        return Response(status=status.HTTP_204_NO_CONTENT)