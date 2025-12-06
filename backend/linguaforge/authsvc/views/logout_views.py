from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ..utils.cookies.refresh_cookie_mixins import TokenCookieMixin


class LogoutView(TokenCookieMixin, APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """
        Blacklist refresh token on logout. Accepts refresh token in body
        or uses cookie (if set by backend).
        """
        refresh = request.data.get("refresh") if getattr(request, "data", None) else None

        if not refresh:
            refresh = self.read_refresh_cookie(request)

        if not refresh:
            return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            RefreshToken(refresh).blacklist()
        except Exception:
            pass

        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        return self.detach_refresh_cookie(response)