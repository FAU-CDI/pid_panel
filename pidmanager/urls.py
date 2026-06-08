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

]