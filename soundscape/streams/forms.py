from django import forms

class StreamCreateForm(forms.Form):
    src = forms.CharField(max_length=10000)
    title = forms.CharField(max_length=10000)
