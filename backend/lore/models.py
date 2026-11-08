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


class Era(models.Model):
    """Faixa de anos da Linha do Tempo ("Era das Estrelas · Anos 0–140"). Os eventos entram na primeira era que contém o ano."""

    world = models.ForeignKey('worlds.World', on_delete=models.CASCADE, related_name='eras')
    name = models.CharField(max_length=80)
    start_year = models.IntegerField()
    end_year = models.IntegerField()

    class Meta:
        db_table = 'eras'
        verbose_name = 'Era'
        verbose_name_plural = 'Eras'
        ordering = ['start_year', 'id']

    def __str__(self):
        return self.name


class TimelineEvent(models.Model):
    """
    Evento da Linha do Tempo. Data no calendário do mundo: ano obrigatório, mês e dia
    opcionais, mais um rótulo livre para datas vagas ("Antes da Queda"). Ordena por ano,
    mês e dia (vazio vem antes); empate, pela criação. Personagens e locais são tags de texto
    simples (sem vínculo com fichas, por decisão de projeto).
    """

    world = models.ForeignKey('worlds.World', on_delete=models.CASCADE, related_name='timeline_events')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    year = models.IntegerField()
    month = models.PositiveSmallIntegerField(null=True, blank=True)
    day = models.PositiveSmallIntegerField(null=True, blank=True)
    date_label = models.CharField(max_length=80, blank=True)
    characters = models.JSONField(default=list, blank=True)
    locations = models.JSONField(default=list, blank=True)
    # "Só do mestre": a tela mostra borrado, com olho para revelar
    is_secret = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'timeline_events'
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'
        ordering = [
            'year',
            models.F('month').asc(nulls_first=True),
            models.F('day').asc(nulls_first=True),
            'id',
        ]
        indexes = [models.Index(fields=['world', 'year'])]

    def __str__(self):
        return self.title
    