exports.defineTags = function(dictionary) {
  dictionary.defineTag('ngdoc', {
    mustHaveValue: true,
    onTagged : function(doclet, tag) {
doclet.addTag('kind', 'class');
      doclet.ngdoc = tag.value;
    }
  });
};
