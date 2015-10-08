from django.shortcuts import render
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import authentication, permissions
from reaction.axxun.serializers import (UserSerializer, GroupSerializer, 
                                        ActionSerializer, RegistrationSerializer)
from reaction.axxun.models import Action


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class ActionViewSet(viewsets.ModelViewSet):
    permission_classes = ()
    queryset = Action.objects.all()
    serializer_class = ActionSerializer

class RegistrationView(APIView):
    permission_classes = ()

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,\
                            status=status.HTTP_400_BAD_REQUEST)
        data = serializer.data
        u = User.objects.create(username=data['username'])
        u.set_password(data['password'])
        u.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

