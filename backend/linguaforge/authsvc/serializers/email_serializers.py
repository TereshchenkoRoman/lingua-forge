from rest_framework import serializers


class EmailConfirmationSerializer(serializers.Serializer):
    token = serializers.CharField()