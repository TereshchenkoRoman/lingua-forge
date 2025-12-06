from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/v1/auth/", include("accounts.urls")),

    path("api/v1/auth/", include("authsvc.urls.auth_urls")),
    path("api/v1/auth/", include("authsvc.urls.email_urls")),
    path("api/v1/auth/", include("authsvc.urls.jwt_urls")),
    path("api/v1/auth/", include("authsvc.urls.oauth_urls")),
    path("api/v1/auth/", include("authsvc.urls.password_urls")),

    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/v1/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]