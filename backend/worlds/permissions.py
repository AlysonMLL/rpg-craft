"""
O que há aqui:
- IsOwnerOrReadOnly: leitura liberada para quem já enxerga o objeto; escrita
  (PUT, PATCH, DELETE) só para o dono.

Função do arquivo: Impedir que um usuário logado edite ou apague o mundo de outra
pessoa, inclusive mundos públicos (is_demo), que qualquer um pode ver.
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id

class IsWorldOwnerOrReadOnly(permissions.BasePermission):
    """Para itens que pertencem a um mundo (obj.world): leitura livre; escrita só do dono."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.world.owner_id == request.user.id