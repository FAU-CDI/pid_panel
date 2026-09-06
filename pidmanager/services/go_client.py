import requests

from django.conf import settings

def auth_headers(username):
    headers = {
        "Authorization": f"Bearer {settings.GO_BACKEND_TOKEN}",
        "X-Impersonate-User": username,
    }

    print(headers)

    return headers


def list_namespaces(username, limit=3, offset=0):

    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces",
        params={
            "limit": limit,
            "offset": offset,
        },
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()


def create_namespace(username,tags, pattern, characters):

    payload = {"tags": tags, "pidFormat": {
        "pattern": pattern, 
        "characters": characters
        }}

    response = requests.post(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces", json=payload, headers=auth_headers(username)
    )

    response.raise_for_status()

    return response.json()

def get_namespace(username, namespace_id):

    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}",
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()

def update_namespace(username, namespace_id, tags=None):

    payload = {}

    if tags is not None:
        payload["tags"] = tags

    response = requests.patch(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}",
        json=payload,
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()

def get_mount_info(username, namespace_id):

    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/mounts",
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()

def create_pid(username, namespace_id, url, metadata, tags):

    payload = {
        "url": url,
        "metadata": metadata,
        "tags": tags,
    }

    response = requests.post(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/resources",
        json=payload,
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()


def list_pids(username, namespace_id, limit=3, offset=0):

    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/resources",
        params={
            "limit": limit,
            "offset": offset,
        },
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()

def update_pid(username, namespace_id, pid, url=None, metadata=None, tags=None, deleted=None):
    payload = {}

    if url is not None:
        payload["url"] = url

    if metadata is not None:
        payload["metadata"] = metadata

    if tags is not None:
        payload["tags"] = tags

    if deleted is not None:
        payload["deleted"] = deleted

    response = requests.patch(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/resources/{pid}",
        json=payload,
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()



def get_pid(username, namespace_id, pid):
    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/resources/{pid}",
        headers=auth_headers(username),
    )

    response.raise_for_status()

    return response.json()

def create_go_user(go_username):

    payload = {
        "username": go_username,
        "superuser": False,
    }

    response = requests.post(
        f"{settings.GO_BACKEND_URL}/api/v2/user",
        json=payload,
        headers={
            "Authorization": f"Bearer {settings.GO_BACKEND_TOKEN}",
        },
    )

    response.raise_for_status()

    return response.json()

def list_namespace_roles(username, namespace_id):
    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/roles",
        headers=auth_headers(username),
    )

    response.raise_for_status()
    return response.json()



def get_namespace_role(username, namespace_id, target_username):
    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/roles/{target_username}",
        headers=auth_headers(username),
    )

    response.raise_for_status()
    return response.json()


def set_namespace_role(username, namespace_id, target_username, role):
    response = requests.put(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/roles/{target_username}",
        json={"role": role},
        headers=auth_headers(username),
    )

    response.raise_for_status()
    return response.json()


def delete_namespace_role(username, namespace_id, target_username):
    response = requests.delete(
        f"{settings.GO_BACKEND_URL}/api/v2/resolver/namespaces/{namespace_id}/roles/{target_username}",
        headers=auth_headers(username),
    )

    response.raise_for_status()
    return response.json()


def list_user_roles(username):
    response = requests.get(
        f"{settings.GO_BACKEND_URL}/api/v2/user/roles",
        headers=auth_headers(username),
    )

    response.raise_for_status()
    return response.json()

