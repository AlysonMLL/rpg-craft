"""
O que há aqui:
- TagViewSet: Endpoint apenas de leitura para categorias globais, liberado para qualquer pessoa.
- WorldViewSet: CRUD completo de Mundos. Protegido por autenticação.
- WorldViewSet.get_queryset(): Sobrescreve a busca padrão para retornar apenas os mundos 
  onde o 'owner' é igual ao usuário logado no token JWT, ou mundos marcados como 'is_demo'.
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
from .serializers import WorldSerializer, TagSerializer

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    # Tags são públicas, qualquer um pode ver a lista para popular um select no frontend
    permission_classes = [permissions.AllowAny] 

class WorldViewSet(viewsets.ModelViewSet):
    serializer_class = WorldSerializer
    # Exige que o usuário envie um Token JWT válido no cabeçalho (Authorization: Bearer <token>)
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Retorna os mundos que pertencem ao usuário logado OU que são mundos de demonstração pública
        return World.objects.filter(
            Q(owner=user) | Q(is_demo=True)
        ).prefetch_related('tags').select_related('owner').distinct()

    def perform_create(self, serializer):
        # Quando o frontend manda um POST para criar um RPG, o Django atrela o dono automaticamente
        serializer.save(owner=self.request.user)