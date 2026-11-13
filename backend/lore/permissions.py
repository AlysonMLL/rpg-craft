from rest_framework import permissions
from worlds.permissions import IsWorldOwnerOrReadOnly  


class IsWorldOwnerOrReadOnly(permissions.BasePermission):
    """Leitura para quem enxerga o documento; escrita só para o dono do mundo."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.world.owner_id == request.user.id