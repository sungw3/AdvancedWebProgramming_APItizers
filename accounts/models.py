from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """기본 User 모델 확장"""
    pass

    def __str__(self):
        return self.username