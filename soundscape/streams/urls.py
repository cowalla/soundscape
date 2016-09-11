from django.conf.urls import url

from soundscape.streams import views

urlpatterns = [
    url(r'^$', views.index, name='streams_index'),
    url(r'^users/(?P<username>\w+)/$', views.stream, name='stream_user'),
    url(r'^users/(?P<username>\w+)/get_stream_info/$', views.get_stream_info, name='get_stream_info'),
    url(r'^create/$', views.create_stream, name='create_stream'),
    url(r'^post_stream_info/$', views.post_stream_info, name='post_stream_info'),
]