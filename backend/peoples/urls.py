"""Rotas /api/races/ e /api/creatures/ do app peoples."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CreatureViewSet, RaceViewSet

router = DefaultRouter()
router.register(r'races', RaceViewSet, basename='race')
router.register(r'creatures', CreatureViewSet, basename='creature')

urlpatterns = [
    path('', include(router.urls)),
]