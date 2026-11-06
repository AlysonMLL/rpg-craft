"""
GET/POST /api/documents/?world=ID&section=lore, e GET/PATCH/DELETE /api/documents/{id}/
- Leitura: logado vê documentos dos próprios mundos e de mundos 'is_demo'; visitante, só dos 'is_demo'.
- Escrita: só o dono do mundo. Novo documento vai para o fim da lista da seção.
- Registra a atividade (criou/editou/excluiu) como os demais apps.
"""

from django.db.models import Max, Q
from rest_framework import permissions, viewsets

from activity.models import Activity
from activity.services import log_activity

from .models import Document
from .permissions import IsWorldOwnerOrReadOnly
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsWorldOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Document.objects.select_related('world')
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.filter(Q(world__owner=user) | Q(world__is_demo=True))
        else:
            queryset = queryset.filter(world__is_demo=True)

        world = self.request.query_params.get('world')
        if world and world.isdigit():
            queryset = queryset.filter(world_id=int(world))
        section = self.request.query_params.get('section')
        if section:
            queryset = queryset.filter(section=section)
        return queryset

    def _log(self, verb, document):
        log_activity(
            owner=document.world.owner, verb=verb, target_type=Activity.Target.DOCUMENT,
            target_id=document.id, label=document.title, world=document.world,
        )

    def perform_create(self, serializer):
        world = serializer.validated_data['world']
        section = serializer.validated_data.get('section', Document.Section.LORE)
        last = Document.objects.filter(world=world, section=section).aggregate(last=Max('sort_order'))['last']
        document = serializer.save(sort_order=(last or 0) + 1)
        self._log(Activity.Verb.CREATED, document)

    def perform_update(self, serializer):
        document = serializer.save()
        self._log(Activity.Verb.UPDATED, document)

    def perform_destroy(self, instance):
        owner, document_id, title, world = instance.world.owner, instance.id, instance.title, instance.world
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.DOCUMENT,
            target_id=document_id, label=title, world=world,
        )