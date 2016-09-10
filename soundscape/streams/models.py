from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

from soundscape.streams import redis_utils


BLANK_STREAM_DATA = {
    'title': '',
    'src': '',
    'time': redis_utils.current_time(),
    'position': 0,
}


class Stream(models.Model):
    """
    This model establishes ownership of a stream.
    The cache holds stream information.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL)

    @classmethod
    def create(cls, user):
        stream = cls.objects.create(user=user)

        try:
            redis_utils.get_user_info(username=user.username)
        except redis_utils.RedisGetTransactionFailure:
                redis_utils.set_user_info(
                    username=user.username,
                    dictionary=BLANK_STREAM_DATA
                )

        return stream