"""
Função do Arquivo: Endpoints de raças e criaturas.
GET/POST /api/races/?world=ID e /api/creatures/?world=ID; GET/PATCH/DELETE em /{id}/;
POST /{recurso}/reorder/. Mesmas regras de acesso, log e ordem dos personagens
(tudo vem de worlds.scoped.OrderedWorldViewSet).
"""

from activity.models import Activity
from worlds.scoped import OrderedWorldViewSet

from .models import Creature, Race
from .serializers import (
    CreatureListSerializer, CreatureSerializer, RaceListSerializer, RaceSerializer,
)


class RaceViewSet(OrderedWorldViewSet):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    list_serializer_class = RaceListSerializer
    activity_target = Activity.Target.RACE


class CreatureViewSet(OrderedWorldViewSet):
    queryset = Creature.objects.all()
    serializer_class = CreatureSerializer
    list_serializer_class = CreatureListSerializer
    activity_target = Activity.Target.CREATURE