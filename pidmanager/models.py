from django.db import models
from django.contrib.auth.models import User


class NamespacePermission(models.Model):

    PERMISSION_CHOICES = [
        ("read", "Read"),
        ("create", "Create"),
        ("update", "Update/Delete"),
        ("mount", "Mount"),
        ("list", "List"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    namespace = models.CharField(
        max_length=255
    )

    permission = models.CharField(
        max_length=20,
        choices=PERMISSION_CHOICES
    )

    def __str__(self):
        return (
            f"{self.user.username} | "
            f"{self.namespace} | "
            f"{self.permission}"
        )