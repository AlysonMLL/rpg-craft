"""
Função do Arquivo: Deixa os personagens editáveis no painel /admin.
O que há aqui: CharacterAdmin (lista com mundo, status e raça; busca por nome).
"""

from django.contrib import admin

from .models import Character


@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ('name', 'world', 'status', 'race', 'level')
    list_filter = ('world', 'status')
    search_fields = ('name', 'race', 'role')