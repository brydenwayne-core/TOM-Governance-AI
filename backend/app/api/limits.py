from starlette.responses import JSONResponse


class UploadSizeLimit:
    """Bound multipart request memory before parsers spool uploaded files to disk."""

    def __init__(self, app, max_bytes=6 * 1024 * 1024):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope.get("method") != "POST" or scope.get("path") != "/api/documents":
            return await self.app(scope, receive, send)
        events = []
        size = 0
        while True:
            event = await receive()
            if event["type"] == "http.disconnect":
                return
            size += len(event.get("body", b""))
            if size > self.max_bytes:
                response = JSONResponse({"detail": "Multipart upload exceeds 6 MiB request limit"}, status_code=413)
                return await response(scope, receive, send)
            events.append(event)
            if not event.get("more_body", False):
                break

        async def replay():
            if events:
                return events.pop(0)
            return await receive()

        await self.app(scope, replay, send)
