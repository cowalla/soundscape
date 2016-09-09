from django.conf.urls import url

from soundscape.streams import views

urlpatterns = [
    url(r'^$', views.index, name='streams_index'),
    url(r'^users/(?P<username>\w+)/$', views.stream, name='stream_user'),
    url(r'^create/$', views.create_stream, name='create_stream'),
]