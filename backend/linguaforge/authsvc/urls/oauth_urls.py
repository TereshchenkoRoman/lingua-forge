from django.urls import path
from ..views.oauth_views import GoogleAuthURLView, GoogleCallbackView, GoogleCompleteView

urlpatterns = [
    path("google/url/", GoogleAuthURLView.as_view(), name="google-auth-url"),
    path("google/callback/", GoogleCallbackView.as_view(), name="google-callback"),
    path("google/complete/", GoogleCompleteView.as_view(), name="google-complete"),
]