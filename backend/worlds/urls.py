from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TagViewSet, WorldViewSet

router = DefaultRouter()
router.register(r'worlds', WorldViewSet, basename='world')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
]
