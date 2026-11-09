from rest_framework import serializers

# Reaproveita as regras da Linha do Tempo (dono do mundo e tags sem repetição)
from .models import Quest
from .timeline_serializers import _unique_tags, _WorldOwnershipMixin


class QuestSerializer(_WorldOwnershipMixin, serializers.ModelSerializer):
    characters = serializers.ListField(
        child=serializers.CharField(max_length=40), required=False, max_length=20
    )
    locations = serializers.ListField(
        child=serializers.CharField(max_length=40), required=False, max_length=20
    )

    class Meta:
        model = Quest
        fields = [
            'id', 'world', 'title', 'description_markdown', 'status',
            'characters', 'locations', 'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['sort_order', 'created_at', 'updated_at']

    def validate_characters(self, value):
        return _unique_tags(value)

    def validate_locations(self, value):
        return _unique_tags(value)