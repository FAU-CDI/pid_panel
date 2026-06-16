from django.urls import path
from . import views

urlpatterns = [

    path(
        "namespaces/",
        views.namespace_list,
        name="namespace_list"
    ),

    path(
        "namespaces/create/",
        views.namespace_create,
        name="namespace_create"
    ),

    path(
        "pids/create/",
        views.pid_create,
        name="pid_create"
    ),
    path(
        "pids/list/",
        views.pid_namespaces,
        name="pid_namespaces"
    ),
    path(
        "pids/list/<str:namespace_id>/",
        views.pid_list,
        name="pid_list"
    ),

    path(
        "pids/<str:namespace_id>/<str:pid>/edit/",
        views.pid_edit,
        name="pid_edit"
    ),

    path(
        "pids/<str:namespace_id>/<str:pid>/delete/",
        views.pid_delete,
        name="pid_delete"
    ),

    path(
        "resolve/",
        views.resolve_pid,
        name="resolve_pid"
    ),
]