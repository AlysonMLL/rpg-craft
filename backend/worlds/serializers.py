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
    characters_count = serializers.SerializerMethodField()
    races_count = serializers.SerializerMethodField()
    creatures_count = serializers.SerializerMethodField()

    class Meta:
        model = World
        fields = [
            'id',
            'name',
            'cover_image',
            'synopsis',
            'introduction_markdown',
            'is_demo',
            'is_favorite',
            'display_order',
            'created_at',
            'updated_at',
            'last_activity_at',
            'calendar_era_name',
            'now_year',
            'now_month',
            'now_day',
            'owner_name',
            'is_owner',
            'tags',
            'tag_ids',
            'characters_count',
            'races_count',
            'creatures_count',
            'is_owner',
        ]
        # A ordem só muda pelo endpoint /worlds/reorder/ e a atividade pelo log
        read_only_fields = ['display_order', 'updated_at', 'last_activity_at']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return bool(
            request
            and request.user.is_authenticated
            and obj.owner_id == request.user.id
        )

    def _count(self, obj, annotated, related):
        value = getattr(obj, annotated, None)  # vem da listagem/detalhe (subconsulta)
        return value if value is not None else getattr(obj, related).count()

    def get_characters_count(self, obj):
        return self._count(obj, 'characters_count', 'characters')

    def get_races_count(self, obj):
        return self._count(obj, 'races_count', 'races')

    def get_creatures_count(self, obj):
        return self._count(obj, 'creatures_count', 'creatures')