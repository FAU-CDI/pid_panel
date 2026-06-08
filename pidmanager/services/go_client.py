import requests

BASE_URL = "http://127.0.0.1:8080"


def list_namespaces():

    response = requests.get(
        f"{BASE_URL}/api/v2/resolver/namespaces"
    )

    response.raise_for_status()

    return response.json()


def create_namespace(
    tag,
    pattern,
    characters
):

    payload = {
        "tag": tag,
        "pid_format": {
            "pattern": pattern,
            "characters": characters
        }
    }

    response = requests.post(
        f"{BASE_URL}/api/v2/resolver/namespaces",
        json=payload
    )

    response.raise_for_status()

    return response.json()