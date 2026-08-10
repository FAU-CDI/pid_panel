from accounts.models import UserMapping

import secrets
import string

ALPHABET = string.ascii_lowercase + string.digits


def generate_go_username(length=16):

    while True:

        username = "".join(
            secrets.choice(ALPHABET)
            for _ in range(length)
        )

        if not UserMapping.objects.filter(
            go_username=username
        ).exists():

            return username


def get_go_username(user):

    return UserMapping.objects.get(
        preferred_username=user.username
    ).go_username