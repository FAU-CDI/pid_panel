from pathlib import Path

from django.http import FileResponse


def frontend(request, path=""):
    index_file = Path("/var/www/frontend/index.html")

    return FileResponse(
        open(index_file, "rb"),
        content_type="text/html",
    )