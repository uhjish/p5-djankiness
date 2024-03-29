from django.contrib.auth.models import User, Group
from rest_framework import serializers
from models import Action

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id','url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')


class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = ('id','creator','assignee','title','description','done','deadline')
