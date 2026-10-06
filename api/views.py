from django.http import JsonResponse
from django.middleware.csrf import get_token

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

from accounts.utils import get_go_username

from pidmanager.services.go_client import (
    list_namespaces,
    create_namespace,
    update_namespace,
    get_mount_info,
    list_pids,
    create_pid,
    get_pid,
    update_pid,
    list_namespace_roles,
    get_namespace_role,
    set_namespace_role,
    delete_namespace_role,
    get_namespace,
    create_api_key,
    list_api_keys,
    revoke_api_key,
)


@api_view(["GET"])
def csrf(request):
    return JsonResponse({
        "csrfToken": get_token(request),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):

    """
        Return information about the currently authenticated Django user.
    
        Django is responsible for authentication.
    """

    go_username = get_go_username(request.user)

    return Response({
        "username": request.user.username,
        "go_username": go_username,
        "display_username": f"customer_{go_username}",
        "is_superuser": request.user.is_superuser,
    })

@api_view(["GET", "POST", "PATCH"])
@permission_classes([IsAuthenticated])
def namespaces(request):

    go_username = get_go_username(request.user)

    if request.method == "GET":

        limit = int(request.GET.get("limit", 3))
        offset = int(request.GET.get("offset", 0))

        go_data = list_namespaces(
            go_username,
            limit,
            offset,
        )

        results = []

        for namespace in go_data["items"]:

            try:
                role_data = get_namespace_role(
                    go_username,
                    namespace["id"],
                    go_username,
                )

                namespace["role"] = role_data.get("role")

            except Exception:
                namespace["role"] = None

            try:
                mount_data = get_mount_info(
                    go_username,
                    namespace["id"],
                )

                print(
                    f"MOUNTS FOR {namespace['id']}:",
                    mount_data,
                )

                namespace["mounts"] = mount_data.get("items", [])

            except Exception as e:
                print(
                    f"MOUNT ERROR FOR {namespace['id']}:",
                    repr(e),
                )
                namespace["mounts"] = []

            results.append(namespace)

        return Response({
            "total": go_data["total"],
            "limit": limit,
            "offset": go_data["offset"],
            "next_offset": (
                offset + limit
                if offset + limit < go_data["total"]
                else None
            ),
            "previous_offset": (
                max(0, offset - limit)
                if offset > 0
                else None
            ),
            "count": len(results),
            "results": results,
        })

    elif request.method == "POST":

        namespace = create_namespace(
            go_username,
            request.data["tags"],
            request.data["pattern"],
            request.data["characters"],
        )

        return Response(namespace, status=201)

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def namespace_detail(request, namespace_id):

    go_username = get_go_username(request.user)

    if request.method == "GET":

        namespace = get_namespace(
            go_username,
            namespace_id,
        )

        try:
            role_data = get_namespace_role(
                go_username,
                namespace_id,
                go_username,
            )

            namespace["role"] = role_data.get("role")

        except Exception:
            namespace["role"] = None

        try:
            mount_data = get_mount_info(
                go_username,
                namespace_id,
            )
            namespace["mounts"] = mount_data.get("items", [])
        except Exception:
            namespace["mounts"] = []

        return Response(namespace)

    if request.method == "PATCH":

        tags = request.data.get("tags")

        if not isinstance(tags, list) or len(tags) == 0:
            return Response(
                {"error": "At least one tag is required."},
                status=400,
            )

        namespace = update_namespace(
            go_username,
            namespace_id,
            tags=tags,
        )

        return Response(namespace, status=200)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def resources(request, namespace_id):

    go_username = get_go_username(request.user)

    if request.method == "GET":

        limit = int(request.GET.get("limit", 3))
        offset = int(request.GET.get("offset", 0))

        namespace = get_namespace(
            go_username,
            namespace_id,
        )

        role_data = get_namespace_role(
            go_username,
            namespace_id,
            go_username,
        )

        # Add role to namespace object
        namespace["role"] = role_data["role"]

        # Mounts
        try:
            mount_data = get_mount_info(
                go_username,
                namespace_id,
            )
            namespace["mounts"] = mount_data.get("items", [])
        except Exception as e:
            print("MOUNT ERROR:", repr(e))
            namespace["mounts"] = []

        data = list_pids(
            go_username,
            namespace_id,
            limit=limit,
            offset=offset,
        )

        visible = [ 
            pid 
            for pid in data["items"] 
            if not pid.get("deleted", False) 
        ]

        next_offset = None

        if offset + limit < data["total"]:
            next_offset = offset + limit

        previous_offset = None

        if offset > 0:
            previous_offset = max(0, offset - limit)

        return Response({
            "namespace": namespace,
            "total": data["total"],
            "limit": limit,
            "offset": offset,
            "next_offset": next_offset,
            "previous_offset": previous_offset,
            "results": visible,
        })

    if request.method == "POST":

        data = create_pid(
            go_username,
            namespace_id,
            request.data["url"],
            request.data["metadata"],
            request.data["tags"],
        )

        return Response(data, status=201)

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def pid_detail(request, namespace_id, pid):
    """
    Proxy individual PID operations to the Go backend.

    Django handles authentication and forwards the authenticated
    user's Go username. Go handles authorization and PID logic.
    """

    go_username = get_go_username(request.user)

    if request.method == "GET":
        data = get_pid(
            go_username,
            namespace_id,
            pid,
        )

        return Response(data)

    if request.method == "PATCH":
        data = update_pid(
            go_username,
            namespace_id,
            pid,
            url=request.data.get("url"),
            metadata=request.data.get("metadata"),
            tags=request.data.get("tags"),
            deleted=request.data.get("deleted"),
        )

        return Response(data)

    if request.method == "DELETE":
        data = update_pid(
            go_username,
            namespace_id,
            pid,
            deleted=True,
        )

        return Response(data)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def namespace_roles(request, namespace_id):

    go_username = get_go_username(request.user)

    if request.method == "GET":
        return Response(
            list_namespace_roles(
                go_username,
                namespace_id,
            )
        )

    elif request.method == "PUT":
        target_user_id = request.data["user_id"]
        role = request.data["role"]

        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        target_go_username = get_go_username(target_user)

        result = set_namespace_role(
            go_username,
            namespace_id,
            target_go_username,
            role,
        )

        return Response(result)

    elif request.method == "DELETE":
        target_user_id = request.data["user_id"]

        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        target_go_username = get_go_username(target_user)

        result = delete_namespace_role(
            go_username,
            namespace_id,
            target_go_username,
        )

        return Response(result)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def profile_keys(request):
    go_username = get_go_username(request.user)

    if request.method == "GET":
        limit = int(request.GET.get("limit", 20))
        offset = int(request.GET.get("offset", 0))

        data = list_api_keys(
            go_username,
            limit=limit,
            offset=offset,
        )

        return Response(data)

    if request.method == "POST":
        comment = request.data.get("comment", "")
        user_scopes = request.data.get("userScopes", [])
        namespace_scopes = request.data.get("namespaceScopes", [])
        expires_at = request.data.get("expiresAt")

        data = create_api_key(
            go_username,
            comment=comment,
            user_scopes=user_scopes,
            namespace_scopes=namespace_scopes,
            expires_at=expires_at,
        )

        return Response(data, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def revoke_profile_key(request):
    go_username = get_go_username(request.user)

    key_id = request.data.get("id")

    if not key_id:
        return Response(
            {"error": "API key id is required."},
            status=400,
        )

    data = revoke_api_key(
        go_username,
        key_id,
    )

    return Response(status=204)