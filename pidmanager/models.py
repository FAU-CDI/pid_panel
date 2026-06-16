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

    @staticmethod
    def has_permission(
        user,
        namespace,
        permission
    ):

        if user.is_superuser:
            return True

        return NamespacePermission.objects.filter(
            user=user,
            namespace=namespace,
            permission=permission
        ).exists()
    
    @staticmethod
    def grant_all_permissions(user, namespace):

        permissions = [
            "read",
            "create",
            "update",
            "mount",
            "list",
        ]

        for permission in permissions:

            NamespacePermission.objects.get_or_create(
                user=user,
                namespace=namespace,
                permission=permission
            )

    def __str__(self):
        return (
            f"{self.user.username} | "
            f"{self.namespace} | "
            f"{self.permission}"
        )