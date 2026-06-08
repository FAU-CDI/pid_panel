from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from .forms import NamespaceCreateForm
from .services.go_client import (
    list_namespaces,
    create_namespace
)


@login_required
def namespace_list(request):

    data = list_namespaces()

    return render(
        request,
        "pidmanager/namespace_list.html",
        {
            "namespaces": data["items"]
        }
    )


@login_required
def namespace_create(request):

    if request.method == "POST":

        form = NamespaceCreateForm(
            request.POST
        )

        if form.is_valid():

            create_namespace(
                tag=form.cleaned_data["tag"],
                pattern=form.cleaned_data["pattern"],
                characters=form.cleaned_data["characters"]
            )

            return redirect(
                "namespace_list"
            )

    else:

        form = NamespaceCreateForm()

    return render(
        request,
        "pidmanager/namespace_create.html",
        {
            "form": form
        }
    )