"""
Função do Arquivo: Converte Activity em JSON para a faixa "Atividade recente".
O que há ali:
- ActivitySerializer: campos do log + world_name + target_section (só para documentos:
  em qual seção ele vive, para o front montar o link certo; vem do contexto da view).
"""

from rest_framework import serializers

from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    world_name = serializers.CharField(source='world.name', read_only=True, default=None)
    target_section = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'verb', 'target_type', 'target_id', 'target_label',
            'target_deleted', 'target_section', 'world', 'world_name', 'created_at',
        ]

    def get_target_section(self, obj):
        if obj.target_type != Activity.Target.DOCUMENT:
            return None
        return self.context.get('document_sections', {}).get(obj.target_id)