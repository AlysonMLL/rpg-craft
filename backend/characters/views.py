"""
Função do Arquivo: Endpoints dos personagens.
GET/POST /api/characters/?world=ID, GET/PATCH/DELETE /api/characters/{id}/ e
POST /api/characters/reorder/ (corpo: {"world": ID, "ids": [...]}).
- Leitura: logado vê os próprios mundos e os 'is_demo'; visitante, só os 'is_demo'.
- Escrita: só o dono do mundo.
- A lista devolve a versão leve (sem textos longos); o detalhe devolve a ficha completa.
- Criar, editar e excluir entram no log de atividade (edições em 10 min viram uma só).
  Favoritar e reordenar NÃO entram no log.

O que há ali:
- CharacterViewSet: herda a regra de acesso por mundo de lore.timeline_views._WorldScopedViewSet.
  - get_serializer_class(): serializer leve na lista e completo nas demais ações.
  - perform_create(): coloca o novo personagem no fim da ordem personalizada.
  - perform_update() / perform_destroy(): registram a atividade.
  - reorder(): grava a nova ordem; ids que faltam na lista vão para o fim, sem mudar entre si.
"""

from django.db.models import Max
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from activity.models import Activity
from activity.services import log_activity
from lore.timeline_views import _WorldScopedViewSet
from worlds.models import World

from .models import Character
from .serializers import CharacterListSerializer, CharacterSerializer


class CharacterViewSet(_WorldScopedViewSet):
    queryset = Character.objects.all()

    def get_serializer_class(self):
        return CharacterListSerializer if self.action == 'list' else CharacterSerializer

    def _log(self, verb, character):
        log_activity(
            owner=character.world.owner, verb=verb, target_type=Activity.Target.CHARACTER,
            target_id=character.id, label=character.name, world=character.world,
        )

    def perform_create(self, serializer):
        world = serializer.validated_data['world']
        last = Character.objects.filter(world=world).aggregate(last=Max('display_order'))['last']
        character = serializer.save(display_order=0 if last is None else last + 1)
        self._log(Activity.Verb.CREATED, character)

    def perform_update(self, serializer):
        only_favorite = set(serializer.validated_data) == {'is_favorite'}
        character = serializer.save()
        if not only_favorite:
            self._log(Activity.Verb.UPDATED, character)

    def perform_destroy(self, instance):
        owner, char_id, name, world = instance.world.owner, instance.id, instance.name, instance.world
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.CHARACTER,
            target_id=char_id, label=name, world=world,
        )

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        world_id = request.data.get('world')
        ids = request.data.get('ids')
        valid_ids = (
            isinstance(ids, list)
            and all(isinstance(i, int) and not isinstance(i, bool) for i in ids)
            and len(set(ids)) == len(ids)
        )
        if not valid_ids or not str(world_id).isdigit():
            return Response(
                {'detail': 'Envie "world" e "ids" (lista de números sem repetição).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        world = World.objects.filter(pk=int(world_id)).first()
        if world is None or world.owner_id != request.user.id:
            return Response({'detail': 'Este mundo não é seu.'}, status=status.HTTP_403_FORBIDDEN)

        characters = list(Character.objects.filter(world=world))  # já vem na ordem atual
        by_id = {character.id: character for character in characters}
        if any(i not in by_id for i in ids):
            return Response(
                {'detail': 'Há personagens que não pertencem a este mundo.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        listed = set(ids)
        ordered = [by_id[i] for i in ids] + [c for c in characters if c.id not in listed]
        for position, character in enumerate(ordered):
            character.display_order = position
        Character.objects.bulk_update(ordered, ['display_order'])
        return Response(status=status.HTTP_204_NO_CONTENT)