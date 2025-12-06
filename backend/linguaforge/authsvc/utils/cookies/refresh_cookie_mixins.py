from typing import Optional
from django.conf import settings
from rest_framework.response import Response
from .refresh_cookies import set_refresh_cookie, clear_refresh_cookie, read_refresh_from_request

class TokenCookieMixin:
    """Mixin для роботи з cookie оновлення токена."""

    refresh_cookie_enabled_setting_name = "ISSUE_REFRESH_COOKIE"

    def _should_issue_cookie(self) -> bool:
        return bool(getattr(settings, self.refresh_cookie_enabled_setting_name, False))

    def attach_refresh_cookie(
        self, response: Response, refresh: Optional[str], remove_body_refresh: bool = True
    ) -> Response:
        if not self._should_issue_cookie() or not refresh:
            return response

        set_refresh_cookie(response, refresh)

        if remove_body_refresh and isinstance(getattr(response, "data", None), dict):
            response.data.pop("refresh", None)

        return response

    def detach_refresh_cookie(self, response: Response) -> Response:
        try:
            clear_refresh_cookie(response)
        except Exception:
            try:
                response.delete_cookie(getattr(settings, "REFRESH_COOKIE_NAME"))
            except Exception:
                pass
        return response

    def read_refresh_cookie(self, request):
        return read_refresh_from_request(request)
     