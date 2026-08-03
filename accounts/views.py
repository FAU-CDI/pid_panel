from authlib.integrations.django_client import OAuth
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.contrib.auth.models import User

oauth = OAuth()

oauth.register(
    "keycloak",
    **settings.AUTHLIB_OAUTH_CLIENTS["keycloak"],
)

def login(request):

    redirect_uri = request.build_absolute_uri("/auth/callback/")

    return oauth.keycloak.authorize_redirect(
        request,
        redirect_uri,
    )

def callback(request):

    token = oauth.keycloak.authorize_access_token(request)

    userinfo = token["userinfo"]

    user, created = User.objects.get_or_create(

        username=userinfo["preferred_username"],

        defaults={

            "email": userinfo.get("email", ""),

            "first_name": userinfo.get("given_name", ""),

            "last_name": userinfo.get("family_name", ""),

        }

    )

    django_login(request, user)

    return redirect("http://localhost:5173/dashboard")

def logout(request):

    django_logout(request)

    return redirect("http://localhost:5173/")