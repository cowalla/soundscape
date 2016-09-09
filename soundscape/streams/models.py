from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


redis_client = settings.REDIS_CLIENT


class Stream(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL)
    src = models.CharField(max_length=10000)
    title = models.CharField(max_length=10000)

    @classmethod
    def create(cls, user, src, title):
        cls.objects.create(user=user, src=src, title=title)