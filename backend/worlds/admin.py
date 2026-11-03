from django.contrib import admin
from .models import World, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)} # Preenche o slug automaticamente ao digitar o nome

@admin.register(World)
class WorldAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_demo', 'is_favorite', 'display_order', 'created_at')
    list_filter = ('is_demo', 'is_favorite', 'tags')
    search_fields = ('name', 'synopsis')
