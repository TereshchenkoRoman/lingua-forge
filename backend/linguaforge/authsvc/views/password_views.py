import logging
import os
from typing import Optional
from urllib.parse import urlencode
from datetime import datetime, timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import BadSignature, SignatureExpired
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

# Local imports (adjust paths if your project structure differs)
from ..serializers.password_serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from ..services.email_services import make_email_confirmation_token, verify_email_confirmation_token, EMAIL_CONFIRM_MAX_AGE
from ..utils.cookies.refresh_cookie_mixins import TokenCookieMixin  # припускається, що у вас є цей міксин

from .email_views import send_email_async

User = get_user_model()
logger = logging.getLogger(__name__)



from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str


class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Не розкривати, чи існує email
            return Response({"detail": "If the email exists, a reset link has been sent."})

        # Генеруємо токен і uidb64
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # Беремо FRONTEND_URL і шлях з налаштувань
        frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
        frontend_path = getattr(settings, "PASSWORD_RESET_FRONTEND_PATH")
        query = urlencode({"uid": uidb64, "token": token})
        reset_url = f"{frontend_base}{frontend_path}?{query}"

        # Формуємо лист (plain text і/або HTML шаблон)
        message = render_to_string("emails/password_reset.txt", {"user": user, "reset_url": reset_url})
        subject = "LinguaForge password reset"
        send_email_async(subject, message, [user.email])

        return Response({"detail": "If the email exists, a reset link has been sent."})

User = get_user_model()


class PasswordResetConfirmView(TokenCookieMixin, APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data.get("uid")
        token = serializer.validated_data.get("token")
        new_password = serializer.validated_data.get("new_password")

        if not uidb64:
            return Response({"detail": "uid required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_object_or_404(User, pk=uid)
        except Exception:
            return Response({"detail": "Invalid uid."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        # Встановлюємо новий пароль
        user.set_password(new_password)
        user.save()

        # Інвалідовуємо всі outstanding refresh токени користувача (blacklist)
        try:
            outstanding = OutstandingToken.objects.filter(user=user)
            for ot in outstanding:
                BlacklistedToken.objects.get_or_create(token=ot)
        except Exception:
            # За потреби логування помилки
            pass

        # Повертаємо відповідь і видаляємо лише refresh кукі через міксин
        response = Response({"detail": "Password updated."}, status=status.HTTP_200_OK)

        # Використовуємо міксин для видалення refresh cookie
        # detach_refresh_cookie повертає response, тому можна chain-ити
        response = self.detach_refresh_cookie(response)

        return response