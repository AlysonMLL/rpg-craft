from django.contrib import admin
from .models import World, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)} # Preenche o slug automaticamente ao digitar o nome

@admin.register(World)
class WorldAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_demo', 'created_at')
    list_filter = ('is_demo', 'tags')
    search_fields = ('name', 'synopsis')