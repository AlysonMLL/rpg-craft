"""
Missões do mundo: GET/POST /api/quests/?world=ID e GET/PATCH/DELETE /api/quests/{id}/.
- Leitura: logado vê os próprios mundos e os 'is_demo'; visitante, só os 'is_demo'.
- Escrita: só o dono do mundo. Nova missão vai para o fim da lista do mundo.
- Criar, editar (inclui trocar o status) e excluir entram no log de atividade.
"""

from django.db.models import Max

from activity.models import Activity
from activity.services import log_activity

from .models import Quest
from .quest_serializers import QuestSerializer
from .timeline_views import _WorldScopedViewSet


class QuestViewSet(_WorldScopedViewSet):
    queryset = Quest.objects.all()
    serializer_class = QuestSerializer

    def _log(self, verb, quest):
        log_activity(
            owner=quest.world.owner, verb=verb, target_type=Activity.Target.QUEST,
            target_id=quest.id, label=quest.title, world=quest.world,
        )

    def perform_create(self, serializer):
        world = serializer.validated_data['world']
        last = Quest.objects.filter(world=world).aggregate(last=Max('sort_order'))['last']
        self._log(Activity.Verb.CREATED, serializer.save(sort_order=(last or 0) + 1))

    def perform_update(self, serializer):
        self._log(Activity.Verb.UPDATED, serializer.save())

    def perform_destroy(self, instance):
        owner, quest_id, title, world = instance.world.owner, instance.id, instance.title, instance.world
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.QUEST,
            target_id=quest_id, label=title, world=world,
        )