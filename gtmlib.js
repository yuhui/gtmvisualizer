/**
 * TODO
 * map tags and triggers from variables
 */

/**
 * GTM convenience classes for tags, triggers and variables.
 */


/**
 * Sub-class one class with another.
 * http://www.golimojo.com/etc/js-subclass.html
 *
 * @param {object} subClass The inheriting class, or subclass.
 * @param {Object} baseClass The class from which to inherit.
 */
function GtmSubclass(subClass, baseClass) {
	function inheritance() {}
	inheritance.prototype = baseClass.prototype;
	var prototypeObject = new inheritance();
	prototypeObject.subClass = subClass;
	subClass.prototype = prototypeObject;
}

/**
 * Generic GTM object (tag, trigger, variable).
 * @constructor
 */
function GtmObject(object) {
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      var value = object[key];
      if (['tagId', 'triggerId', 'variableId'].indexOf(key) > -1) {
        this.objectId = value;
      } else {
        this[key] = value;
      }
    }
  }
}

/**
 * @private
 *
 * @param {string} field Field to match.
 * @param {string} value Value to match.
 *
 * @return {boolean} True if value matches for the given field.
 */
GtmObject.prototype._matches = function(field, value) {
  return this[field] === value;
};

GtmObject.prototype.matchesId = function(idToMatch) {
  return this._matches('objectId', idToMatch);
};

GtmObject.prototype.matchesName = function(nameToMatch) {
  return this._matches('name', nameToMatch);
};

GtmObject.prototype.itemName = function(item) {
  return item.name;
};

GtmObject.prototype.compareItemNames = function(itemA, itemB) {
  if (itemA.name > itemB.name) {
    return 1;
  }
  if (itemA.name < itemB.name) {
    return -1;
  }
  // itemA must be equal to itemB
  return 0;
};

GtmObject.prototype.getItems = function(items) {
  return this[items].sort(this.compareItemNames);
};

GtmObject.prototype.hasItems = function(items) {
  return this[items] && this[items].length > 0;
};

/**
 * Generic GTM tag.
 * @constructor
 *
 * @see GtmObject
 */
GtmSubclass(GtmTag, GtmObject);
function GtmTag(tag) {
  GtmObject.call(this, tag);
  this.triggers = [];
  this.variables = [];
}
GtmTag.prototype.getTriggers = function() {
  return this.getItems('triggers');
}
GtmTag.prototype.getVariables = function() {
  return this.getItems('variables');
}
GtmTag.prototype.hasTriggers = function() {
  return this.hasItems('triggers');
}
GtmTag.prototype.hasVariables = function() {
  return this.hasItems('variables');
}

/**
 * Generic GTM trigger.
 * @constructor
 *
 * @see GtmObject
 */
GtmSubclass(GtmTrigger, GtmObject);
function GtmTrigger(trigger) {
  GtmObject.call(this, trigger);
  this.tags = [];
  this.variables = [];
}
GtmTrigger.prototype.getTags = function() {
  return this.getItems('tags');
}
GtmTrigger.prototype.getVariables = function() {
  return this.getItems('variables');
}
GtmTrigger.prototype.hasTags = function() {
  return this.hasItems('tags');
}
GtmTrigger.prototype.hasVariables = function() {
  return this.hasItems('variables');
}

/**
 * Generic GTM variable.
 * @constructor
 *
 * @see GtmObject
 */
GtmSubclass(GtmVariable, GtmObject);
function GtmVariable(variable) {
  GtmObject.call(this, variable);
  this.tags = [];
  this.triggers = [];
}
GtmVariable.prototype.getTags = function() {
  return this.getItems('tags');
}
GtmVariable.prototype.getTriggers = function() {
  return this.getItems('triggers');
}
GtmVariable.prototype.hasTags = function() {
  return this.hasItems('tags');
}
GtmVariable.prototype.hasTriggers = function() {
  return this.hasItems('triggers');
}

/**
 * end GTM convenience classes
 */


/**
 * Master GTM class.
 * @constructor
 */
function GtmLib(gtmContainer) {
  'use strict';
  this.containerJson = String.isString(gtmContainer) ?
      JSON.parse(gtmContainer) : gtmContainer;
  this.tags = [];
  this.triggers = [];
  this.variables = [];

  this.compileTagsTriggersAndVariables();

  this.addBuiltInVariables();
  this.addBuiltInTriggers();

  this.mapTagsTriggersAndVariables();
}


/**
 * Utilities
 */

/**
 * Returns the number of objects in the specified collection.
 *
 * @private
 *
 * @param {string} collection 'tags', 'triggers' or 'variables'.
 *
 * @return {number} Number of objects in the specified collection.
 */
