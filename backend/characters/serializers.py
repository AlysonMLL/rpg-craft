"""
Função do Arquivo: Converte Character de e para JSON na API.
Há duas versões: uma leve para a grade (sem os textos longos) e a completa para a
gaveta e para criar/editar. Reaproveita as regras do app lore (só o dono escreve no
próprio mundo; tags sem repetição).

O que há ali:
- _tag_list(): cria um campo de lista de textos com limites (usado nas 4 listas).
- CharacterSerializer: versão completa (leitura e escrita). display_order é só leitura
  (muda apenas pelo endpoint de reordenar); is_favorite é gravável.
- CharacterListSerializer: versão leve, só leitura, usada em GET /characters/?world=.
"""

from django.db.models import Q
from rest_framework import serializers

from lore.timeline_serializers import _unique_tags, _WorldOwnershipMixin

from .models import Character, Relationship


def _tag_list(item_length, max_items):
    return serializers.ListField(
        child=serializers.CharField(max_length=item_length), required=False, max_length=max_items
    )


class CharacterSerializer(_WorldOwnershipMixin, serializers.ModelSerializer):
    classes = _tag_list(40, 20)
    organizations = _tag_list(60, 20)
    items = _tag_list(80, 60)
    skills = _tag_list(80, 60)

    class Meta:
        model = Character
        fields = [
            'id', 'world', 'name', 'portrait_url', 'portrait_crop', 'status', 'is_favorite', 'display_order',
            'age', 'gender', 'race', 'classes', 'level', 'height',
            'appearance', 'voice',
            'role', 'origin', 'organizations',
            'items', 'skills', 'secrets', 'sheet_markdown',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['display_order', 'created_at', 'updated_at']
        extra_kwargs = {'level': {'min_value': 0, 'max_value': 999}}

    def validate_classes(self, value):
        return _unique_tags(value)

    def validate_organizations(self, value):
        return _unique_tags(value)

    def validate_items(self, value):
        return _unique_tags(value)

    def validate_skills(self, value):
        return _unique_tags(value)

    def validate_portrait_crop(self, value):
        if value is None:
            return None
        keys = {'x', 'y', 'width', 'height'}
        if not isinstance(value, dict) or set(value) != keys:
            raise serializers.ValidationError('Envie x, y, width e height (em porcentagem).')
        numbers = {}
        for key in keys:
            number = value[key]
            if isinstance(number, bool) or not isinstance(number, (int, float)):
                raise serializers.ValidationError('Os valores do enquadramento precisam ser números.')
            numbers[key] = round(float(number), 2)
        inside = (
            numbers['x'] >= 0 and numbers['y'] >= 0
            and numbers['width'] >= 1 and numbers['height'] >= 1
            and numbers['x'] + numbers['width'] <= 100.5
            and numbers['y'] + numbers['height'] <= 100.5
        )
        if not inside:
            raise serializers.ValidationError('O enquadramento precisa estar dentro da imagem.')
        return numbers

    def update(self, instance, validated_data):
        # Trocou a URL sem mandar um enquadramento novo: o antigo não vale mais
        new_url = validated_data.get('portrait_url')
        if new_url is not None and new_url != instance.portrait_url and 'portrait_crop' not in validated_data:
            validated_data['portrait_crop'] = None
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        # Só o dono do mundo recebe os segredos (convidado de mundo demo recebe vazio)
        if not request or request.user.id != instance.world.owner_id:
            data['secrets'] = ''
        return data

class CharacterListSerializer(serializers.ModelSerializer):
    """Só o que a grade e os filtros precisam; o resto vem ao abrir a gaveta."""

    class Meta:
        model = Character
        fields = [
            'id', 'world', 'name', 'portrait_url', 'portrait_crop', 'status', 'is_favorite', 'display_order',
            'role', 'race', 'classes', 'level', 'organizations', 'updated_at',
        ]
        read_only_fields = fields

class RelationshipSerializer(_WorldOwnershipMixin, serializers.ModelSerializer):
    """Relação entre dois personagens. As regras de duplicidade são checadas em validate()
    (com mensagens em português), por isso os validadores automáticos ficam desligados."""

    class Meta:
        model = Relationship
        fields = [
            'id', 'world', 'source', 'target', 'kind', 'label', 'reverse_label',
            'is_mutual', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        validators = []

    def validate(self, attrs):
        def pick(name):
            return attrs.get(name, getattr(self.instance, name, None))

        world, source, target, kind = pick('world'), pick('source'), pick('target'), pick('kind')

        if source.id == target.id:
            raise serializers.ValidationError({'target': 'Escolha dois personagens diferentes.'})
        if source.world_id != world.id or target.world_id != world.id:
            raise serializers.ValidationError('Os dois personagens precisam ser deste mundo.')

        clash = Relationship.objects.filter(world=world, kind=kind).filter(
            Q(source=source, target=target) | Q(source=target, target=source)
        )
        if self.instance:
            clash = clash.exclude(pk=self.instance.pk)
        if clash.exists():
            raise serializers.ValidationError(
                {'kind': 'Já existe uma relação deste tipo entre esses dois personagens.'}
            )
        return attrs