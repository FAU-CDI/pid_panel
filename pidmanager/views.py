from django.http import HttpResponse, HttpResponseForbidden
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import Http404

from .models import NamespacePermission, Role, Permission
from .forms import (
    NamespaceCreateForm,
    PIDEditForm,
)
from .services.go_client import (
    list_namespaces,
    create_namespace,
    create_pid,
    list_pids,
    update_pid,
    get_pid,
)


@login_required
def namespace_list(request):
    limit = 3

    offset = int(request.GET.get("offset", 0))

    data = list_namespaces(limit=limit, offset=offset)
    next_offset = None

    if offset + limit < data["total"]:
        next_offset = offset + limit

    previous_offset = None

    if offset > 0:
        previous_offset = max(0, offset - limit)

    user_namespaces = set(
        NamespacePermission.objects.filter(user=request.user).values_list(
            "namespace", flat=True
        )
    )

    allowed_namespaces = [ns for ns in data["items"] if ns["id"] in user_namespaces]

    return render(
        request,
        "pidmanager/namespace_list.html",
        {
            "namespaces": allowed_namespaces,
            "next_offset": next_offset,
            "previous_offset": previous_offset,
        },
    )


@login_required
def namespace_create(request):

    if request.method == "POST":
        form = NamespaceCreateForm(request.POST)

        if form.is_valid():
            namespace_data = create_namespace(
                tag=form.cleaned_data["tag"],
                pattern=form.cleaned_data["pattern"],
                characters=form.cleaned_data["characters"],
            )

            NamespacePermission.grant_role(
                request.user,
                namespace_data["id"],
                Role.MANAGER,
            )

            return redirect("namespace_list")

    else:
        form = NamespaceCreateForm()

    return render(request, "pidmanager/namespace_create.html", {"form": form})


@login_required
def pid_create(request):

    data = list_namespaces()

    allowed_namespaces = []

    for ns in data["items"]:
        if NamespacePermission.has_permission(
            request.user, ns["id"], Permission.CREATE
        ):
            allowed_namespaces.append(ns)

    if request.method == "POST":
        namespace_id = request.POST["namespace_id"]
        url = request.POST["url"]
        metadata = request.POST["metadata"]
        tag = request.POST["tag"]

        result = create_pid(namespace_id, url, metadata, tag)

        return render(request, "pidmanager/pid_created.html", {"pid": result})

    return render(
        request, "pidmanager/create_pid.html", {"namespaces": allowed_namespaces}
    )


@login_required
def pid_namespaces(request):

    data = list_namespaces()

    print("Current user:", request.user)

    print("Namespaces from Go:")
    print(data)

    allowed_namespaces = []

    for ns in data["items"]:
        has_perm = NamespacePermission.has_permission(
            request.user, ns["id"], Permission.LIST
        )

        print("Namespace:", ns["id"], "Has LIST permission:", has_perm)

        if has_perm:
            allowed_namespaces.append(ns)

    print("Allowed namespaces:")
    print(allowed_namespaces)

    return render(
        request, "pidmanager/pid_namespaces.html", {"namespaces": allowed_namespaces}
    )


@login_required
def pid_list(request, namespace_id):

    all_namespaces = list_namespaces()

    namespace = next(
        (ns for ns in all_namespaces["items"] if ns["id"] == namespace_id), None
    )

    if namespace is None:
        return HttpResponse("Namespace not found", status=404)

    if not NamespacePermission.has_permission(
        request.user, namespace["id"], Permission.LIST
    ):
        return HttpResponseForbidden("You do not have permission.")

    limit = 13

    offset = int(request.GET.get("offset", 0))

    data = list_pids(namespace_id, limit=limit, offset=offset)

    next_offset = None

    if offset + limit < data["total"]:
        next_offset = offset + limit

    previous_offset = None

    if offset > 0:
        previous_offset = max(0, offset - limit)

    visible_pids = [pid for pid in data["items"] if not pid.get("deleted", False)]

    can_update = NamespacePermission.has_permission(
        request.user, namespace["id"], Permission.UPDATE_DELETE
    )

    return render(
        request,
        "pidmanager/pid_list.html",
        {
            "namespace": namespace,
            "pids": visible_pids,
            "can_update": can_update,
            "next_offset": next_offset,
            "previous_offset": previous_offset,
        },
    )


@login_required
def pid_edit(request, namespace_id, pid):

    all_namespaces = list_namespaces()

    namespace = next(
        (ns for ns in all_namespaces["items"] if ns["id"] == namespace_id), None
    )

    if not NamespacePermission.has_permission(
        request.user, namespace["id"], Permission.UPDATE_DELETE
    ):
        return HttpResponseForbidden("Permission denied")

    data = list_pids(namespace_id)

    resource = next((item for item in data["items"] if item["pid"] == pid), None)

    if resource is None:
        return HttpResponse("PID not found", status=404)
    if resource["deleted"]:
        return HttpResponse("PID not found", status=404)
    if request.method == "POST":
        form = PIDEditForm(request.POST)

        if form.is_valid():
            update_pid(
                namespace_id=namespace_id,
                pid=pid,
                url=resource["url"],
                metadata=form.cleaned_data["metadata"],
                tag=resource["tag"],
                deleted=resource["deleted"],
            )

            return redirect("pid_list", namespace_id)

    else:
        form = PIDEditForm(initial={"metadata": resource["metadata"]})

    return render(request, "pidmanager/pid_edit.html", {"form": form, "pid": pid})


@login_required
def pid_delete(request, namespace_id, pid):

    all_namespaces = list_namespaces()

    namespace = next(
        (ns for ns in all_namespaces["items"] if ns["id"] == namespace_id), None
    )

    if not NamespacePermission.has_permission(
        request.user, namespace["id"], Permission.UPDATE_DELETE
    ):
        return HttpResponseForbidden("Permission denied")

    data = list_pids(namespace_id)

    resource = next((item for item in data["items"] if item["pid"] == pid), None)

    if resource is None:
        return HttpResponse("PID not found", status=404)
    if request.method == "POST":
        update_pid(
            namespace_id=namespace_id,
            pid=pid,
            url=resource["url"],
            metadata=resource["metadata"],
            tag=resource["tag"],
            deleted=True,
        )

        return redirect("pid_list", namespace_id)
    return render(
        request,
        "pidmanager/delete_confirm.html",
        {"pid": pid, "namespace_id": namespace_id},
    )


def resolve_pid(request):

    pid_data = None
    error = None

    if request.method == "POST":
        namespace_id = request.POST["namespace_id"]
        pid = request.POST["pid"]

        try:
            pid_data = get_pid(namespace_id, pid)

            # hide soft-deleted records
            if pid_data.get("deleted"):
                raise Http404()

        except Exception:
            error = "PID not found."

    return render(
        request,
        "pidmanager/resolve_pid.html",
        {
            "pid_data": pid_data,
            "error": error,
        },
    )
