/**
 * @fileoverview Public functions and handlers for interacting with 
 * the Google API.
 * @author yuhuibc@gmail.com (Yuhui)
 *
 * @preserve Copyright 2015 Yuhui.
 * Licensed under the GNU General Public License v3.0.
 * Refer to LICENSE for the full license text and copyright
 * notice for this file.
 */

/**
 * Google API constants
 *
 * @const CLIENT_ID {string}
 * @const API_KEY {string}
 * @const SCOPES {string}
 */
// Replace CLIENT_ID and API_KEY with own Client ID and API Key.
// https://developers.google.com/api-client-library/javascript/start/start-js
var CLIENT_ID =
    '11689134303-af5vd1g1aa1t32f38hj01pu71ovakirv.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBzCHUI9NKpEJ3W7LkhppFfhYK_fhN5ypY';
var SCOPES = 'https://www.googleapis.com/auth/tagmanager.readonly';

/**
 * Builds the selection list for interacting with the GTM API.
 *
 * @private
 *
 * @param {string} type The selection list to build.
 * @param {string} selectId HTML ID of the selection list to build.
 * @param {object} response Response from the GTM API.
 * @param {function} changeFunction Function that the selection list runs.
 */
function _buildSelect(type, selectId, response, changeFunction) {
  animateProgress('80');

  var select = $(selectId);
  select.empty();

  var selectMessage = type;
  if (type === 'containerVersion') selectMessage = 'container version';
  select.append($('<option>', {
    text: 'Select ' + selectMessage + '...'
  }));

  var key = type;
  if (type !== 'containerVersion') key += 's';
  var result = response.result[key];

  if (type === 'containerVersion') {
    result = result.sort(function (resultA, resultB) {
      if (resultA.containerVersionId < resultB.containerVersionId) {
        return 1;
      }
      if (resultA.containerVersionId > resultB.containerVersionId) {
        return -1;
      }
      return 0;
    });

    var option = $('<option>', {
      id: type + '_0',
      text: 'Current draft',
      'data-id': 0
    });
    select.append(option);

    var option = $('<option>', {
      id: type + '_published',
      text: 'Current published',
      'data-id': 'published'
    });
    select.append(option);
  }

  animateProgress('90');

  $.each(result, function () {
    var object = this;
    var objectId = object[type + 'Id'];
    var objectName = object.name;
    var containerPublicId;

    switch (type) {
    case 'container':
      containerPublicId = object.publicId;
      objectName += ' (' + containerPublicId + ')';
      break;
    case 'containerVersion':
      objectName = 'v' + objectId;
      break;
    }

    var option = $('<option>', {
      id: type + '_' + objectId,
      text: objectName,
      'data-id': objectId
    });
    if (type === 'container') {
      option.attr('data-container-id', containerPublicId);
    }

    select.append(option);
  });

  if (changeFunction) {
    select.change(function () {
      changeFunction();
    });
  }
}

function showApiError(reason) {
  showErrorNotification('Error: ' + reason.result.error.message);
}

/**
 * Gets the selected container version.
 */
