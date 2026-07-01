from rest_framework import serializers


class NamespaceSerializer(
    serializers.Serializer
):

    id = serializers.CharField()

    tag = serializers.CharField()

    permissions = serializers.ListField()