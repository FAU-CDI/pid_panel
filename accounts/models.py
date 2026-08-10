# Create your models here.
from django.db import models

class UserMapping(models.Model):

    email = models.EmailField(unique=True)

    preferred_username = models.CharField(
        max_length=255,
        unique=True,
    )

    go_username = models.CharField(
        max_length=32,
        unique=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email