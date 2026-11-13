"""
Função do Arquivo: Tabelas de raças (povos) e criaturas de um mundo. Os campos de lista
(common_in) são texto simples, como as tags da Linha do Tempo; viram relação com Locais quando
essa tela existir. A imagem é só uma URL (upload entra nos extras); image_crop guarda o
enquadramento escolhido, em % da imagem original (null = recorte padrão pelo topo).

O que há aqui:
- Race: povo (resumo, características, cultura, estimativa de vida, origem, comum em).
- Creature: criatura (resumo, características, perigo, faixa de nível, comum em).
  - Creature.Danger: Nenhum, Baixo, Moderado, Alto, Máximo (0 a 4).
- Os dois têm is_favorite (só marca) e display_order (muda só por /reorder/).
"""

from django.db import models


class Race(models.Model):
    world = models.ForeignKey('worlds.World', on_delete=models.CASCADE, related_name='races')
    name = models.CharField(max_length=120)
    image_url = models.URLField(max_length=500, blank=True)
    image_crop = models.JSONField(null=True, blank=True)
    is_favorite = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    summary = models.CharField(max_length=300, blank=True)
    traits = models.TextField(blank=True)
    culture = models.TextField(blank=True)
    life_expectancy = models.CharField(max_length=60, blank=True)
    origin = models.CharField(max_length=160, blank=True)
    common_in = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'races'
        verbose_name = 'Raça'
        verbose_name_plural = 'Raças'
        ordering = ['display_order', 'name', 'id']
        indexes = [models.Index(fields=['world', 'display_order'])]

    def __str__(self):
        return self.name


class Creature(models.Model):
    class Danger(models.IntegerChoices):
        NONE = 0, 'Nenhum'
        LOW = 1, 'Baixo'
        MODERATE = 2, 'Moderado'
        HIGH = 3, 'Alto'
        EXTREME = 4, 'Máximo'

    world = models.ForeignKey('worlds.World', on_delete=models.CASCADE, related_name='creatures')
    name = models.CharField(max_length=120)
    image_url = models.URLField(max_length=500, blank=True)
    image_crop = models.JSONField(null=True, blank=True)
    is_favorite = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    summary = models.CharField(max_length=300, blank=True)
    traits = models.TextField(blank=True)
    danger_level = models.PositiveSmallIntegerField(choices=Danger.choices, default=Danger.NONE)
    level_min = models.PositiveSmallIntegerField(null=True, blank=True)
    level_max = models.PositiveSmallIntegerField(null=True, blank=True)
    common_in = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'creatures'
        verbose_name = 'Criatura'
        verbose_name_plural = 'Criaturas'
        ordering = ['display_order', 'name', 'id']
        indexes = [models.Index(fields=['world', 'display_order'])]

    def __str__(self):
        return self.name