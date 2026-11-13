from rest_framework import serializers
from worlds.scoped import WorldOwnershipMixin as _WorldOwnershipMixin  # noqa: F401
from worlds.scoped import unique_tags as _unique_tags  # noqa: F401

from .models import Era, TimelineEvent


class _WorldOwnershipMixin:
    """Só permite criar no próprio mundo e não deixa mover para outro mundo."""

    # def validate_world(self, world):
    #     request = self.context.get('request')
    #     if request and world.owner_id != request.user.id:
    #         raise serializers.ValidationError('Este mundo não é seu.')
    #     if self.instance and self.instance.world_id != world.id:
    #         raise serializers.ValidationError('Não é possível mover para outro mundo.')
    #     return world


# def _unique_tags(tags):
#     """Tira repetidas (sem diferenciar maiúsculas) mantendo a primeira grafia e a ordem."""
#     seen, result = set(), []
#     for tag in tags:
#         tag = ' '.join(tag.split())
#         if tag and tag.casefold() not in seen:
#             seen.add(tag.casefold())
#             result.append(tag)
#     return result


class TimelineEventSerializer(_WorldOwnershipMixin, serializers.ModelSerializer):
    characters = serializers.ListField(
        child=serializers.CharField(max_length=40), required=False, max_length=20
    )
    locations = serializers.ListField(
        child=serializers.CharField(max_length=40), required=False, max_length=20
    )

    class Meta:
        model = TimelineEvent
        fields = [
            'id', 'world', 'title', 'description', 'year', 'month', 'day', 'date_label',
            'characters', 'locations', 'is_secret', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'month': {'min_value': 1, 'max_value': 999},
            'day': {'min_value': 1, 'max_value': 999},
        }

    def validate_characters(self, value):
        return _unique_tags(value)

    def validate_locations(self, value):
        return _unique_tags(value)

    def validate(self, attrs):
        month = attrs.get('month', getattr(self.instance, 'month', None))
        day = attrs.get('day', getattr(self.instance, 'day', None))
        if day is not None and month is None:
            raise serializers.ValidationError({'day': 'Informe o mês antes do dia.'})
        return attrs


class EraSerializer(_WorldOwnershipMixin, serializers.ModelSerializer):
    class Meta:
        model = Era
        fields = ['id', 'world', 'name', 'start_year', 'end_year']

    def validate(self, attrs):
        start = attrs.get('start_year', getattr(self.instance, 'start_year', None))
        end = attrs.get('end_year', getattr(self.instance, 'end_year', None))
        if start is not None and end is not None and start > end:
            raise serializers.ValidationError({'end_year': 'O ano final deve ser igual ou maior que o inicial.'})
        return attrs