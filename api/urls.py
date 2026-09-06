from django.urls import path
from . import views

urlpatterns = [
    path("csrf", views.csrf, name="csrf"),
    path("me", views.current_user, name="current_user"),
    path("namespaces", views.namespaces, name="namespaces"),
    path(
        "namespaces/<str:namespace_id>",
        views.namespace_detail,
        name="namespace_detail",
    ),
    path("namespaces/<str:namespace_id>/resources", views.resources, name="resources"),
    path(
        "namespaces/<str:namespace_id>/resources/<str:pid>",
        views.pid_detail,
        name="api_pid_detail",
    ),
]
