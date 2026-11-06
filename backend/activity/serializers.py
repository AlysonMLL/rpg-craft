from rest_framework import serializers

from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    world_name = serializers.CharField(source='world.name', read_only=True, default=None)

    class Meta:
        model = Activity
        fields = [
            'id', 'verb', 'target_type', 'target_id', 'target_label',
            'target_deleted', 'world', 'world_name', 'created_at',
        ]