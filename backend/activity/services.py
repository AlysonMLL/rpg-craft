"""
Registro de atividades.

Regras:
- Edições repetidas no mesmo alvo dentro de 10 minutos viram UMA entrada (a existente
  ganha a data e o nome novos). Se o alvo acabou de ser criado, a entrada continua
  "Criou" com o nome atualizado (ex.: nota criada e digitada logo em seguida).
- Excluir marca as entradas antigas do alvo como `target_deleted` e registra "Excluiu".
- Cada registro atualiza `World.last_activity_at` do mundo envolvido.
- Falha no log nunca derruba a requisição principal.
"""

import logging
from datetime import timedelta

from django.utils import timezone

from .models import Activity

logger = logging.getLogger(__name__)

MERGE_WINDOW = timedelta(minutes=10)


def _touch_world(world, moment):
    if world is None:
        return
    from worlds.models import World

    World.objects.filter(pk=world.pk).update(last_activity_at=moment)


def log_activity(*, owner, verb, target_type, target_id, label, world=None):
    try:
        now = timezone.now()
        label = (label or '')[:200]

        if verb == Activity.Verb.UPDATED:
            recent = (
                Activity.objects.filter(
                    owner=owner,
                    target_type=target_type,
                    target_id=target_id,
                    target_deleted=False,
                    verb__in=[Activity.Verb.CREATED, Activity.Verb.UPDATED],
                    created_at__gte=now - MERGE_WINDOW,
                )
                .order_by('-created_at')
                .first()
            )
            if recent:
                Activity.objects.filter(pk=recent.pk).update(created_at=now, target_label=label)
                _touch_world(world, now)
                return

        deleted = verb == Activity.Verb.DELETED
        if deleted:
            Activity.objects.filter(
                owner=owner, target_type=target_type, target_id=target_id
            ).update(target_deleted=True)

        Activity.objects.create(
            owner=owner,
            world=world,
            verb=verb,
            target_type=target_type,
            target_id=target_id,
            target_label=label,
            target_deleted=deleted,
            created_at=now,
        )
        _touch_world(world, now)
    except Exception:  # noqa: BLE001 - o log é secundário
        logger.exception('Falha ao registrar atividade')