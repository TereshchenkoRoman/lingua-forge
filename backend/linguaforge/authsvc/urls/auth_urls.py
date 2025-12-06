from django.urls import path
from ..views import register_views, login_views, logout_views

urlpatterns = [
    path("register/", register_views.RegisterView.as_view(), name="auth-register"),
    path("login/", login_views.TokenObtainPairViewCustom.as_view(), name="auth-login"),
    path("logout/", logout_views.LogoutView.as_view(), name="auth-logout"),
]