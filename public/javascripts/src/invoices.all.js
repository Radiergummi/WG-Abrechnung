'use strict';

const Template = require('./modules/template');

const app  = require('./app'),
      main = require('./main')(app);

(function(app) {
  app.startup.push(function() {
    app.modals = require('./libraries/modals')(app, {});

    app.elements.invoicesContainer    = app.dom('.invoices');
    app.elements.invoices             = app.dom('.invoices .invoice');
    app.elements.lastInvoice          = app.elements.invoices.last();
    app.elements.deleteInvoiceButtons = app.dom('.delete-invoice');

    app.listeners.addInvoicesEvents = function() {
      app.on('DOMContentLoaded', app.events.lastInvoiceVisible, { debounce: true });
      app.on('load', app.events.lastInvoiceVisible, { debounce: true });
      app.on('scroll', app.events.lastInvoiceVisible, { debounce: true });
      app.on('resize', app.events.lastInvoiceVisible, { debounce: true });

//      app.elements.lastInvoice.addEventListener();
    };

    /**
     * attaches the delete user event listeners
     */
    app.listeners.addDeleteInvoiceEvents = function() {
      app.elements.deleteInvoiceButtons.on('click', app.events.deleteInvoice);
    };

    app.listeners.removeInvoiceEvents = function() {
      app.off('DOMContentLoaded', document);
      app.off('load', document);
      app.off('scroll', document);
      app.off('resize', document);
    };

    app.events.lastInvoiceVisible = function(event) {
      return app.helpers.onVisibilityChange(
        app.dom('.invoice', app.elements.invoicesContainer).last(),
        visibility => app.connectors.getMoreInvoices()
      )();
    };

    /**
     * prepares the delete invoice modal
     *
     * @param {Event} event
     */
    app.events.prepareDeleteInvoiceModal = function(event) {
      app.debug('attaching prepare delete invoice modal data');
      let modal = app.dom('.dialog-delete-invoice-wrapper')[ 0 ];

      // pass the id of the user to delete on to the real delete button
      app.dom('.delete-invoice', modal).data('invoiceId', event.target.dataset.invoiceId);
    };

    /**
     * deletes an invoice via sockets
     *
     * @param {Event} event
     */
    app.events.deleteInvoice = function(event) {
      event.preventDefault();

      let options  = {},
          content;
      options.type = 'warning';

      // render the delete invoice modal content
      app.templates.deleteInvoiceModal
        .then(html => content = html)

        // translate both button texts
        .then(() => app.translate('[[global:delete]]^[[global:cancel]]'))

        // split the text, set the options accordingly
        .then((translated) => {
          let message               = translated.split('^');
          options.buttonConfirmText = message[ 0 ];
          options.buttonCancelText  = message[ 1 ];

          return options;
        })

        // create a confirm dialog, prompting to delete the invoice
        .then(options => app.modals.confirm(content, options).then(data => {
            console.log('modal action!', data);
          })
        );
      /*
       app.connectors.deleteInvoice(event.target.dataset.invoiceId, function(error, deletedInvoice) {
       if (error) {

       // if we have an error, show a notification
       app.notifications.error('[[settings:user_management.delete.notification_error, ' + error.message + ']]');

       // log the full error to the console
       console.error(error);

       // close the modal
       return setTimeout(app.modals.instance.close, 500);
       }

       // everything went smoothly, show a notification
       app.translate(
       '[[settings:user_management.delete.notification_success, ' + deletedInvoice.firstName + ' ' + deletedInvoice.lastName + ']]',
       function(translated) {
       app.notifications.success(translated);
       });

       return setTimeout(function() {
       app.modals.instance.close();

       // delete the user row
       app.dom('#' + deletedInvoice._id).remove();
       }, 500);
       });
       */
    };

    app.helpers.onVisibilityChange = function(element, callback) {
      callback = callback || app.noop;

      return () => element.isInViewport() ? callback() : null;
    };

    /**
     * deletes an invoice via sockets
     *
     * @param {string} invoiceId
     * @param {function(Error, object)} callback
     * @returns {*}
     */
    app.connectors.deleteInvoice = function(invoiceId, callback) {
      if (!invoiceId) {
        return callback(new Error('invalid invoice ID ' + invoiceId), null);
      }

      app.io.emit('settings.deleteInvoice', invoiceId, function(error, deletedInvoice) {
        if (error) {
          return callback(error, null);
        }

        return callback(null, deletedInvoice);
      });
    };

    app.connectors.getMoreInvoices = function() {
      let page = Math.ceil((app.dom('.invoices .invoice').length) / 2);

      // remove tail element
      app.dom('.timeline-data-available').remove();

      // insert loading indicator
      app.templates.invoiceTimelineLoading()
        .then(element => app.elements.invoicesContainer.append(element));

      app.io.emit('invoices.getPaginated', {
        userId:     app.config.user.id,
        pageNumber: page,
        pageSize:   2
      }, function(error, invoices) {
        if (error) {
          return console.error(error);
        }

        // remove the loading indicator
        app.dom('.timeline-loading').remove();

        if (invoices.length > 0) {
          const invoicePromises = invoices.reduce((current, invoice) => {
            if (!current) {
              return;
            }

            return current.then(
              () => app.templates.invoiceTimelineSeparator()
                .then(element => app.elements.invoicesContainer.append(element))
                .then(() => app.templates.invoiceCard(invoice))
                .then(element => app.elements.invoicesContainer.append(element))
            )
          }, Promise.resolve())
            .then(() => history.pushState(null, 'Rechnungen | Seite' + page, '/invoices/page/' + page))
            .then(() => app.templates.invoiceTimelineAvailabilityIndicator())
            .then(element => app.elements.invoicesContainer.append(element));
        } else {
          app.listeners.removeInvoiceEvents();
          app.templates.invoiceTimelineEnd()
            .then(element => {
              app.dom('.timeline-item.timeline-last').remove();
              app.elements.invoicesContainer.append(element)
            });
        }
      });
    };

    app.templates.invoiceCard = function(invoice) {
      let template = new Template(`<article class="invoice{{#if ownInvoice}} own-invoice{{/if}}" id="{{_id}}">
  <section class="invoice-image" style="background-image: url(/images/invoices/{{user._id}}/{{_id}}.jpg)">
  </section>
  <section class="invoice-data">
    <div class="invoice-id">{{_id}}</div>
    <div class="invoice-owner">
      <div class="profile-picture">
        <img src="/images/users/{{user._id}}.jpg" alt>
      </div>
      <span class="owner-name">{{user.firstName}} {{user.lastName}}</span>
    </div>
    [[invoices:date]]: <span class="invoice-creation-date">{{formattedCreationDate}}</span><br>
    [[invoices:sum]]: {{#if sum}}<span
    class="invoice-sum">{{sum}}</span>€{{else}}[[invoices:no_sum]]{{/if}}<br>
    <div class="tags-label">[[invoices:tags]]:</div>
    <div class="invoice-tags">
      {{#if tags}}
        <ul>
        {{#each tags}}
          <li class="tag tag-{{color}}" id="{{_id}}">
            <span>{{name}}</span>
          </li>
        {{/each}}
        </ul>
      {{else}}
        <span class="no-tags">[[invoices:no_tags]]</span>
      {{/if}}
    </div>
  </section>
  <section class="invoice-actions">
    <a class="button" href="/invoices/{{_id}}"><span class="fa fa-eye"></span>
      [[global:details]]</a>
    {{#if ownInvoice}}
      <a class="button" href="/invoices/{{_id}}/edit"><span class="fa fa-edit"></span>
        [[global:edit]]</a><a class="button delete-invoice danger" href="/invoices/{{_id}}/delete"><span
      class="fa fa-trash-o"></span>
      [[global:delete]]</a>
    {{/if}}
  </section>
</article>`);

      return template.render(invoice).then(rendered => app.helpers.createElement(rendered));
    };

    app.templates.deleteInvoiceModal = app.translate(`<header class="modal-header">
      <h2>[[settings:user_management.delete_user]]</h2>
    </header>
    <section class="modal-body">
      <span class="dialog-message">[[settings:user_management.warning_delete_user]]</span>
    </section>`);

    app.templates.invoiceTimelineSeparator = () =>
      app.helpers.createElement('<div class="timeline-item timeline-separator timeline-within-range"></div>');

    app.templates.invoiceTimelineLoading = () =>
      app.helpers.createElement('<div class="timeline-item timeline-loading"></div>');

    app.templates.invoiceTimelineEnd = () =>
      app.helpers.createTranslatedElement('<div class="timeline-item timeline-last" data-timeline-description="[[invoices:no_older]]"></div>');

    app.templates.invoiceTimelineAvailabilityIndicator = () =>
      app.helpers.createElement('<div class="timeline-item timeline-data-available"></div>');

    app.listeners.addInvoicesEvents();
    app.listeners.addDeleteInvoiceEvents();
  });
})(app);
