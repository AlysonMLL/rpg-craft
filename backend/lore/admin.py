from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'world', 'section', 'sort_order', 'updated_at')
    list_filter = ('section',)
    search_fields = ('title', 'content_markdown')