import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from django.core.asgi import get_asgi_application
from fastapi_app.main import app as fastapi_app


django_application = get_asgi_application()


class CombinedASGI:
    async def __call__(self, scope, receive, send):
        path = scope.get("path", "")

        # FastAPI routes
        if (
            path.startswith("/api/products")
            or path.startswith("/api/orders")
            or path.startswith("/api/faqs")
            or path.startswith("/api/chat")
            or path.startswith("/api/admin/dashboard")
            or path.startswith("/api/admin/orders")
            or path.startswith("/api/admin/customers")
            or path.startswith("/api/payments/create-order")
            or path.startswith("/api/payments/verify")
            or path.startswith("/api/products/upload-image")
            or path.startswith("/api/reviews")
            or path.startswith("/api/products/{product_id}/reviews")
            or path.startswith("/api/admin/reviews")
            
            or path == "/ws"
        ):
            await fastapi_app(scope, receive, send)
            return

        # Django routes
        await django_application(scope, receive, send)


application = CombinedASGI()







# import os

# from django.core.asgi import get_asgi_application


# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# application = get_asgi_application()