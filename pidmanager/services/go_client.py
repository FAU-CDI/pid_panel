import requests

BASE_URL = "http://127.0.0.1:8080"


def list_namespaces(limit=3, offset=0):

    response = requests.get(
        f"{BASE_URL}/api/v2/resolver/namespaces",
        params={
            "limit": limit,
            "offset": offset,
        },
    )

    response.raise_for_status()

    return response.json()


def create_namespace(tag, pattern, characters):

    payload = {"tag": tag, "pid_format": {"pattern": pattern, "characters": characters}}

    response = requests.post(f"{BASE_URL}/api/v2/resolver/namespaces", json=payload)

    response.raise_for_status()

    return response.json()


def create_pid(namespace_id, url, metadata, tag):

    payload = {"url": url, "metadata": metadata, "tag": tag}

    response = requests.post(
        f"{BASE_URL}/api/v2/resolver/namespaces/{namespace_id}/resources", json=payload
    )

    response.raise_for_status()

    return response.json()


def list_pids(namespace_id, limit=3, offset=0):

    response = requests.get(
        f"{BASE_URL}/api/v2/resolver/namespaces/{namespace_id}/resources",
        params={
            "limit": limit,
            "offset": offset,
        },
    )

    response.raise_for_status()

    return response.json()


def update_pid(namespace_id, pid, url, metadata, tag, deleted):

    payload = {"url": url, "metadata": metadata, "tag": tag, "deleted": deleted}

    response = requests.patch(
        f"{BASE_URL}/api/v2/resolver/namespaces/{namespace_id}/resources/{pid}",
        json=payload,
    )

    response.raise_for_status()

    return response.json()


def get_pid(namespace_id, pid):
    response = requests.get(
        f"{BASE_URL}/api/v2/resolver/namespaces/{namespace_id}/resources/{pid}"
    )

    response.raise_for_status()

    return response.json()
