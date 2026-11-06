from django.contrib import admin

from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('target_label', 'verb', 'target_type', 'owner', 'world', 'target_deleted', 'created_at')
    list_filter = ('verb', 'target_type', 'target_deleted')
    search_fields = ('target_label',)