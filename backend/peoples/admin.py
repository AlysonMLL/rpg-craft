"""Raças e criaturas editáveis no painel /admin."""

from django.contrib import admin

from .models import Creature, Race


@admin.register(Race)
class RaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'world', 'origin')
    list_filter = ('world',)
    search_fields = ('name', 'summary')


@admin.register(Creature)
class CreatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'world', 'danger_level', 'level_min', 'level_max')
    list_filter = ('world', 'danger_level')
    search_fields = ('name', 'summary')