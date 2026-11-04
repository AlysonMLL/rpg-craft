"""
O que há aqui:
- NoteViewSet e TodoViewSet: CRUD das anotações e tarefas do usuário.
- Visibilidade: logado vê só o que é seu; visitante (modo convidado) vê apenas itens
  ligados a mundos 'is_demo', somente leitura.
- TodoViewSet mantém o ranking (`position`) das tarefas pendentes sem números repetidos:
  nova tarefa vai para o fim; concluir remove a posição e fecha o buraco; reabrir volta
  para o fim; excluir fecha o buraco; POST /todos/{id}/move/ {"position": N} move para N
  e desloca as demais.
"""

from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Note, Todo
from .serializers import NoteSerializer, TodoSerializer


class _OwnedQuerysetMixin:
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            return queryset.filter(owner=user)
        return queryset.filter(world__is_demo=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class NoteViewSet(_OwnedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Note.objects.select_related('world')
    serializer_class = NoteSerializer


def _pending_ordered(owner):
    return Todo.objects.filter(owner=owner, is_done=False).order_by(
        F('position').asc(nulls_last=True), 'id'
    )


def renumber_pending(owner):
    """Renumera as pendentes em 1..n respeitando a ordem atual (sem repetição)."""
    pending = list(_pending_ordered(owner))
    for index, todo in enumerate(pending, start=1):
        todo.position = index
    Todo.objects.bulk_update(pending, ['position'])


class TodoViewSet(_OwnedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Todo.objects.select_related('world')
    serializer_class = TodoSerializer

    def perform_create(self, serializer):
        owner = self.request.user
        if serializer.validated_data.get('is_done'):
            serializer.save(owner=owner, position=None, completed_at=timezone.now())
        else:
            end = Todo.objects.filter(owner=owner, is_done=False).count() + 1
            serializer.save(owner=owner, position=end)
        renumber_pending(owner)

    def perform_update(self, serializer):
        was_done = serializer.instance.is_done
        todo = serializer.save()
        if todo.is_done != was_done:
            if todo.is_done:
                todo.position, todo.completed_at = None, timezone.now()
            else:
                todo.position, todo.completed_at = 10**9, None  # vai para o fim
            todo.save(update_fields=['position', 'completed_at'])
        renumber_pending(todo.owner)

    def perform_destroy(self, instance):
        owner = instance.owner
        instance.delete()
        renumber_pending(owner)

    @action(detail=True, methods=['post'], url_path='move')
    def move(self, request, pk=None):
        todo = self.get_object()
        if todo.is_done:
            return Response(
                {'detail': 'Tarefas concluídas não têm posição.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        target = request.data.get('position')
        if not isinstance(target, int) or isinstance(target, bool) or target < 1:
            return Response(
                {'detail': 'Envie "position" como um número inteiro a partir de 1.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            others = [
                t for t in _pending_ordered(todo.owner).select_for_update() if t.pk != todo.pk
            ]
            index = min(target, len(others) + 1) - 1
            others.insert(index, todo)
            for position, item in enumerate(others, start=1):
                item.position = position
            Todo.objects.bulk_update(others, ['position'])

        return Response(self.get_serializer(todo).data)