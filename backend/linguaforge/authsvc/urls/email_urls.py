from django.urls import path
from ..views.email_views import ConfirmEmailView

urlpatterns = [
    path("confirm-email/", ConfirmEmailView.as_view(), name="auth-confirm-email"),
]