GtmLib.prototype._numObjects = function(collection) {
  'use strict';
  return this[collection].length;
};

GtmLib.prototype.numTags = function() {
  'use strict';
  return this._numObjects('tags');
};

GtmLib.prototype.numTriggers = function() {
  'use strict';
  return this._numObjects('triggers');
};

GtmLib.prototype.numVariables = function() {
  'use strict';
  return this._numObjects('variables');
};

GtmLib.prototype.hasContainer = function() {
  'use strict';
  return this.isObject(this.containerJson) &&
      Object.keys(this.containerJson).length > 0;
};

GtmLib.prototype.hasTags = function() {
  'use strict';
  return this.numTags() > 0;
};

GtmLib.prototype.hasTriggers = function() {
  'use strict';
  return this.numTriggers() > 0;
};

GtmLib.prototype.hasVariables = function() {
  'use strict';
  return this.numVariables() > 0;
};

GtmLib.prototype.compareItemNames = function(itemA, itemB) {
  if (itemA.name > itemB.name) {
    return 1;
  }
  if (itemA.name < itemB.name) {
    return -1;
  }
  // itemA must be equal to itemB
  return 0;
};

GtmLib.prototype.getTags = function() {
  'use strict';
  return this.tags.sort(this.compareItemNames);
};

GtmLib.prototype.getTriggers = function() {
  'use strict';
  return this.triggers.sort(this.compareItemNames);
};

GtmLib.prototype.getVariables = function() {
  'use strict';
  return this.variables.sort(this.compareItemNames);
};

/**
 * end Utilities
 */


/**
 * Finders
 */

/**
 * Finds an object in a collection (tags, triggers or variables) by ID.
 *
 * @private
 *
 * @param {object} object GtmTag, GtmTrigger or GtmVariable.
 *
 * @this {array} Has only one item: ID to match.
 *
 * @return {object} True if the object's ID matches.
 */
GtmLib.prototype._findObjectById = function(object) {
  return object.matchesId(this[0]);
};

/**
 * Finds an object in a collection (tags, triggers or variables) by name.
 *
 * @private
 *
 * @param {object} object GtmTag, GtmTrigger or GtmVariable.
 *
 * @this {array} Has only one item: Name to match.
 *
 * @return {object} True if the object's name matches.
 */
GtmLib.prototype._findObjectByName = function(object) {
  return object.matchesName(this[0]);
};

GtmLib.prototype.findTagById = function(tagId) {
  'use strict';
  return this.tags.find(this._findObjectById, [tagId]);
};

GtmLib.prototype.findTagByName = function(tagName) {
  'use strict';
  return this.tags.find(this._findObjectByName, [tagName]);
};

GtmLib.prototype.findTriggerById = function(triggerId) {
  'use strict';
  return this.triggers.find(this._findObjectById, [triggerId]);
};

GtmLib.prototype.findTriggerByName = function(triggerName) {
  'use strict';
  return this.triggers.find(this._findObjectByName, [triggerName]);
};

GtmLib.prototype.findVariableById = function(variableId) {
  'use strict';
  return this.variables.find(this._findObjectById, [variableId]);
};

GtmLib.prototype.findVariableByName = function(variableName) {
  'use strict';
  return this.variables.find(this._findObjectByName, [variableName]);
};

/**
 * end Finders
 */


/**
 * Maps all of the variables from a given object (tag or trigger).
 *
 * @private
 *
 * @param {object|array} obj The tag or trigger to map variables.
 *
 * @this {object} GtmLib.
 *
 * @return {array} sorted list of variable IDs found in obj.
 */
GtmLib.prototype._mapVariablesInObject = function(obj) {
  'use strict';

  function _findReservedVariable(variableName) {
    return ['_event'].includes(variableName);
  }

  var mappedVariables = [];

  if (Array.isArray(obj)) {
    obj.forEach(function (object) {
      mappedVariables =
          mappedVariables.concat(this._mapVariablesInObject(object));
    }, this);
  } else if (Object.isObject(obj)) {
    var key, value;
    var variableRegexMatch, variableRegex = /\{\{(\w|\s|\.)+\}\}/g;
    var foundVariableNames, foundVariables;
    var reservedVariableIndex;

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        value = obj[key];

        if (String.isString(value)) {
          variableRegexMatch = value.match(variableRegex);

          if (variableRegexMatch) {
            foundVariableNames =
                variableRegexMatch.map(function(matchedName) {
                  // remove the '{{' and '}}' from the variable name
                  var variableName = matchedName.match(/\{\{(.+)\}\}/)[1];
                  return variableName;
                });

            // remove reserved variables
            reservedVariableIndex =
                  foundVariableNames.findIndex(_findReservedVariable);
            while (reservedVariableIndex > -1) {
              foundVariableNames.splice(reservedVariableIndex, 1);
              reservedVariableIndex =
                  foundVariableNames.findIndex(_findReservedVariable);
            }

            // re-map from variable names to variables
            foundVariables = foundVariableNames.map(function(variableName) {
              return this.findVariableByName(variableName);
            }, this);

            mappedVariables = mappedVariables.concat(foundVariables);
          }
        } else if (Object.isObject(value) || Array.isArray(value)) {
          mappedVariables =
              mappedVariables.concat(this._mapVariablesInObject(value));
        }
      }
    }
  }

  mappedVariables = mappedVariables.unique();

  return mappedVariables;
};

