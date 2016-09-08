from django import http
from django.core import urlresolvers
from django.contrib.auth import decorators, logout
from django.template.response import TemplateResponse
from django.views.decorators.http import require_http_methods


@decorators.login_required
def home(request):
    return TemplateResponse(
        request,
        'home.html'
    )

@decorators.login_required
def accounts_profile(request):
    return TemplateResponse(
        request,
        'accounts_profile.html'
    )

@decorators.login_required
@require_http_methods(['POST'])
def logout_user(request):
    logout(request)

    return http.HttpResponseRedirect(
        urlresolvers.reverse('soundscape.views.home')
    )