from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Profile

User = get_user_model()


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    fk_name = "user"
    fields = ("level_english", "allow_save_audio")
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
        "is_email_confirmed",
        "profile_level",
        "profile_allow_save_audio",
    )
    list_filter = (
        "is_staff",
        "is_active",
        "is_email_confirmed",
        "profile__level_english",
        "profile__allow_save_audio",
    )
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important flags", {"fields": ("is_email_confirmed",)}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("profile")

    def profile_level(self, obj):
        return getattr(obj.profile, "level_english", None)
    profile_level.short_description = "English level"
    profile_level.admin_order_field = "profile__level_english"

    def profile_allow_save_audio(self, obj):
        return getattr(obj.profile, "allow_save_audio", False)
    profile_allow_save_audio.short_description = "Allow save audio"
    profile_allow_save_audio.boolean = True
    profile_allow_save_audio.admin_order_field = "profile__allow_save_audio"