/**
 * Maps all of the variables used in tags or triggers.
 *
 * @private
 *
 * @param {string} tagsOrTriggers 'tags' or 'triggers'.
 *
 * @this {object} GtmLib.
 *
 * @see _mapVariablesInObject
 */
GtmLib.prototype._mapVariablesInTagsOrTriggers = function(tagsOrTriggers) {
  'use strict';

  var collection = this[tagsOrTriggers];

  collection.forEach(function(object) {
    object.variables = this._mapVariablesInObject(object);
  }, this);
};

/**
 * @see _mapVariablesInTagsOrTriggers
 */
GtmLib.prototype.mapVariablesInTags = function() {
  'use strict';
  this._mapVariablesInTagsOrTriggers('tags');
};

/**
 * @see _mapVariablesInTagsOrTriggers
 */
GtmLib.prototype.mapVariablesInTriggers = function() {
  'use strict';
  this._mapVariablesInTagsOrTriggers('triggers');
};

/**
 * Maps all of the triggers used in tags.
 */
GtmLib.prototype.mapTriggersInTags = function() {
  'use strict';

  /**
   * Maps all of the triggers from a given tag.
   *
   * @private
   *
   * @param {object} tag The tag to map triggers.
   *
   * @return {array} sorted list of triggers found in tag.
   */
  function _mapTagTriggers(tag) {
    var triggers = [];

    if (tag.hasOwnProperty('firingTriggerId')) {
      triggers = triggers.concat(tag.firingTriggerId);
    }
    if (tag.hasOwnProperty('blockingTriggerId')) {
      triggers = triggers.concat(tag.blockingTriggerId);
    }

    triggers = triggers.unique();

    return triggers;
  }

  var tags = this.tags;

  tags.forEach(function(tag) {
    var mappedTriggers = _mapTagTriggers(tag);

    tag.triggers = mappedTriggers.map(function(triggerId) {
      return this.findTriggerById(triggerId);
    }, this);
  }, this);
};

/**
 * Maps all of the items (triggers or variables)
 * from the given collection (tags or triggers).
 *
 * @private
 *
 * @param {string} items 'triggers' or 'variables'.
 * @param {string} collection 'tags' or 'triggers'.
 */
GtmLib.prototype._mapItemsFromCollection = function(items, collection) {
  'use strict';
  var tagsOrTriggers = this[collection];

  for (var i = 0, j = tagsOrTriggers.length; i < j; i++) {
    var object = tagsOrTriggers[i];

    for (var k = 0, l = object[items].length; k < l; k++) {
      var item = object[items][k];
      if (item) item[collection].push(object);
    }
  }
};

GtmLib.prototype.mapVariablesFromTags = function() {
  'use strict';
  this._mapItemsFromCollection('variables', 'tags');
};

GtmLib.prototype.mapVariablesFromTriggers = function() {
  'use strict';
  this._mapItemsFromCollection('variables', 'triggers');
};

GtmLib.prototype.mapTriggersFromTags = function() {
  'use strict';
  this._mapItemsFromCollection('triggers', 'tags');
};

/**
 * Compiles all of the tags, triggers and variables
 * using GtmTag, GtmTrigger and GtmVariable respectively.
 *
 * @see GtmTag
 * @see GtmTrigger
 * @see GtmVariable
 */
GtmLib.prototype.compileTagsTriggersAndVariables = function() {
  var container = this.containerJson.containerVersion;

  this.tags = container.tag.map(function(tag) {
    return new GtmTag(tag);
  });

  this.triggers = container.trigger.map(function(trigger) {
    return new GtmTrigger(trigger);
  });

  this.variables = container.variable.map(function(variable) {
    return new GtmVariable(variable);
  });
};

/**
 * Adds built-in variables as regular variables using GtmVariable.
 *
 * @see GtmVariable
 */
