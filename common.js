/**
 * @fileoverview Common functions for the web app.
 * @author yuhuibc@gmail.com (Yuhui)
 *
 * @preserve Copyright 2015 Yuhui.
 * Licensed under the GNU General Public License v3.0.
 * Refer to LICENSE for the full license text and copyright
 * notice for this file.
 */

function showContainer(containerJson) {
  GtmViz.setContainer(containerJson);

  GtmViz.listTags();
  GtmViz.listTriggers();
  GtmViz.listVariables();

  $('#container_contents').show();
}

function showErrorNotification(message) {
  $('#error_message').text(message);
  $('#error_notification').show();
}

function hideErrorNotification() {
  $('#error_notification').hide();
}

function animateProgress(value) {
  $('#gtm_progress').attr("value", value);
}
