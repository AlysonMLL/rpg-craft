from rest_framework import serializers
from .models import World, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class WorldSerializer(serializers.ModelSerializer):
    # Leitura: devolve os dados completos das tags, e não apenas o ID numérico
    tags = TagSerializer(many=True, read_only=True)
    # Escrita: o frontend envia só os IDs em 'tag_ids' (ex: [1, 3])
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        source='tags',
        write_only=True,
        required=False,
    )
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    # True quando o mundo pertence a quem fez a requisição (false para visitantes)
    is_owner = serializers.SerializerMethodField()

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
            'is_owner',
            'tags',
            'tag_ids',
        ]

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return bool(
            request
            and request.user.is_authenticated
            and obj.owner_id == request.user.id
        )