GtmLib.prototype.addBuiltInVariables = function() {
  'use strict';

  /**
   * Convert the built-in variable UPPERCASE name to the form
   * that they're actually used in tags and triggers.
   *
   * @private
   *
   * @param {string} name The built-in variable name.
   *
   * @return {string} The name in the form that is used in tags and triggers.
   */
  function _convertName(name) {
    // set convertedName to name as the default
    var convertedName = name;

    switch(name) {

    case 'PAGE_URL':
      convertedName = 'Page URL';
      break;
    case 'PAGE_HOSTNAME':
      convertedName = 'Page Hostname';
      break;
    case 'PAGE_PATH':
      convertedName = 'Page Path';
      break;
    case 'REFERRER':
      convertedName = 'Referrer';
      break;
    case 'EVENT':
      convertedName = 'Event';
      break;
    case 'CLICK_ELEMENT':
      convertedName = 'Click Element';
      break;
    case 'CLICK_CLASSES':
      convertedName = 'Click Classes';
      break;
    case 'CLICK_ID':
      convertedName = 'Click ID';
      break;
    case 'CLICK_TARGET':
      convertedName = 'Click Target';
      break;
    case 'CLICK_URL':
      convertedName = 'Click URL';
      break;
    case 'CLICK_TEXT':
      convertedName = 'Click Text';
      break;
    case 'FORM_ELEMENT':
      convertedName = 'Form Element';
      break;
    case 'FORM_CLASSES':
      convertedName = 'Form Classes';
      break;
    case 'FORM_ID':
      convertedName = 'Form ID';
      break;
    case 'FORM_TARGET':
      convertedName = 'Form Target';
      break;
    case 'FORM_URL':
      convertedName = 'Form URL';
      break;
    case 'FORM_TEXT':
      convertedName = 'Form Text';
      break;
    case 'ERROR_MESSAGE':
      convertedName = 'Error Message';
      break;
    case 'ERROR_URL':
      convertedName = 'Error URL';
      break;
    case 'ERROR_LINE':
      convertedName = 'Error Line';
      break;
    case 'NEW_HISTORY_FRAGMENT':
      convertedName = 'New History Fragment';
      break;
    case 'OLD_HISTORY_FRAGMENT':
      convertedName = 'Old History Fragment';
      break;
    case 'NEW_HISTORY_STATE':
      convertedName = 'New History State';
      break;
    case 'OLD_HISTORY_STATE':
      convertedName = 'Old History State';
      break;
    case 'HISTORY_SOURCE':
      convertedName = 'History Source';
      break;
    case 'CONTAINER_VERSION':
      convertedName = 'Container Version';
      break;
    case 'DEBUG_MODE':
      convertedName = 'Debug Mode';
      break;
    case 'RANDOM_NUMBER':
      convertedName = 'Random Number';
      break;
    case 'CONTAINER_ID':
      convertedName = 'Container ID';
      break;
    }

    return convertedName;
  }
  // end _convertName()

  /**
   * Checks if a new variable already exists.
   *
   * @private
   *
   * @param {object} variable A variable.
   *
   * @this newVariable
   */
  function _newVariableExists(variable) {
    return variable.name === this.name;
  }

  /**
   * Creates a new variable from each built-in variable.
   *
   * @private
   *
   * @param {object} builtInVariable A built-in variable.
   * @param {number} i Index of the built-in variable.
   *
   * @this GtmLib
   */
  function _createNewVariable(builtInVariable, i) {
    var newVariable = new GtmVariable({
      'objectId': (0 - i - 1) + '',
      'name': _convertName(builtInVariable)
    });
    if (!this.variables.some(_newVariableExists, newVariable)) {
      this.variables.push(newVariable);
    }
  }
  // end _createNewVariable()

  var container = this.containerJson.containerVersion.container;
  if (container.hasOwnProperty('enabledBuiltInVariable')) {
    var builtInVariables = container.enabledBuiltInVariable;
    builtInVariables.forEach(_createNewVariable, this);
  }
};

GtmLib.prototype.addBuiltInTriggers = function() {
  var builtInTriggers = [
    {
      'objectId': '2147479553',
      'name': 'All Pages'
    }
  ];

  builtInTriggers.forEach(function(trigger) {
    this.triggers.push(new GtmTrigger(trigger));
  }, this);
};

GtmLib.prototype.mapTagsTriggersAndVariables = function() {
  'use strict';
  this.mapVariablesInTags();
  this.mapVariablesInTriggers();
  this.mapTriggersInTags();

  this.mapVariablesFromTags();
  this.mapVariablesFromTriggers();
  this.mapTriggersFromTags();
};