"""
Função do Arquivo: Peças comuns dos endpoints "de um mundo" (eventos, missões, personagens,
raças, criaturas...). Antes viviam em lore, com nome privado; agora ficam aqui para qualquer
app usar sem importar de outro app de conteúdo.

O que há aqui:
- WorldOwnershipMixin: serializer que só deixa criar no próprio mundo e não move para outro.
- unique_tags(): tira repetidas (sem diferenciar maiúsculas), mantendo a primeira grafia e a ordem.
- tag_list(): campo de lista de textos com limites (tamanho do item e quantidade).
- clean_crop(): valida um enquadramento de imagem ({x, y, width, height} em % da imagem).
- ImageCropMixin: serializer com image_url + image_crop; zera o enquadramento ao trocar a URL.
- WorldScopedViewSet: acesso por mundo (dono vê o seu + is_demo; visitante só is_demo; escreve
  só o dono; filtro ?world=ID).
- OrderedWorldViewSet: o padrão de personagens/raças/criaturas: lista leve, ordem personalizada
  (display_order), favorito, log de atividade e POST reorder/ (corpo: {"world": ID, "ids": [...]}).
  Favoritar e reordenar não entram no log.
"""

from django.db.models import Max, Q
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from activity.models import Activity
from activity.services import log_activity

from .models import World
from .permissions import IsWorldOwnerOrReadOnly


class WorldOwnershipMixin:
    """Só permite criar no próprio mundo e não deixa mover para outro mundo."""

    def validate_world(self, world):
        request = self.context.get('request')
        if request and world.owner_id != request.user.id:
            raise serializers.ValidationError('Este mundo não é seu.')
        if self.instance and self.instance.world_id != world.id:
            raise serializers.ValidationError('Não é possível mover para outro mundo.')
        return world


def unique_tags(tags):
    """Tira repetidas (sem diferenciar maiúsculas) mantendo a primeira grafia e a ordem."""
    seen, result = set(), []
    for tag in tags:
        tag = ' '.join(tag.split())
        if tag and tag.casefold() not in seen:
            seen.add(tag.casefold())
            result.append(tag)
    return result

def viewer_is_owner(context, world):
    """True se quem faz a requisição é o dono do mundo (visitante e outros logados: False)."""
    request = context.get('request')
    user = getattr(request, 'user', None)
    return bool(user and user.is_authenticated and user.id == world.owner_id)


class OwnerOnlyFieldsMixin:
    """
    Esvazia, para quem não é dono do mundo, os campos listados em owner_only_fields (ex.: segredos
    do mestre). O blur da interface é só visual: sem isto o texto vai no JSON para qualquer
    visitante de mundo demo. Deve vir ANTES dos outros mixins na lista de bases.
    """

    owner_only_fields = ()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not viewer_is_owner(self.context, instance.world):
            for name in self.owner_only_fields:
                if name in data:
                    data[name] = ''
        return data

def tag_list(item_length, max_items):
    return serializers.ListField(
        child=serializers.CharField(max_length=item_length), required=False, max_length=max_items
    )


_CROP_KEYS = {'x', 'y', 'width', 'height'}


def clean_crop(value):
    """Enquadramento de imagem em % da imagem original, ou None (sem enquadramento)."""
    if value is None:
        return None
    if not isinstance(value, dict) or set(value) != _CROP_KEYS:
        raise serializers.ValidationError('Envie x, y, width e height (em porcentagem).')
    numbers = {}
    for key in _CROP_KEYS:
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


class ImageCropMixin:
    """
    Para serializers com uma URL de imagem e seu enquadramento. Valida o enquadramento e,
    se a URL mudar sem um enquadramento novo, apaga o antigo (ele não vale para outra imagem).
    Por padrão os campos são image_url / image_crop; troque nos atributos da classe.
    """

    image_url_field = 'image_url'
    image_crop_field = 'image_crop'

    def validate_image_crop(self, value):
        return clean_crop(value)

    def update(self, instance, validated_data):
        url_key, crop_key = self.image_url_field, self.image_crop_field
        new_url = validated_data.get(url_key)
        if new_url is not None and new_url != getattr(instance, url_key) and crop_key not in validated_data:
            validated_data[crop_key] = None
        return super().update(instance, validated_data)


class WorldScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsWorldOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset().select_related('world')
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.filter(Q(world__owner=user) | Q(world__is_demo=True))
        else:
            queryset = queryset.filter(world__is_demo=True)
        world = self.request.query_params.get('world')
        if world and world.isdigit():
            queryset = queryset.filter(world_id=int(world))
        return queryset


class OrderedWorldViewSet(WorldScopedViewSet):
    """
    Base de personagens, raças e criaturas. Quem herda define:
    - queryset e serializer_class (versão completa);
    - list_serializer_class (versão leve da grade; opcional);
    - activity_target (Activity.Target.X);
    - label_field (campo usado como nome no log; padrão "name").
    O modelo precisa ter world, display_order e is_favorite.
    """

    activity_target = None
    list_serializer_class = None
    label_field = 'name'

    def get_serializer_class(self):
        if self.action == 'list' and self.list_serializer_class is not None:
            return self.list_serializer_class
        return super().get_serializer_class()

    def _log(self, verb, instance):
        log_activity(
            owner=instance.world.owner, verb=verb, target_type=self.activity_target,
            target_id=instance.id, label=getattr(instance, self.label_field), world=instance.world,
        )

    def perform_create(self, serializer):
        world = serializer.validated_data['world']
        last = self.queryset.model.objects.filter(world=world).aggregate(last=Max('display_order'))['last']
        instance = serializer.save(display_order=0 if last is None else last + 1)
        self._log(Activity.Verb.CREATED, instance)

    def perform_update(self, serializer):
        only_favorite = set(serializer.validated_data) == {'is_favorite'}
        instance = serializer.save()
        if not only_favorite:
            self._log(Activity.Verb.UPDATED, instance)

    def perform_destroy(self, instance):
        owner, pk, label, world = (
            instance.world.owner, instance.id, getattr(instance, self.label_field), instance.world,
        )
        instance.delete()
        log_activity(
            owner=owner, verb=Activity.Verb.DELETED, target_type=self.activity_target,
            target_id=pk, label=label, world=world,
        )

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        world_id = request.data.get('world')
        ids = request.data.get('ids')
        valid_ids = (
            isinstance(ids, list)
            and all(isinstance(i, int) and not isinstance(i, bool) for i in ids)
            and len(set(ids)) == len(ids)
        )
        if not valid_ids or not str(world_id).isdigit():
            return Response(
                {'detail': 'Envie "world" e "ids" (lista de números sem repetição).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        world = World.objects.filter(pk=int(world_id)).first()
        if world is None or world.owner_id != request.user.id:
            return Response({'detail': 'Este mundo não é seu.'}, status=status.HTTP_403_FORBIDDEN)

        model = self.queryset.model
        items = list(model.objects.filter(world=world))  # já vem na ordem atual
        by_id = {item.id: item for item in items}
        if any(i not in by_id for i in ids):
            return Response(
                {'detail': 'Há itens que não pertencem a este mundo.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        listed = set(ids)
        ordered = [by_id[i] for i in ids] + [item for item in items if item.id not in listed]
        for position, item in enumerate(ordered):
            item.display_order = position
        model.objects.bulk_update(ordered, ['display_order'])
        return Response(status=status.HTTP_204_NO_CONTENT)