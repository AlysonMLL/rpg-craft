from rest_framework import serializers
from .models import World, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class WorldSerializer(serializers.ModelSerializer):
    # Aninha o TagSerializer para que o JSON devolva os dados da tag, e não apenas o ID numérico
    tags = TagSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = World
        fields = [
            'id', 
            'name', 
            'cover_image', 
            'synopsis', 
            'introduction_markdown', 
            'is_demo', 
            'display_order', 
            'created_at', 
            'owner_name', 
            'tags'
        ]