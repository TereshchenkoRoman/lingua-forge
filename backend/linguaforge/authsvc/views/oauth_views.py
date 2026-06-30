from django.conf import settings
from django.http import HttpResponseBadRequest, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from ..services.oauth_service import (
    build_google_oauth_url,
    exchange_code_for_tokens,
    get_google_userinfo,
    create_or_update_user,
    issue_jwt_tokens,
    OAUTH_STATE_COOKIE,
)
from ..utils.cookies.refresh_cookie_mixins import TokenCookieMixin
from ..utils.oauth.state import (
    set_oauth_state_cookie,
    validate_oauth_state_cookie,
    clear_oauth_state_cookie,
)


class GoogleAuthURLView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        url, signed_state, _ = build_google_oauth_url(request)
        response = Response({"url": url}, status=status.HTTP_200_OK)
        response = set_oauth_state_cookie(response, signed_state, cookie_name=OAUTH_STATE_COOKIE)
        return response


class GoogleCallbackView(TokenCookieMixin, APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        error = request.GET.get("error")
        if error:
            return HttpResponseBadRequest("OAuth error")

        code = request.GET.get("code")
        state = request.GET.get("state")
        if not code or not state:
            return HttpResponseBadRequest("Missing code or state")

        try:
            validate_oauth_state_cookie(request, state, cookie_name=OAUTH_STATE_COOKIE)
        except ValueError as exc:
            return HttpResponseBadRequest(str(exc))

        try:
            token_response = exchange_code_for_tokens(code)
        except Exception:
            return HttpResponseBadRequest("Token exchange failed")

        access_token = token_response.get("access_token")
        id_token = token_response.get("id_token")

        try:
            userinfo = get_google_userinfo(access_token=access_token, id_token=id_token)
        except Exception:
            return HttpResponseBadRequest("Failed to fetch userinfo")

        try:
            user = create_or_update_user(userinfo)
        except Exception:
            return HttpResponseBadRequest("User creation failed")

        try:
            email_verified = userinfo.get("email_verified", False)
            if isinstance(email_verified, str):
                email_verified = email_verified.lower() in ("true", "1", "yes")
            if email_verified and hasattr(user, "is_email_confirmed"):
                if not getattr(user, "is_email_confirmed", False):
                    user.is_email_confirmed = True
                    user.save(update_fields=["is_email_confirmed"])
        except Exception:
            pass

        tokens = issue_jwt_tokens(user)
        refresh_token = tokens.get("refresh")

        response = HttpResponseRedirect(f"{settings.FRONTEND_URL.rstrip('/')}/oauth2/redirect")
        response = self.attach_refresh_cookie(response, refresh_token, remove_body_refresh=True)
        response = clear_oauth_state_cookie(response, cookie_name=OAUTH_STATE_COOKIE)
        return response


class GoogleCompleteView(TokenCookieMixin, APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = self.read_refresh_cookie(request)
        if not refresh_token:
            return Response({"detail": "No refresh token cookie"}, status=status.HTTP_401_UNAUTHORIZED)

        from rest_framework_simplejwt.tokens import RefreshToken, TokenError

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            return Response({"access": access_token}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)