from django import http
from django.core.urlresolvers import reverse
from django.template.response import TemplateResponse
from django.views.decorators.http import require_http_methods

from soundscape.streams.models import Stream
from soundscape.streams import redis_utils


def index(request):
    streams = Stream.objects.all().select_related(
        'user'
    ).order_by(
        'user__username'
    )

    context = {
        'streams': streams,
        'logged_in': request.user.is_authenticated(),
    }

    return TemplateResponse(
        request,
        'streams/index.html',
        context
    )


def stream(request, username):
    try:
        stream_info = redis_utils.get_user_info(username)
    except redis_utils.RedisGetTransactionFailure:
        raise http.Http404()

    return TemplateResponse(
        request,
        'streams/stream.html',
        {
            'stream': stream_info,
            'sent_at_ms': redis_utils.current_time(),
        }
    )


@require_http_methods(['POST'])
def create_stream(request):
    if not request.user.is_authenticated():
        raise http.Http404()

    try:
        Stream.objects.get(user=request.user)
    except Stream.DoesNotExist:
        Stream.create(user=request.user)

    return http.HttpResponseRedirect(reverse('streams_index'))
