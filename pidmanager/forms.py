from django import forms


class NamespaceCreateForm(forms.Form):
    tag = forms.CharField(max_length=100)

    pattern = forms.CharField(max_length=100, initial="***-***")

    characters = forms.ChoiceField(
        choices=[
            ("full", "Full"),
        ]
    )


class PIDCreateForm(forms.Form):
    namespace_id = forms.ChoiceField()

    url = forms.URLField()

    metadata = forms.CharField(widget=forms.Textarea)

    tag = forms.CharField()


class PIDEditForm(forms.Form):
    metadata = forms.CharField(widget=forms.Textarea)
