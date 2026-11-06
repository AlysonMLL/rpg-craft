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

from activity.models import Activity
from activity.services import log_activity

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

    def _log(self, verb, note):
        log_activity(
            owner=note.owner, verb=verb, target_type=Activity.Target.NOTE,
            target_id=note.id, label=note.title, world=note.world,
        )

    def perform_create(self, serializer):
        note = serializer.save(owner=self.request.user)
        self._log(Activity.Verb.CREATED, note)

    def perform_update(self, serializer):
        note = serializer.save()
        # Só fixar/desafixar não conta como atividade
        if set(serializer.validated_data) - {'is_pinned'}:
            self._log(Activity.Verb.UPDATED, note)

    def perform_destroy(self, instance):
        # Guarda os dados antes de excluir (o id some depois do delete)
        owner, note_id, title, world = instance.owner, instance.id, instance.title, instance.world
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.NOTE,
            target_id=note_id, label=title, world=world,
        )


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

    def _log(self, verb, todo):
        log_activity(
            owner=todo.owner, verb=verb, target_type=Activity.Target.TODO,
            target_id=todo.id, label=todo.text, world=todo.world,
        )

    def perform_create(self, serializer):
        owner = self.request.user
        if serializer.validated_data.get('is_done'):
            todo = serializer.save(owner=owner, position=None, completed_at=timezone.now())
        else:
            end = Todo.objects.filter(owner=owner, is_done=False).count() + 1
            todo = serializer.save(owner=owner, position=end)
        renumber_pending(owner)
        self._log(Activity.Verb.CREATED, todo)

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
        self._log(Activity.Verb.UPDATED, todo)

    def perform_destroy(self, instance):
        owner, todo_id, text, world = instance.owner, instance.id, instance.text, instance.world
        instance.delete()
        renumber_pending(owner)
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=Activity.Target.TODO,
            target_id=todo_id, label=text, world=world,
        )

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