import json

from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from soundscape.streams.forms import StreamCreateForm
from soundscape.streams import views as stream_views

# Create your tests here.
class StreamsTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.stream_form_data = {'src': 'http://example.com', 'title': 'example title'}
        self.valid_form = StreamCreateForm(self.stream_form_data)
        self.user_credentials = {'username': 'test_user', 'password': 'password'}
        self.test_user = User.objects.create(
            username=self.user_credentials['username'],
            email='test_user@localhost',
            password=self.user_credentials['password']
        )

    def _login_test_user(self):
        self.client.login(
            username=self.user_credentials['username'],
            password=self.user_credentials['password']
        )

        self.assertTrue(self.test_user.is_authenticated())

    def test_stream_form(self):
        self.assertTrue(self.valid_form.is_valid())

    def test_create_stream(self):
        self._login_test_user()

        request = self.factory.post(
            reverse('create_stream'),
            self.stream_form_data
        )
        request.user = self.test_user
        response = stream_views.create_stream(request)

        # Would rather do an assertRedirects here
        self.assertEqual(response.status_code, 302)

        # will raise ObjectDoesNotExist if Stream wasn't created
        self.test_user.stream.delete()
