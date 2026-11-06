from django.conf import settings
from django.db import models
from django.utils import timezone


class Activity(models.Model):
    """
    Log de atividade do usuário: alimenta a faixa "Atividade recente" da Home, o
    "última atividade" dos mundos e (no futuro) o filtro de tempo da busca.
    Registrado pelas views (ver activity/services.py), sem signals.
    """

    class Verb(models.TextChoices):
        CREATED = 'created', 'Criou'
        UPDATED = 'updated', 'Editou'
        DELETED = 'deleted', 'Excluiu'

    class Target(models.TextChoices):
        WORLD = 'world', 'Mundo'
        NOTE = 'note', 'Nota'
        TODO = 'todo', 'Tarefa'
        DOCUMENT = 'document', 'Documento'
        # Entram aqui conforme os apps existirem: character, map, location, event...

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities'
    )
    # Mundo ao qual a atividade pertence (para o próprio mundo, ele mesmo). Se o mundo for
    # apagado, o registro continua, só perde o vínculo.
    world = models.ForeignKey(
        'worlds.World', on_delete=models.SET_NULL, null=True, blank=True, related_name='activities'
    )
    verb = models.CharField(max_length=10, choices=Verb.choices)
    target_type = models.CharField(max_length=20, choices=Target.choices)
    target_id = models.PositiveIntegerField()
    # Nome do alvo no momento do registro (continua legível se ele for excluído)
    target_label = models.CharField(max_length=200)
    # True quando o alvo foi excluído: o frontend mostra sem link
    target_deleted = models.BooleanField(default=False)
    # default (e não auto_now_add) para poder "renovar" a data ao juntar edições repetidas
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'activities'
        verbose_name = 'Atividade'
        verbose_name_plural = 'Atividades'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['owner', '-created_at'])]

    def __str__(self):
        return f'{self.get_verb_display()} {self.target_label}'