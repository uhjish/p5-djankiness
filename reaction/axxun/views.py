from django.shortcuts import render
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import authentication, permissions
from django.contrib.staticfiles.views import serve
from django.contrib.auth.decorators import login_required
from reaction.axxun.serializers import (UserSerializer, GroupSerializer, 
                                        ActionSerializer, RegistrationSerializer)
from reaction.axxun.models import Action


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminUser)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminUser)
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class ActionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    queryset = Action.objects.all()
    serializer_class = ActionSerializer
    def perform_create(self, serializer):
        #post requests can come in without a creator
        #this should be inferred from the user making the req
        serializer.save(creator=self.request.user)

class RegistrationView(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser)
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

@login_required(login_url='/api-auth/login/?next=/')
def protected_serve(request, path, insecure=False, **kwargs):
    return serve(request, path, insecure, **kwargs)