function getContainerVersion() {
  animateProgress('20');
  $('#gtm_progress').show();

  var containerVersionId = $('#gtm_container_versions :selected').data('id');
  if (containerVersionId === 0) {
    var containerVersion = {};
    gapi.client.tagmanager.accounts.containers.get({
      'accountId': $('#gtm_accounts :selected').data('id'),
      'containerId': $('#gtm_containers :selected').data('id')
    }).then(function (response) {
      animateProgress('40');

      containerVersion.container = response.result;

      gapi.client.tagmanager.accounts.containers.tags.list({
        'accountId': $('#gtm_accounts :selected').data('id'),
        'containerId': $('#gtm_containers :selected').data('id')
      }).then(function (response) {
        animateProgress('60');

        containerVersion.tag = response.result.tags;

        gapi.client.tagmanager.accounts.containers.triggers.list({
          'accountId': $('#gtm_accounts :selected').data('id'),
          'containerId': $('#gtm_containers :selected').data('id')
        }).then(function (response) {
          animateProgress('80');

          containerVersion.trigger = response.result.triggers;

          gapi.client.tagmanager.accounts.containers.variables.list({
            'accountId': $('#gtm_accounts :selected').data('id'),
            'containerId': $('#gtm_containers :selected').data('id')
          }).then(function (response) {
            animateProgress('90');

            containerVersion.variable = response.result.variables;

            showContainer(containerVersion);

            window.dataLayer.push({
              'event': 'select container',
              'submitResult': 'pass'
            });

            animateProgress('100');
            $('#gtm_progress').hide();
          }, showApiError);

        }, function () {
          showApiError();
          window.dataLayer.push({
            'event': 'select container',
            'submitResult': 'fail'
          });
        });

      }, function () {
        showApiError();
        window.dataLayer.push({
          'event': 'select container',
          'submitResult': 'fail'
        });
      });

    }, function () {
      showApiError();
      window.dataLayer.push({
        'event': 'select container',
        'submitResult': 'fail'
      });
    });
  } else {
    gapi.client.tagmanager.accounts.containers.versions.get({
      'accountId': $('#gtm_accounts :selected').data('id'),
      'containerId': $('#gtm_containers :selected').data('id'),
      'containerVersionId': containerVersionId
    }).then(function (response) {
      showContainer(response.result);

      window.dataLayer.push({
        'event': 'select container',
        'submitResult': 'pass'
      });

      animateProgress('100');
      $('#gtm_progress').hide();
    }, function () {
      showApiError();
      window.dataLayer.push({
        'event': 'select container',
        'submitResult': 'fail'
      });
    });
  }
}

/**
 * Gets the list of container versions.
 */
function loadContainerVersions() {
  $('#gtm_container_versions').show();

  animateProgress('20');
  $('#gtm_progress').show();

  gapi.client.tagmanager.accounts.containers.versions.list({
    'accountId': $('#gtm_accounts :selected').data('id'),
    'containerId': $('#gtm_containers :selected').data('id')
  }).then(function (response) {
    _buildSelect(
      'containerVersion', '#gtm_container_versions', response,
      getContainerVersion
    );

    animateProgress('100');
    $('#gtm_progress').hide();
  }, showApiError);
}

/**
 * Gets the list of containers.
 */
function loadContainers() {
  $('#gtm_containers').show();
  $('#gtm_container_versions').hide();

  animateProgress('20');
  $('#gtm_progress').show();

  gapi.client.tagmanager.accounts.containers.list({
    'accountId': $('#gtm_accounts :selected').data('id')
  }).then(function (response) {
    _buildSelect(
      'container', '#gtm_containers', response, loadContainerVersions
    );

    animateProgress('100');
    $('#gtm_progress').hide();
  }, showApiError);
}

/**
 * Gets the list of accounts.
 */
function loadAccounts() {
  $('#gtm_accounts').show();
  $('#gtm_containers').hide();
  $('#gtm_container_versions').hide();

  animateProgress('20');
  $('#gtm_progress').show();

  gapi.client.tagmanager.accounts.list().then(function (response) {
    _buildSelect(
      'account', '#gtm_accounts', response, loadContainers
    );

    animateProgress('100');
    $('#gtm_progress').hide();
  }, showApiError);
}

function initApi() {
  gapi.client.load('tagmanager', 'v1').then(loadAccounts);
}

function showAuthorization() {
  $('#gtm_authorize').show();
  $('#gtm_accounts_containers').hide();
}

function hideAuthorization() {
  $('#gtm_authorize').hide();
  $('#gtm_accounts_containers').show();
}

/**
 * Google API framework
 */

// Use a button to handle authentication the first time.
function handleClientLoad() {
  gapi.client.setApiKey(API_KEY);
  setTimeout(checkAuth, 1);
}
function checkAuth() {
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: true
  }, handleAuthResult);
}
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    hideAuthorization();
    initApi();
  } else {
    var authorizeButton = document.getElementById('authorize_button');
    authorizeButton.onclick = handleAuthClick;
    showAuthorization();
  }
}
function handleAuthClick(event) {
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: false
  }, handleAuthResult);
  return false;
}
