from django.urls import path

from .views import login, callback, logout

urlpatterns = [

    path("auth/login/", login),

    path("auth/callback/", callback),

    path("auth/logout/", logout),

]