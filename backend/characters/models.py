"""
Função do Arquivo: Define a tabela de personagens de um mundo (a ficha do personagem).
Os campos seguem as seções da ficha rápida (Identidade, Aparência e voz, Narrativa,
Itens e habilidades, Segredos) mais a ficha completa em Markdown. Raça, papel,
organizações, classes, itens e habilidades são texto simples por enquanto (sem vínculo
com outros apps), igual às tags da Linha do Tempo.

O que há ali:
- Character: o modelo.
  - Character.Status: Vivo, Morto, Desaparecido, Desconhecido.
  - is_favorite: estrela do card (só marca, não muda a ordem).
  - display_order: posição na ordem personalizada (arrastar); muda só por /characters/reorder/.
  - Campos de texto curtos (idade, gênero, altura...) são CharField porque aceitam
    valores livres como "~300 anos" ou "Desconhecida".
  - Campos de lista (classes, organizations, items, skills) são JSONField com lista de textos.
  - secrets: texto "só do mestre" (a tela mostra borrado, com olho para revelar).
  - sheet_markdown: ficha completa em Markdown (aba "Ficha completa" da gaveta).
"""

from django.db import models


class Character(models.Model):
    class Status(models.TextChoices):
        ALIVE = 'alive', 'Vivo'
        DEAD = 'dead', 'Morto'
        MISSING = 'missing', 'Desaparecido'
        UNKNOWN = 'unknown', 'Desconhecido'

    world = models.ForeignKey('worlds.World', on_delete=models.CASCADE, related_name='characters')
    name = models.CharField(max_length=120)
    # Retrato: por enquanto só uma URL; o upload de imagens entra no final do projeto
    portrait_url = models.URLField(max_length=500, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ALIVE)
    is_favorite = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    # Identidade
    age = models.CharField(max_length=40, blank=True)
    gender = models.CharField(max_length=40, blank=True)
    race = models.CharField(max_length=60, blank=True)
    classes = models.JSONField(default=list, blank=True)
    level = models.PositiveSmallIntegerField(null=True, blank=True)
    height = models.CharField(max_length=40, blank=True)

    # Aparência e voz
    appearance = models.TextField(blank=True)
    voice = models.TextField(blank=True)

    # Narrativa
    role = models.CharField(max_length=60, blank=True)
    origin = models.CharField(max_length=160, blank=True)
    organizations = models.JSONField(default=list, blank=True)

    # Itens e habilidades (itens só existem aqui, na ficha)
    items = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)

    # Só do mestre
    secrets = models.TextField(blank=True)

    # Ficha completa (.md)
    sheet_markdown = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'characters'
        verbose_name = 'Personagem'
        verbose_name_plural = 'Personagens'
        ordering = ['display_order', 'name', 'id']
        indexes = [models.Index(fields=['world', 'display_order'])]

    def __str__(self):
        return self.name