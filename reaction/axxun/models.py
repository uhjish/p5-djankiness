from django.db import models
from django.contrib.auth.models import User

class Action(models.Model):
    creator = models.ForeignKey(User)
    assignee = models.ForeignKey(User, related_name='+')
    title = models.CharField(max_length=80)
    description = models.CharField(max_length=160)
    done = models.BooleanField()
    deadline = models.DateTimeField(auto_now_add=False)
    updated = models.DateTimeField(auto_now_add=True)
