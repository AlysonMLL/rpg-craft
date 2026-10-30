"""
O que há aqui:
- TagViewSet: Endpoint apenas de leitura para categorias globais, liberado para qualquer pessoa.
- WorldViewSet: CRUD de Mundos. Leitura pública; escrita exige login e ser o dono.
- WorldViewSet.get_queryset(): visitante anônimo (modo convidado) vê só mundos 'is_demo';
  usuário logado vê os próprios mundos mais os 'is_demo'.
- WorldViewSet.perform_create(): Injeta automaticamente o usuário logado como 'owner'
  do mundo no momento de um POST, dispensando o envio desse dado no JSON da requisição.

Função do arquivo: Atuar como a camada de Controladores (Views) da API de Mundos.
Conecta o roteamento HTTP às operações de banco de dados, garantindo as regras de negócio
de isolamento de dados (Multi-tenancy RLS-like no nível da aplicação) e injetando
contexto de autenticação antes de passar os dados para os serializers.
"""

from rest_framework import viewsets, permissions
from django.db.models import Q
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
        serializer.save(owner=self.request.user)
