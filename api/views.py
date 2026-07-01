from requests import request
from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import (
    IsAuthenticated
)

from rest_framework.response import Response

from django.contrib.auth.models import User

from pidmanager.models import (
    NamespacePermission
)

from pidmanager.services.go_client import (
    list_namespaces,
    create_namespace,
    list_pids,
    create_pid,
    get_pid,
    update_pid
)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):

    return Response({
        "username": request.user.username,
        "is_superuser": request.user.is_superuser
    })

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def namespaces(request):

    if request.method == "GET":

        limit = int(
            request.GET.get(
                "limit",
                3
            )
        )

        offset = int(
            request.GET.get(
                "offset",
                0
            )
        )

        go_data = list_namespaces(
            limit,
            offset
        )

        next_offset = None

        if offset + limit < go_data["total"]:
            next_offset = offset + limit

        previous_offset = None

        if offset > 0:
            previous_offset = max(0, offset - limit)

        results = []

        for ns in go_data["items"]:

            assignment = NamespacePermission.objects.filter(
                user=request.user,
                namespace=ns["tag"]
            ).first()

            if assignment:
                results.append({
                    "id": ns["id"],
                    "tag": ns["tag"],
                    "role": assignment.role
                })

        return Response({
            "total": go_data["total"],
            "limit": limit,
            "offset": offset,
            "next_offset": next_offset,
            "previous_offset": previous_offset,
            "count": len(results),
            "results": results,
        })

    elif request.method == "POST":

        namespace = create_namespace(
            request.data["tag"],
            request.data["pattern"],
            request.data["characters"]
        )

        NamespacePermission.set_role(
            request.user,
            namespace["tag"],
            "manager"
        )

        return Response(namespace, status=201)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def resources(request, namespace_id):

    if request.method == "GET":

        limit = 3

        offset = int(
            request.GET.get(
                "offset",
                0
            )
        )


        namespaces = list_namespaces(
            limit=limit,
            offset=offset
        )

        namespace = next(
            (
                n
                for n in namespaces["items"]
                if n["id"] == namespace_id
            ),
            None
        )

        if not namespace:

            return Response(
                {"error": "Namespace not found"},
                status=404
            )

        if not NamespacePermission.has_permission(
            request.user,
            namespace["tag"],
            "list"
        ):
            return Response(
                {"error": "Permission denied"},
                status=403
            )

        data = list_pids(
            namespace_id,
            limit=limit,
            offset=offset,
        )

        next_offset = None

        if offset + limit < data["total"]:
            next_offset = offset + limit

        previous_offset = None

        if offset > 0:
            previous_offset = max(0, offset - limit)

            
        visible = [

            pid

            for pid in data["items"]

            if not pid["deleted"]
        ]

        return Response({
            "namespace": namespace,
            "total": data["total"],
            "limit": limit,
            "offset": offset,
            "next_offset": next_offset,
            "previous_offset": previous_offset,
            "count": len(visible),
            "results": visible,
        })
    
    
    elif request.method == "POST":

        result = create_pid(

        namespace_id,

        request.data["url"],

        request.data["metadata"],

        request.data["tag"]
    )
        return Response(result)

@api_view(["GET" , "PATCH", "DELETE"])
def pid_detail(
    request,
    namespace_id,
    pid
):

    data = get_pid(
        namespace_id,
        pid
    )

    if request.method == "GET":

        if data["deleted"]:

            return Response(
                {"error": "PID has been deleted."},
                status=410
            )

        return Response(data)
    elif request.method == "PATCH":

        result = update_pid(

            namespace_id,

            pid,

            data["url"],

            request.data["metadata"],

            data["tag"],

            data["deleted"]
        )

        return Response(result)
    
    elif request.method == "DELETE":
        update_pid(

            namespace_id,

            pid,

            data["url"],

            data["metadata"],

            data["tag"],

            True
        )

    return Response({

        "message": "PID deleted"
    })

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def namespace_roles(request, namespace_id):

    namespaces = list_namespaces()

    namespace = next(
        (
            n
            for n in namespaces["items"]
            if n["id"] == namespace_id
        ),
        None
    )

    if namespace is None:
        return Response(
            {"error": "Namespace not found"},
            status=404
        )

    if not NamespacePermission.has_permission(
        request.user,
        namespace["tag"],
        "manage_permissions"
    ):
        return Response(
            {"error": "Permission denied"},
            status=403
        )

    if request.method == "GET":

        assignments = NamespacePermission.objects.filter(
            namespace=namespace["tag"]
        ).select_related("user")

        results = [
            {
                "user_id": assignment.user.id,
                "username": assignment.user.username,
                "role": assignment.role,
            }
            for assignment in assignments
        ]

        return Response({
            "namespace": namespace["tag"],
            "count": len(results),
            "results": results,
        })

    elif request.method == "PUT":

        try:
            target_user = User.objects.get(
                id=request.data["user_id"]
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=404
            )
        
        if (
            not request.user.is_superuser
            and target_user.id == request.user.id
        ):
            return Response(
                {
                    "error": "Managers cannot change their own role."
                },
                status=403
            )

        role = request.data["role"]

        if role not in dict(
            NamespacePermission.ROLE_CHOICES
        ):
            return Response(
                {"error": "Invalid role"},
                status=400
            )

        NamespacePermission.set_role(
            target_user,
            namespace["tag"],
            role
        )

        return Response({
            "message": "Role updated successfully",
            "user_id": target_user.id,
            "username": target_user.username,
            "role": role,
        })

    elif request.method == "DELETE":

        try:
            target_user = User.objects.get(
                id=request.data["user_id"]
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=404
            )
        
        if (
            not request.user.is_superuser
            and target_user.id == request.user.id
        ):
            return Response(
                {
                    "error": "Managers cannot revoke their own role."
                },
                status=403
            )

        NamespacePermission.revoke_role(
            target_user,
            namespace["tag"]
        )

        return Response({
            "message": "Role revoked successfully"
        })

