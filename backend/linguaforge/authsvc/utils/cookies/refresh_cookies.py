from typing import Optional
from django.conf import settings
from datetime import timedelta

REFRESH_COOKIE_NAME = getattr(settings, "REFRESH_COOKIE_NAME", "refresh")
REFRESH_COOKIE_SAMESITE = getattr(settings, "REFRESH_COOKIE_SAMESITE", "Lax")
REFRESH_COOKIE_SECURE = getattr(settings, "REFRESH_COOKIE_SECURE", not settings.DEBUG)
REFRESH_COOKIE_HTTPONLY = True
REFRESH_COOKIE_PATH = getattr(settings, "REFRESH_COOKIE_PATH", "/")
REFRESH_COOKIE_DOMAIN = getattr(settings, "REFRESH_COOKIE_DOMAIN", None)

_simple_jwt = getattr(settings, "SIMPLE_JWT", {}) or {}
_refresh_lifetime = _simple_jwt.get("REFRESH_TOKEN_LIFETIME", timedelta(days=14))
REFRESH_COOKIE_MAX_AGE = int(_refresh_lifetime.total_seconds())


def set_refresh_cookie(response, refresh: str):
    """Set HttpOnly refresh cookie on the response."""
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=str(refresh),
        httponly=REFRESH_COOKIE_HTTPONLY,
        secure=REFRESH_COOKIE_SECURE,
        samesite=REFRESH_COOKIE_SAMESITE,
        max_age=REFRESH_COOKIE_MAX_AGE,
        path=REFRESH_COOKIE_PATH,
        domain=REFRESH_COOKIE_DOMAIN,
    )
    return response


def clear_refresh_cookie(response):
    """Remove refresh cookie from the client."""
    response.delete_cookie(REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH, domain=REFRESH_COOKIE_DOMAIN)
    return response


def read_refresh_from_request(request) -> Optional[str]:
    """Return refresh token value from cookies or None."""
    return request.COOKIES.get(REFRESH_COOKIE_NAME)
