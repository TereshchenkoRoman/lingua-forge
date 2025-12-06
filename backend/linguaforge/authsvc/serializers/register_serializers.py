from rest_framework import serializers
from django.contrib.auth import get_user_model, password_validation
from accounts.models import Profile

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Register user with email + password + optional profile fields."""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    level_english = serializers.ChoiceField(
        choices=Profile.EnglishLevel.choices, required=False, allow_null=True
    )
    allow_save_audio = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "level_english",
            "allow_save_audio",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return email

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        password_validation.validate_password(attrs.get("password"), self.instance)
        return attrs

    def create(self, validated_data):
        level = validated_data.pop("level_english", None)
        allow = validated_data.pop("allow_save_audio", False)
        validated_data.pop("password2", None)
        raw_password = validated_data.pop("password")

        validated_data["email"] = validated_data["email"].lower()
        user = User.objects.create_user(password=raw_password, **validated_data)

        profile = getattr(user, "profile", None)
        if profile:
            if level is not None:
                profile.level_english = level
            profile.allow_save_audio = allow
            profile.save()
        return user