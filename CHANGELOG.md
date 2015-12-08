Release Notes
===============

# 1.15.0

  * All attributes can have `{{}}` expression evaluated.
  
# 1.14.0

  * Prepared for Angular2 transition by removing all scopes
  * NgMap service is introduced
  * Refactored

# 1.13.0

  * New directive `custom-marker`

# 1.12.0

  * Refactored documentation with angular-jsdoc

# 1.10.0

  * Added an event `objectChanged` to broadcast change of objects in map. e.g., markers, shapes, etc

# 1.9.0

  * Refactored directory structure

# 1.7.0

  * added **directions** directive
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/directions.html)
  * added **places-auto-complete** for input tag.
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/places-auto-complete.html)

# 1.6.0

  * added **street-view-panorama** directive with its examples;
    [street view with marker](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view-panorama.html) and
    [street view in its own container](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view-panorama_container.html)

# 1.5.0

  * added **geo-callback attribute** for map, marker, shape, and info-window.
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/map_with_current_position.html)

# 1.4.0

  * support lazy loading of maps js with directive, **map-lazy-load**, which does not require to `https://maps.google.com/maps/api/js`
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/map-lazy-load.html)

# 1.3.0

  * added **drawing-manager** directive. Thanks to Fangming Du
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/drawing-manager.html)

# 1.2.0

  * events with `controller as` syntax, thanks to Simon

# 1.1.0

  * marker directive can have icon attribute as JSON
  * map with init-event attribute for initialization by an event

# 1.0.0
 * Cover all official google maps v3 examples using directives.
