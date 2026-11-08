from django.contrib import admin

from .models import Document, Era, TimelineEvent

@admin.register(Era)
class EraAdmin(admin.ModelAdmin):
    list_display = ('name', 'world', 'start_year', 'end_year')


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'world', 'year', 'month', 'day', 'is_secret')
    list_filter = ('is_secret',)
    search_fields = ('title', 'description')