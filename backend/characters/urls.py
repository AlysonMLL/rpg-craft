"""
Função do Arquivo: Registra as rotas /api/characters/ e /api/relationships/ do app characters.
O que há aqui: router do DRF com CharacterViewSet e RelationshipViewSet.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CharacterViewSet, RelationshipViewSet

router = DefaultRouter()
router.register(r'characters', CharacterViewSet, basename='character')
router.register(r'relationships', RelationshipViewSet, basename='relationship')

urlpatterns = [
    path('', include(router.urls)),
]