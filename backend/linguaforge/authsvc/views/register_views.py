from urllib.parse import urlencode
from django.template.loader import render_to_string
from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..serializers.register_serializers import UserRegistrationSerializer
from ..services.email_services import make_email_confirmation_token, EMAIL_CONFIRM_MAX_AGE
from .email_views import send_email_async

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        token = make_email_confirmation_token(user)
        confirm_path = reverse("auth-confirm-email")
        query = urlencode({"token": token})
        confirm_url = f"{self.request.scheme}://{self.request.get_host()}{confirm_path}?{query}"
        message = render_to_string(
            "emails/email_confirmation.txt",
            {"user": user, "confirm_url": confirm_url, "expiry_seconds": EMAIL_CONFIRM_MAX_AGE},
        )
        subject = "Confirm your LinguaForge email"
        send_email_async(subject, message, [user.email])