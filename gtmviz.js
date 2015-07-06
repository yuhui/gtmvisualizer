/**
 * Master GTM Visualisation class.
 */
var GtmViz = GtmViz || function () {
  "use strict";
};

GtmViz.container;

/**
 * @constructor
 */
GtmViz.setContainer = function(jsonContainer) {
  this.resetContainer();
  this.container = new GtmLib(jsonContainer);
};

GtmViz.resetContainer = function() {
  this.container = null;
}

/**
 * Builds the list from the given objects.
 *
 * @param {string} collection 'tags', 'triggers' or 'variables'
 * @param {jQuery array} objects tags, triggers or variables
 */
GtmViz._buildList = function(collection, objects, log) {

  /**
   * Builds the list of children from the given object.
   *
   * @param {string} childCollection 'tags', 'triggers' or 'variables'
   * @param {jQuery array} childObjects tags, triggers or variables
   * @param {jQuery node} parentList The parent list ID
   */
  function buildChildren(childCollection, childObjects, parentList) {
    var childItemName = childCollection.substring(0, 1).toUpperCase() +
        childCollection.substring(1);
    var childItem = $('<li>', {
      text: childItemName
    });
    parentList.append(childItem);

    var parentId = parentList.attr('id').replace('_list', '');
    var childId = parentId + '_' + childCollection;
    var childList = $('<ul>', {
      id: childId
    });
    childItem.append(childList);

    var childObject, childListItem, childListItemName;
    for (var x = 0, y = childObjects.length; x < y; x++) {
      childObject = childObjects[x];
      childListItem = $('<li>', {
        id: childId + '_' + childObject.objectId
      });
      childList.append(childListItem);

      childListItemName = $('<span>', {
        class: 'type_' +
            childCollection.substring(0, childCollection.length - 1),
        text: childObject.name
      });
      childListItem.append(childListItemName);
    }
  }

  if (objects.length > 0) {
    var parentNode = $('#' + collection);
    parentNode.empty();

    var collectionList = $('<ul>', {
      id: collection + '_list'
    });
    parentNode.append(collectionList);

    for (var i = 0, j = objects.length; i < j; i++) {
      var object = objects[i];

      var collectionItemId = collection + '_' + object.objectId;
      var collectionItem = $('<li>', {
        id: collectionItemId
      });
      collectionList.append(collectionItem);

      var collectionItemName = $('<span>', {
        class: 'type_' + collection.substring(0, collection.length - 1),
        text: object.name
      });
      collectionItem.append(collectionItemName);

      var itemChildrenList = $('<ul>', {
        id: collectionItemId + '_list',
        class: 'child_list'
      });
      collectionItem.append(itemChildrenList);

      if (object.hasTags && object.hasTags()) {
        buildChildren('tags', object.getTags(), itemChildrenList);
      }
      if (object.hasTriggers && object.hasTriggers()) {
        buildChildren('triggers', object.getTriggers(), itemChildrenList);
      }
      if (object.hasVariables && object.hasVariables()) {
        buildChildren('variables', object.getVariables(), itemChildrenList);
      }
    }
  }
};

/**
 * Builds the list of objects for the given collection.
 *
 * @param {string} collection 'tags', 'triggers' or 'variables'
 */
GtmViz._listCollection = function(collection) {
  if (this.container) {
    var objects;

    switch (collection) {
    case 'tags':
      objects = this.container.getTags();
      break;
    case 'triggers':
      objects = this.container.getTriggers();
      break;
    case 'variables':
      objects = this.container.getVariables();
      break;
    }

    this._buildList(collection, objects);
  }
};

GtmViz.listTags = function() {
  this._listCollection('tags');
};

GtmViz.listTriggers = function() {
  this._listCollection('triggers');
};

GtmViz.listVariables = function() {
  this._listCollection('variables');
};