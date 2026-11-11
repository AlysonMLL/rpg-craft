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

from rest_framework import serializers

from lore.timeline_serializers import _unique_tags, _WorldOwnershipMixin

from .models import Character


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
            'id', 'world', 'name', 'portrait_url', 'status', 'is_favorite', 'display_order',
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


class CharacterListSerializer(serializers.ModelSerializer):
    """Só o que a grade e os filtros precisam; o resto vem ao abrir a gaveta."""

    class Meta:
        model = Character
        fields = [
            'id', 'world', 'name', 'portrait_url', 'status', 'is_favorite', 'display_order',
            'role', 'race', 'classes', 'level', 'organizations', 'updated_at',
        ]
        read_only_fields = fields