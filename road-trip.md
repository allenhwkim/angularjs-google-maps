Road Trip With Google Street View

  1. map
  2. directions
  3. street-view-panorama
  4. places-auto-complete

You need a map.

    <map zoom="18" center="current-position">
    </map>

First, plan your trip. In other words, set a driving direction

    Start: <input places-auto-complete ng-model="origin" size=40 />    
    End:   <input places-auto-complete ng-model="destination" size=40 />
    <map zoom="18" center="current-position">
    </map>

Next, see your road trip plan on the map

    Start: <input places-auto-complete ng-model="origin" size=40 />    
    End:   <input places-auto-complete ng-model="destination" size=40 />
    <map zoom="18" center="current-position">
      <directions origin="{{origin}}" destination="{{destination}}"></directions>
    </map>

Finally, see the road with streetview

    Start: <input places-auto-complete ng-model="origin" size=40 />    
    End:   <input places-auto-complete ng-model="destination" size=40 />
    <map zoom="18" center="current-position">
      <directions origin="{{origin}}" destination="{{destination}}"></directions>
      <street-view-panorama container="streetview"></street-view-panorama> <!-- THIS -->
    </map>
    <div id="streetview"></div> <!-- And, THIS -->

Well done!! Now, you are ready to see your trip with street view.
1. Click around the street view, then you will see your position on the map.
2. Drag your streetview icon around on the map, then you will see the street view applied accordingly.


However, you want more than that.
You want to drive the directions from start point to end point, but you are tired of clicking streetview.
You want the map follows the driving directions automatically on every second, and you want to see the street accordingly.

Then, you need some coding for that. yes. some, but not much.

First, you need to get driving paths when driving direction is changed.

    <directions origin="{{origin}}" destination="{{destination}}" on-directions_changed="getPath(e)" ></directions>

    $scope.directionsChanged = function() {
      $scope.paths = this.directions.routes[0].overview_path;  //save path
      $scope.map.getStreetView().setPosition($scope.paths[0]); //reset streetview
    }

Second, when click a button, it plays automatically

    <button ng-click="play()">Play/Stop</button>

    $scope.play = function() {
      var svp = $scope.map.getStreetView();
      var index = 0;
      $interval(function() {
        svp.setPosition($scope.paths[index++]);
      }, 1000);
    };


