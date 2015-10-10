from django.conf.urls import include, url, patterns
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin
from rest_framework import routers
from reaction.axxun import views
from reaction.axxun import models

#overkill since we already have the rest-framework UI
admin.site.register(models.Action)

#RESTive without a bunch of boilerplate
router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'actions', views.ActionViewSet)


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^admin/',include(admin.site.urls)),
    url(r'^api/', include(router.urls)),
    url(r'^api/register/$', views.RegistrationView.as_view()),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),

]
urlpatterns += patterns( '',
                        url(r'^(?:index.html)?$', views.protected_serve, kwargs={'path': 'index.html'}),
                        url(r'^(?P<path>(?:js|css|img)/.*)$', views.protected_serve),
)
urlpatterns += staticfiles_urlpatterns()
