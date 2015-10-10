### Overview

Basic Django-REST app with an AngularJS frontend (VisJS directive)

Was hacked together in a few hours and as such is missing tests, docs, tox, and production build optimizations.

### Deployment

- App: [p5-djankiness.herokuapp.com](http://p5-djankiness.herokuapp.com)
- user: admin, password: password
- REST-Framework console: [p5-djankiness.herokuapp.com/api/](http://p5-djankiness.herokuapp.com/api/)
- Admin console: [p5-djankiness.herokuapp.com/admin/](http://p5-djankiness.herokuapp.com/admin/)
- To register a new user: post json {"username":"user", "password":"pass"} to /api/register after authenticating
- or use the admin console

#### Goal is to show a set of Action with associated features:

1. Title
2. Description
3. Assignee
4. Deadline (due date)
5. Done (yes/no)

There should be some indication of the actions relative to the current month.
Also, a marker for whether the task is finished.

Standard CRUD operations through REST verbs should be allowed for Actions.

### Caveats

Not using jinja2 for templating, but angular's templating system is much the same.
Frontend routing is handle in angular /list, /edit/:item, /create 
Hijacking the /api-auth endpoint that comes with django rest-framework for handling common auth (this would be fixed in production using oauth2 to handle API and app auth simultaneously)

#### Angular app 
- packages all templates inline into index.html, and 
- all modules, controllers, and directives into app.js
- missing require.js for dep management
- missing uglify and browserify/webpack for packaging

#### Django app
- uses default rest framework viewsets for CRUD/REST operations
- couples them with two way serializers wrapping the models
- missing staticfiles compilation and caching
