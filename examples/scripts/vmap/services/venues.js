ngMap.factory("Venue", [
  "$resource",
  function($resource) {
    return $resource("http://localhost:8080/venues/:id", { id: "@id" }, {
      update: { method: "PUT" },
    });
  }
]);
