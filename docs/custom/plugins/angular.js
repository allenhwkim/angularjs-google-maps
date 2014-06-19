exports.defineTags = function(dictionary) {
  dictionary.defineTag('ngdoc', {
    mustHaveValue: true,
    onTagged : function(doclet, tag) {
      doclet.ngdoc = tag.value;
    }
  });
};
