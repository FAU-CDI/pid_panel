from django import forms


class NamespaceCreateForm(forms.Form):

    tag = forms.CharField(
        max_length=100
    )

    pattern = forms.CharField(
        max_length=100,
        initial="***-***"
    )

    characters = forms.ChoiceField(
        choices=[
            ("full", "Full"),
        ]
    )