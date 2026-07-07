from django.db import models
from django.contrib.auth.models import User


class Permission(models.TextChoices):
    LIST = "list", "List"
    CREATE = "create", "Create"
    UPDATE_DELETE = "update/delete", "Update/Delete"
    MOUNT = "mount", "Mount"
    MANAGE_PERMISSIONS = "manage_permissions", "Manage Permissions"


class Role(models.TextChoices):
    VIEWER = "viewer", "Viewer"
    CONTRIBUTOR = "contributor", "Contributor"
    EDITOR = "editor", "Editor"
    MANAGER = "manager", "Manager"


class NamespacePermission(models.Model):
    ROLE_PERMISSIONS = {
        Role.VIEWER: [
            Permission.LIST,
        ],
        Role.CONTRIBUTOR: [
            Permission.LIST,
            Permission.CREATE,
        ],
        Role.EDITOR: [
            Permission.LIST,
            Permission.CREATE,
            Permission.UPDATE_DELETE,
        ],
        Role.MANAGER: [
            Permission.LIST,
            Permission.CREATE,
            Permission.UPDATE_DELETE,
            Permission.MOUNT,
            Permission.MANAGE_PERMISSIONS,
        ],
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    namespace = models.CharField(max_length=255)

    role = models.CharField(max_length=20, choices=Role.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "namespace"], name="unique_user_namespace"
            )
        ]

    @staticmethod
    def has_permission(user, namespace, permission):

        if user.is_superuser:
            return True

        assignment = NamespacePermission.objects.filter(
            user=user, namespace=namespace
        ).first()

        if assignment is None:
            return False

        return permission in NamespacePermission.ROLE_PERMISSIONS[assignment.role]

    @staticmethod
    def grant_role(user, namespace, role):

        NamespacePermission.objects.update_or_create(
            user=user,
            namespace=namespace,
            defaults={"role": role},
        )

    @staticmethod
    def revoke_role(user, namespace):

        NamespacePermission.objects.filter(user=user, namespace=namespace).delete()

    @staticmethod
    def set_role(user, namespace, role):

        NamespacePermission.objects.update_or_create(
            user=user,
            namespace=namespace,
            defaults={"role": role},
        )

    def __str__(self):
        return f"{self.user.username} | {self.namespace} | {self.role}"
