from django.conf.urls import include, url, patterns
from django.contrib import admin
from rest_framework import routers
from reaction.axxun import views

#RESTive without a bunch of boilerplate
router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'actions', views.ActionViewSet)

#make sure admin picks up defined models
admin.autodiscover()

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^admin/',include(admin.site.urls)),
    url(r'^api/', include(router.urls)),
    url(r'^api/register/$', views.RegistrationView.as_view()),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),

]
urlpatterns += patterns( 'django.contrib.staticfiles.views',
                        url(r'^(?:index.html)?$', 'serve', kwargs={'path': 'index.html'}),
                        url(r'^(?P<path>(?:js|css|img)/.*)$', 'serve'),
)
