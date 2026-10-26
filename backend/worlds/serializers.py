from rest_framework import serializers
from .models import World, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class WorldSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(),
        source='tags', write_only=True, required=False
    )
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = World
        fields = ['id', 'name', 'cover_image', 'synopsis', 'introduction_markdown',
                  'is_demo', 'display_order', 'created_at', 'owner_name',
                  'is_owner', 'tags', 'tag_ids']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.owner_id == request.user.id)