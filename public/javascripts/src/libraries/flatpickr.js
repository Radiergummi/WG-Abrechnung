'use strict';

const Flatpickr       = require('flatpickr'),
      language        = document.documentElement.lang.substring(0, 2),
      locale          = require('flatpickr/dist/l10n/de.js').de,
      now             = new Date(),
      firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

const events = {
  closed: function(selectedDates, dateStr, instance) {

  }
};

/**
 * TODO: Make dynamic localizing work
 */
//locale    = require(`flatpickr/dist/l10n/${language}.js`)[ language ];

module.exports = function(app, element, config) {
  element.flatpickr = new Flatpickr(element, Object.assign({
    minDate:   firstDayOfMonth,
    maxDate:   now,
    locale:    locale,
    altInput:  true,
    altFormat: "j. F Y",

    /**
     * if the date picker has an associated label
     *
     * @param selectedDates
     * @param dateStr
     * @param instance
     */
    onOpen:  function(selectedDates, dateStr, instance) {
      const label = app.dom(`label[for="${instance.element.id}"]`);

      if (label) {
        label.addClass('in-focus');
      }
    },
    onClose: function(selectedDates, dateStr, instance) {
      const label = app.dom(`label[for="${instance.element.id}"]`);

      if (label) {
        label.addClass('in-focus');
      }
    }
  }, config));
};
