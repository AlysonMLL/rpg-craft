from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'world', 'section', 'title', 'content_markdown',
            'sort_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['sort_order', 'created_at', 'updated_at']

    def validate_world(self, world):
        request = self.context.get('request')
        if request and world.owner_id != request.user.id:
            raise serializers.ValidationError('Este mundo não é seu.')
        if self.instance and self.instance.world_id != world.id:
            raise serializers.ValidationError('Não é possível mover o documento para outro mundo.')
        return world