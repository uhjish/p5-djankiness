from django.conf.urls import include, url
from django.contrib import admin
from rest_framework import routers
from reaction.axxun import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'actions', views.ActionViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^admin/',include(admin.site.urls)),
    url(r'^', include(router.urls)),

    url(r'^register/$', views.RegistrationView.as_view()),

    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
