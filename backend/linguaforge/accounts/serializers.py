from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for Profile model.
    Read/write of profile fields is handled by ProfileSerializer when used directly,
    but in UserProfileSerializer we keep profile read_only to avoid nested writes here.
    """
    class Meta:
        model = Profile
        fields = ["level_english", "allow_save_audio"]


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for User with embedded profile and a computed flag `profile_complete`.
    `profile_complete` is a convenience field that indicates whether the user
    has provided the minimal required profile information according to business rules.
    """
    profile = ProfileSerializer(read_only=True)
    profile_complete = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_email_confirmed",
            "profile",
            "profile_complete",
        ]
        read_only_fields = ["email", "is_email_confirmed"]

    def get_profile_complete(self, obj):
        """
        Define rules for profile completeness here.
        Current rule (adjustable):
          - If first_name or last_name is provided -> complete
          - OR if profile.level_english is set -> complete
          - Otherwise -> incomplete
        This keeps the check simple and avoids adding a DB field.
        """
        profile = getattr(obj, "profile", None)
        # If no profile object exists, treat as incomplete
        if not profile:
            return False

        # If user provided name fields, consider profile complete
        if (obj.first_name and obj.first_name.strip()) or (obj.last_name and obj.last_name.strip()):
            return True

        # If user selected English level, consider profile complete
        if profile.level_english:
            return True

        # Optionally, you could consider allow_save_audio as part of completeness,
        # but typically a preference flag alone shouldn't mark profile as complete.
        return False
