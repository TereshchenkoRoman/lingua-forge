from typing import Optional
from datetime import datetime

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from ..utils.cookies.refresh_cookie_mixins import TokenCookieMixin

User = get_user_model()


class TokenObtainPairViewCustom(TokenCookieMixin, TokenObtainPairView):
    permission_classes = (AllowAny,)

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Attach refresh cookie when a refresh token is issued and ensure an OutstandingToken exists.
        """
        response = super().finalize_response(request, response, *args, **kwargs)

        refresh: Optional[str] = None
        if response.status_code == 200 and isinstance(response.data, dict):
            candidate = response.data.get("refresh")
            if isinstance(candidate, str):
                refresh = candidate

        if refresh:
            try:
                rt = RefreshToken(refresh)
                jti = rt.get("jti")
                exp_ts = rt.get("exp")

                simple_jwt = getattr(settings, "SIMPLE_JWT", {}) or {}
                user_id_claim = simple_jwt.get("USER_ID_CLAIM", "user_id")
                uid = getattr(rt, "payload", rt).get(user_id_claim)

                user_obj = User.objects.filter(pk=uid).first() if uid is not None else None

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

        return self.attach_refresh_cookie(response, refresh, remove_body_refresh=True)