from django.conf import settings
from django.db import models


class Note(models.Model):
    """Anotação rápida em Markdown. O mundo é opcional (nota "solta" do mestre)."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes'
    )
    # Se o mundo for apagado, a nota continua existindo (fica sem mundo)
    world = models.ForeignKey(
        'worlds.World', on_delete=models.SET_NULL, null=True, blank=True, related_name='notes'
    )
    title = models.CharField(max_length=120)
    content = models.TextField(blank=True)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notes'
        verbose_name = 'Nota'
        verbose_name_plural = 'Notas'
        ordering = ['-is_pinned', '-updated_at']

    def __str__(self):
        return self.title


class Todo(models.Model):
    """
    Tarefa. `position` é o ranking entre as tarefas PENDENTES do usuário (1, 2, 3...),
    sem repetição; tarefas concluídas ficam sem posição (null). Quem mantém isso
    consistente é a view (renumeração ao criar, concluir, reabrir, excluir e mover).
    """

    class Priority(models.IntegerChoices):
        LOW = 0, 'Baixa'
        MEDIUM = 1, 'Média'
        HIGH = 2, 'Alta'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='todos'
    )
    world = models.ForeignKey(
        'worlds.World', on_delete=models.SET_NULL, null=True, blank=True, related_name='todos'
    )
    text = models.CharField(max_length=200)
    is_done = models.BooleanField(default=False)
    priority = models.PositiveSmallIntegerField(
        choices=Priority.choices, default=Priority.MEDIUM
    )
    due_date = models.DateField(null=True, blank=True)
    position = models.PositiveIntegerField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'todos'
        verbose_name = 'Tarefa'
        verbose_name_plural = 'Tarefas'
        ordering = ['is_done', 'position', '-created_at']
        indexes = [models.Index(fields=['owner', 'is_done', 'position'])]

    def __str__(self):
        return self.text