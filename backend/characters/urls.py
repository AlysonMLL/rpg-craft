"""
Função do Arquivo: Registra a rota /api/characters/ do app characters.
O que há aqui: router do DRF com o CharacterViewSet.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CharacterViewSet

router = DefaultRouter()
router.register(r'characters', CharacterViewSet, basename='character')

urlpatterns = [
    path('', include(router.urls)),
]