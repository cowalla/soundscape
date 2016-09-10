import json

from BeautifulSoup import BeautifulSoup as BS

from django import http
from django.conf import settings
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt

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


@csrf_exempt
@never_cache
@require_http_methods(['POST'])
def post_stream_info(request):
    """
    An authenticated user with a stream posts their stream info to update the cache entry.

    Expected request.POST:
        {
            't': time when soundcloud position is measured in milliseconds.
            'p': position of soundcloud song in milliseconds.
            'title': title of soundcloud song.
            'url': url of soundcloud song.
        }
    """

    time_started = redis_utils.current_time()
    client_data = request.POST

    get_object_or_404(Stream, user=request.user.pk)

    if not request.user.is_authenticated():
        raise http.Http404()

    time = int(client_data['t'])
    position = int(client_data.get('p', 0))
    title = client_data.get('title', '')
    url = client_data.get('url', '')
    current_stream = redis_utils.get_user_info(request.user.username)

    if current_stream['title'] != title:
        track = settings.SOUNDCLOUD_CLIENT.get('/resolve', url=url)
        html = settings.SOUNDCLOUD_CLIENT.get('oembed', url=track.obj['uri']).fields()['html']
        soup = BS(html)
        src = dict(soup.findAll('iframe')[0].attrs)['src']
        current_stream['src'] = src

    offset = redis_utils.time_since(time_started) # Time for Redis save is negligible.
    values = {
        'time': time + offset,
        'position': position + offset,
        'src': current_stream['src'],
        'title': title,
    }
    redis_utils.set_user_info(request.user.username, values)

    return http.HttpResponse(json.dumps(values))
