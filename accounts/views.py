from authlib.integrations.django_client import OAuth
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.contrib.auth.models import User

from accounts.models import UserMapping
from accounts.utils import generate_go_username

from pidmanager.services.go_client import create_go_user
from accounts.utils import get_go_username



if "keycloak" in settings.AUTHLIB_OAUTH_CLIENTS:
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

    print("KEYCLOAK USERINFO:", userinfo)

    # Keycloak group membership
    groups = userinfo.get("groups", [])

    required_group = settings.KEYCLOAK_ALLOWED_GROUP

    if required_group not in groups: 
        return redirect( f"{settings.FRONTEND_URL}/?error=not_authorized" )

    preferred = userinfo["preferred_username"]
    email = userinfo.get("email", "")

    # Django user
    user, _ = User.objects.get_or_create(
        username=preferred,
        defaults={
            "email": email,
            "first_name": userinfo.get("given_name", ""),
            "last_name": userinfo.get("family_name", ""),
        },
    )

    # Go user mapping
    mapping, created = UserMapping.objects.get_or_create(
        preferred_username=preferred,
        defaults={
            "email": email,
            "go_username": generate_go_username(),
        },
    )

    # Create the Go account only once
    if created:
        create_go_user(mapping.go_username)

    django_login(request, user)

    return redirect(f"{settings.FRONTEND_URL}/dashboard")


def logout(request):

    django_logout(request)

    return redirect(f"{settings.FRONTEND_URL}/")