/**
 * this filters out angularJs specific attributes 
 * and returns attributes to be used as options
 */
ngMap.provider('Attr2Options', function() {

  this.$get = function() {
    return function(attrs) {
    
      // filtering attributes  
      // 1. skip angularjs methods $.. $$..
      // 2. control options are handled by control directive, not in attribute
      var options = {};
      for(var key in attrs) {
        if (key.match(/^\$/));
        else if (key.match(/Control(Options)?$/)) ;
        else
          options[key] = attrs[key];
      }
      return options;
    };
  };
});
