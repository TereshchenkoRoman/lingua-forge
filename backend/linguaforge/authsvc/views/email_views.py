from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import BadSignature, SignatureExpired
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers.email_serializers import EmailConfirmationSerializer
from ..services.email_services import verify_email_confirmation_token

User = get_user_model()

def send_email_async(subject: str, message: str, recipient_list: list) -> None:
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)

class ConfirmEmailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        serializer = EmailConfirmationSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        try:
            user_pk = verify_email_confirmation_token(token)
        except SignatureExpired:
            return Response({"detail": "Token expired."}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, pk=user_pk)
        if user.is_email_confirmed:
            return Response({"detail": "Email already confirmed."}, status=status.HTTP_200_OK)

        user.is_email_confirmed = True
        user.save(update_fields=["is_email_confirmed"])
        return Response({"detail": "Email confirmed."}, status=status.HTTP_200_OK)