from rest_framework import serializers

from .models import Note, Todo


class _WorldOwnershipMixin:
    """Só permite ligar a nota/tarefa a um mundo do próprio usuário."""

    def validate_world(self, world):
        request = self.context.get('request')
        if world is not None and request and world.owner_id != request.user.id:
            raise serializers.ValidationError('Este mundo não é seu.')
        return world


class NoteSerializer(_WorldOwnershipMixin, serializers.ModelSerializer):
    world_name = serializers.CharField(source='world.name', read_only=True, default=None)

    class Meta:
        model = Note
        fields = [
            'id', 'world', 'world_name', 'title', 'content', 'is_pinned',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class TodoSerializer(_WorldOwnershipMixin, serializers.ModelSerializer):
    world_name = serializers.CharField(source='world.name', read_only=True, default=None)

    class Meta:
        model = Todo
        fields = [
            'id', 'world', 'world_name', 'text', 'is_done', 'priority', 'due_date',
            'position', 'completed_at', 'created_at', 'updated_at',
        ]
        # A posição só muda pela ação /todos/{id}/move/ (ou pelo ciclo concluir/reabrir)
        read_only_fields = ['position', 'completed_at', 'created_at', 'updated_at']