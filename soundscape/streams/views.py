from django import http
from django.core.urlresolvers import reverse
from django.template.response import TemplateResponse
from django.views.decorators.http import require_http_methods

from soundscape.streams.models import Stream
from soundscape.streams.forms import StreamCreateForm
from soundscape.streams import redis_utils


def index(request):
    streams = Stream.objects.all().select_related(
        'user'
    ).order_by(
        'user__username'
    )

    context = {
        'streams': streams,
        'form': StreamCreateForm(),
        'logged_in': request.user.is_authenticated(),
    }

    return TemplateResponse(
        request,
        'streams/index.html',
        context
    )

def stream(request, username):
    example_src = (
        'https://w.soundcloud.com/player/'
        '?visual=true&url=https%3A%2F%2Fapi.soundcloud.com'
        '%2Ftracks%2F215980002&show_artwork=true'
    )

    return TemplateResponse(
        request,
        'streams/stream.html',
        {
            'stream': {'username': username, 'src': example_src},
            'sent_at_ms': redis_utils.current_time(),
        }
    )

@require_http_methods(['POST'])
def create_stream(request):
    form = StreamCreateForm(request.POST)

    if not form.is_valid() or not request.user.is_authenticated():
        raise http.Http404()

    try:
        Stream.objects.get(user=request.user)
    except Stream.DoesNotExist:
        Stream.create(user=request.user)

    return http.HttpResponseRedirect(reverse('streams_index'))