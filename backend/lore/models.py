from django.db import models


class Document(models.Model):
    """
    Documento em Markdown de um mundo (lore, notas de personagens, de mapas, de povos...).
    Tabela genérica: a mesma estrutura serve a todas as telas do mundo, separada por `section`.
    """

    class Section(models.TextChoices):
        LORE = 'lore', 'História'
        CHARACTERS = 'characters', 'Personagens'
        MAPS = 'maps', 'Mapas'
        PEOPLES = 'peoples', 'Raças e Criaturas'

    world = models.ForeignKey('worlds.World', on_delete=models.CASCADE, related_name='documents')
    section = models.CharField(max_length=20, choices=Section.choices, default=Section.LORE)
    title = models.CharField(max_length=160)
    content_markdown = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        ordering = ['sort_order', 'id']
        indexes = [models.Index(fields=['world', 'section', 'sort_order'])]

    def __str__(self):
        return self.title