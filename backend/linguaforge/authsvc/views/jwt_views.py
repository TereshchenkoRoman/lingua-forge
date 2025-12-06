from typing import Optional
from datetime import datetime

from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework.request import Request
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from ..utils.cookies.refresh_cookie_mixins import TokenCookieMixin

User = get_user_model()


class TokenRefreshViewCustom(TokenCookieMixin, TokenRefreshView):
    permission_classes = ( )

    def post(self, request: Request, *args, **kwargs):
        """
        If refresh tokens are stored in an HttpOnly cookie, inject it into request.data
        only when the request body does not include 'refresh', so the standard serializer
        can operate without the frontend reading the cookie.
        """
        incoming_refresh = None

        if self._should_issue_cookie():
            cookie_refresh = self.read_refresh_cookie(request)
            try:
                if cookie_refresh:
                    data = request.data.copy()
                    if not data.get("refresh"):
                        data["refresh"] = cookie_refresh
                        request._full_data = data
                    incoming_refresh = cookie_refresh
            except Exception:
                pass

        if not incoming_refresh:
            try:
                incoming_refresh = request.data.get("refresh")
            except Exception:
                incoming_refresh = None

        response = super().post(request, *args, **kwargs)

        try:
            new_refresh = None
            if response.status_code == 200 and isinstance(response.data, dict):
                candidate = response.data.get("refresh")
                if isinstance(candidate, str):
                    new_refresh = candidate

            if new_refresh:
                try:
                    rt = RefreshToken(new_refresh)
                    jti = rt.get("jti")
                    exp_ts = rt.get("exp")
                    simple_jwt = getattr(settings, "SIMPLE_JWT", {}) or {}
                    user_id_claim = simple_jwt.get("USER_ID_CLAIM", "user_id")
                    uid = getattr(rt, "payload", rt).get(user_id_claim)
                    user_obj = None
                    if uid is not None:
                        user_obj = User.objects.filter(pk=uid).first()

                    expires_at = None
                    if exp_ts:
                        try:
                            expires_at = datetime.fromtimestamp(int(exp_ts))
                        except Exception:
                            expires_at = None

                    if jti:
                        defaults = {}
                        if user_obj:
                            defaults["user"] = user_obj
                        if expires_at:
                            defaults["expires_at"] = expires_at
                        try:
                            OutstandingToken.objects.get_or_create(
                                jti=jti,
                                defaults={**defaults, "token": str(rt)}
                            )
                        except TypeError:
                            OutstandingToken.objects.get_or_create(jti=jti, defaults=defaults)
                except Exception:
                    pass
        except Exception:
            pass

        return response

    def finalize_response(self, request, response, *args, **kwargs):
        """
        After the standard TokenRefreshView processing, attach the refresh cookie
        if the response is successful and contains a refresh token string.
        """
        response = super().finalize_response(request, response, *args, **kwargs)

        refresh: Optional[str] = None
        try:
            if response.status_code == 200 and isinstance(response.data, dict):
                candidate = response.data.get("refresh")
                if isinstance(candidate, str):
                    refresh = candidate
        except Exception:
            refresh = None

        return self.attach_refresh_cookie(response, refresh, remove_body_refresh=True)
