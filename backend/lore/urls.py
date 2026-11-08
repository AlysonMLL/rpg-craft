from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DocumentViewSet
from .timeline_views import EraViewSet, TimelineEventViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'timeline-events', TimelineEventViewSet, basename='timeline-event')
router.register(r'eras', EraViewSet, basename='era')

urlpatterns = [
    path('', include(router.urls)),
]