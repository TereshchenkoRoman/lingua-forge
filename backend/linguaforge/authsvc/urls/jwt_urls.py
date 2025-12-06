from django.urls import path
from ..views. jwt_views import TokenRefreshViewCustom

urlpatterns = [
    path("token/refresh/", TokenRefreshViewCustom.as_view(), name="token-refresh"),
]