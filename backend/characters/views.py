"""
Função do Arquivo: Endpoints dos personagens.
GET/POST /api/characters/?world=ID e GET/PATCH/DELETE /api/characters/{id}/
- Leitura: logado vê os próprios mundos e os 'is_demo'; visitante, só os 'is_demo'.
- Escrita: só o dono do mundo.
- A lista devolve a versão leve (sem textos longos); o detalhe devolve a ficha completa.
- Criar, editar e excluir entram no log de atividade (edições em 10 min viram uma só).

O que há ali:
- CharacterViewSet: herda a regra de acesso por mundo de lore.timeline_views._WorldScopedViewSet.
  - get_serializer_class(): escolhe o serializer leve na lista e o completo nas demais ações.
  - _log / perform_create / perform_update / perform_destroy: registram a atividade.
"""

from activity.models import Activity
from activity.services import log_activity
from lore.timeline_views import _WorldScopedViewSet

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
        self._log(Activity.Verb.CREATED, serializer.save())

    def perform_update(self, serializer):
        self._log(Activity.Verb.UPDATED, serializer.save())

    def perform_destroy(self, instance):
        owner, char_id, name, world = instance.world.owner, instance.id, instance.name, instance.world
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.CHARACTER,
            target_id=char_id, label=name, world=world,
        )