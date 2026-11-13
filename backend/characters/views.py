"""
Função do Arquivo: Endpoints dos personagens e das relações.
GET/POST /api/characters/?world=ID, GET/PATCH/DELETE /api/characters/{id}/ e
POST /api/characters/reorder/ (corpo: {"world": ID, "ids": [...]}).
- Leitura: logado vê os próprios mundos e os 'is_demo'; visitante, só os 'is_demo'.
- Escrita: só o dono do mundo.
- A lista devolve a versão leve (sem textos longos); o detalhe devolve a ficha completa.
- Criar, editar e excluir entram no log de atividade (edições em 10 min viram uma só).
  Favoritar e reordenar NÃO entram no log.

O que há aqui:
- CharacterViewSet: só configura a base worlds.scoped.OrderedWorldViewSet (serializers e alvo do log).
- RelationshipViewSet: CRUD das relações entre personagens (sem log de atividade).
"""

from activity.models import Activity
from worlds.scoped import OrderedWorldViewSet, WorldScopedViewSet

from .models import Relationship, Character
from .serializers import CharacterListSerializer, CharacterSerializer, RelationshipSerializer


class CharacterViewSet(OrderedWorldViewSet):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer
    list_serializer_class = CharacterListSerializer
    activity_target = Activity.Target.CHARACTER


class RelationshipViewSet(WorldScopedViewSet):
    """
    GET/POST /api/relationships/?world=ID e GET/PATCH/DELETE /api/relationships/{id}/.
    Mesmas regras de acesso dos personagens. Não entra no log de atividade (são muitas e pequenas).
    Excluir um personagem apaga as relações dele (CASCADE).
    """

    queryset = Relationship.objects.select_related('source', 'target')
    serializer_class = RelationshipSerializer