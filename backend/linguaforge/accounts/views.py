from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserProfileSerializer


class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        profile_data = request.data.get("profile")
        if profile_data:
            profile = getattr(request.user, "profile", None)
            if profile is not None:
                level = profile_data.get("level_english")
                if level is not None:
                    profile.level_english = level
                if "allow_save_audio" in profile_data:
                    profile.allow_save_audio = bool(profile_data.get("allow_save_audio"))
                profile.save()

        return Response(UserProfileSerializer(request.user).data)