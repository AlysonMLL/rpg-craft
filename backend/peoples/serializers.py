"""
Função do Arquivo: Converte Race e Creature de e para JSON. Cada um tem a versão leve (grade e
filtros) e a completa (gaveta, criar e editar). Regras comuns vêm de worlds.scoped.

O que há aqui:
- RaceSerializer / RaceListSerializer; CreatureSerializer / CreatureListSerializer.
- CreatureSerializer.validate(): o nível máximo não pode ser menor que o mínimo.
"""

from rest_framework import serializers

from worlds.scoped import ImageCropMixin, WorldOwnershipMixin, tag_list, unique_tags

from .models import Creature, Race


class RaceSerializer(ImageCropMixin, WorldOwnershipMixin, serializers.ModelSerializer):
    common_in = tag_list(60, 20)

    class Meta:
        model = Race
        fields = [
            'id', 'world', 'name', 'image_url', 'image_crop', 'is_favorite', 'display_order',
            'summary', 'traits', 'culture', 'life_expectancy', 'origin', 'common_in',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['display_order', 'created_at', 'updated_at']

    def validate_common_in(self, value):
        return unique_tags(value)


class RaceListSerializer(serializers.ModelSerializer):
    """Só o que a grade e os filtros precisam; o resto vem ao abrir a gaveta."""

    class Meta:
        model = Race
        fields = [
            'id', 'world', 'name', 'image_url', 'image_crop', 'is_favorite', 'display_order',
            'summary', 'common_in', 'updated_at',
        ]
        read_only_fields = fields


class CreatureSerializer(ImageCropMixin, WorldOwnershipMixin, serializers.ModelSerializer):
    common_in = tag_list(60, 20)

    class Meta:
        model = Creature
        fields = [
            'id', 'world', 'name', 'image_url', 'image_crop', 'is_favorite', 'display_order',
            'summary', 'traits', 'danger_level', 'level_min', 'level_max', 'common_in',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['display_order', 'created_at', 'updated_at']
        extra_kwargs = {
            'level_min': {'min_value': 0, 'max_value': 999},
            'level_max': {'min_value': 0, 'max_value': 999},
        }

    def validate_common_in(self, value):
        return unique_tags(value)

    def validate(self, attrs):
        low = attrs.get('level_min', getattr(self.instance, 'level_min', None))
        high = attrs.get('level_max', getattr(self.instance, 'level_max', None))
        if low is not None and high is not None and low > high:
            raise serializers.ValidationError(
                {'level_max': 'O nível máximo deve ser igual ou maior que o mínimo.'}
            )
        return attrs


class CreatureListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Creature
        fields = [
            'id', 'world', 'name', 'image_url', 'image_crop', 'is_favorite', 'display_order',
            'summary', 'danger_level', 'level_min', 'level_max', 'common_in', 'updated_at',
        ]
        read_only_fields = fields