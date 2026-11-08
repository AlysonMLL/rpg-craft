"""
Linha do Tempo: eventos e eras de um mundo.
GET/POST /api/timeline-events/?world=ID e /api/eras/?world=ID (e /{id}/ para PATCH/DELETE).
- Leitura: logado vê os próprios mundos e os 'is_demo'; visitante, só os 'is_demo'.
- Escrita: só o dono do mundo. Eventos entram no log de atividade; eras não.
"""

from django.db.models import Q
from rest_framework import permissions, viewsets

from activity.models import Activity
from activity.services import log_activity

from .models import Era, TimelineEvent
from .permissions import IsWorldOwnerOrReadOnly
from .timeline_serializers import EraSerializer, TimelineEventSerializer


class _WorldScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsWorldOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset().select_related('world')
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.filter(Q(world__owner=user) | Q(world__is_demo=True))
        else:
            queryset = queryset.filter(world__is_demo=True)
        world = self.request.query_params.get('world')
        if world and world.isdigit():
            queryset = queryset.filter(world_id=int(world))
        return queryset


class TimelineEventViewSet(_WorldScopedViewSet):
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer

    def _log(self, verb, event):
        log_activity(
            owner=event.world.owner, verb=verb, target_type=Activity.Target.EVENT,
            target_id=event.id, label=event.title, world=event.world,
        )

    def perform_create(self, serializer):
        self._log(Activity.Verb.CREATED, serializer.save())

    def perform_update(self, serializer):
        self._log(Activity.Verb.UPDATED, serializer.save())

    def perform_destroy(self, instance):
        owner, event_id, title, world = instance.world.owner, instance.id, instance.title, instance.world
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.EVENT,
            target_id=event_id, label=title, world=world,
        )


class EraViewSet(_WorldScopedViewSet):
    queryset = Era.objects.all()
    serializer_class = EraSerializer