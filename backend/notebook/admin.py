from django.contrib import admin

from .models import Note, Todo


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'world', 'is_pinned', 'updated_at')
    list_filter = ('is_pinned',)
    search_fields = ('title', 'content')


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('text', 'owner', 'world', 'priority', 'due_date', 'is_done', 'position')
    list_filter = ('is_done', 'priority')
    search_fields = ('text',)