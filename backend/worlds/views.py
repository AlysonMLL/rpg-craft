"""
O que há aqui:
- TagViewSet: Endpoint apenas de leitura para categorias globais, liberado para qualquer pessoa.
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
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from activity.models import Activity
from activity.services import log_activity

from .models import World, Tag
from .permissions import IsOwnerOrReadOnly
from .serializers import WorldSerializer, TagSerializer


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    # Tags são públicas, qualquer um pode ver a lista para popular um select no frontend
    permission_classes = [permissions.AllowAny]


class WorldViewSet(viewsets.ModelViewSet):
    serializer_class = WorldSerializer
    # Visitante só lê; para escrever é preciso estar logado E ser o dono do mundo
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = World.objects.prefetch_related('tags').select_related('owner')

        # Modo convidado (sem token): apenas mundos de demonstração pública
        if not user.is_authenticated:
            return queryset.filter(is_demo=True)

        # Logado: os próprios mundos OU os mundos de demonstração pública
        return queryset.filter(Q(owner=user) | Q(is_demo=True)).distinct()

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