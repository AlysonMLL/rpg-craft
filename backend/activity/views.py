"""
GET /api/activity/?limit=10&world=3
- Logado: as atividades do próprio usuário.
- Visitante (modo convidado): só as de mundos 'is_demo'.
- limit: de 1 a 50 (padrão 10). world: filtra por mundo.
"""

from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Activity
from .serializers import ActivitySerializer


class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.AllowAny]  # o conteúdo já é filtrado por usuário
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        queryset = Activity.objects.select_related('world')
        if user.is_authenticated:
            queryset = queryset.filter(owner=user)
        else:
            queryset = queryset.filter(world__is_demo=True)

        world = self.request.query_params.get('world')
        if world and world.isdigit():
            queryset = queryset.filter(world_id=int(world))
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            limit = int(request.query_params.get('limit', 10))
        except ValueError:
            limit = 10
        limit = max(1, min(limit, 50))
        activities = self.get_queryset().order_by('-created_at')[:limit]
        return Response(self.get_serializer(activities, many=True).data)