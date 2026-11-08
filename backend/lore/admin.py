from django.contrib import admin

from .models import Document, Era, Quest, TimelineEvent

@admin.register(Era)
class EraAdmin(admin.ModelAdmin):
    list_display = ('name', 'world', 'start_year', 'end_year')


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'world', 'year', 'month', 'day', 'is_secret')
    list_filter = ('is_secret',)
    search_fields = ('title', 'description')

@admin.register(Quest)
class QuestAdmin(admin.ModelAdmin):
    list_display = ('title', 'world', 'status', 'sort_order', 'updated_at')
    list_filter = ('status',)
    search_fields = ('title', 'description_markdown')