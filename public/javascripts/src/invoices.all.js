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
      app.off('DOMContentLoaded', app.events.lastInvoiceVisible);
      app.off('load', app.events.lastInvoiceVisible);
      app.off('scroll', app.events.lastInvoiceVisible);
      app.off('resize', app.events.lastInvoiceVisible);
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
      app.templates.invoiceTimelineLoading
        .then(element => app.elements.invoicesContainer.append(element));

      app.io.emit('invoices.getPaginated', {
        userId:     app.config.user.id,
        pageNumber: page,
        pageSize:   2
      }, function(error, invoices) {
        if (error) {
          return console.error(error);
        }

        // wait a second
        setTimeout(function() {

          // remove the loading indicator
          app.dom('.timeline-loading').remove();

          if (invoices.length > 0) {
            const invoicePromises = invoices.map(invoice => {
              app.templates.invoiceTimelineSeparator()
                .then(element => app.elements.invoicesContainer.append(element))
                .then(app.templates.invoiceCard(invoice))
                .then(element => app.elements.invoicesContainer.append(element))
            });

            Promise.all(invoicePromises)
              .then(() => history.pushState(null, 'Rechnungen | Seite' + page, '/invoices/page/' + page))
              .then(() => app.templates.invoiceTimelineAvailabilityIndicator)
              .then(element => app.elements.invoicesContainer.append(element));
          } else {
            app.listeners.removeInvoiceEvents();
            app.templates.invoiceTimelineEnd
              .then((element) => app.elements.invoicesContainer.appendChild(element));
          }
        }, 1000);
      });
    };
    /*
     app.templates.invoiceCardLegacy = function(invoice) {
     let template = '<article class="invoice" id="' + invoice._id + '">' +
     '<section class="invoice-image">' +
     '<img src="/images/invoices/' + invoice.user._id + '/' + invoice._id + '.jpg" alt="Rechnung ' + invoice._id + '" onerror="app.events.imageError(this)">' +
     '</section>' +
     '<section class="invoice-data">' +
     '<div class="invoice-id">' + invoice._id + '</div>' +
     '<div class="invoice-owner">' +
     '<div class="profile-picture">' +
     '<img src="/images/users/' + invoice.user._id + '.jpg" alt>' +
     '</div>' +
     '<span class="owner-name">' + invoice.user.firstName + ' ' + invoice.user.lastName + '</span>' +
     '</div>' +
     '[[invoices:date]]: <span class="invoice-creation-date">' + invoice.creationDate + '</span><br>' +
     '[[invoices:sum]]: <span class="invoice-sum">' + invoice.sum + '</span>€<br>' +
     '<div class="tags-label">[[invoices:tags]]: </div>' +
     '<div class="invoice-tags">';

     if (invoice.tags.length && invoice.tags[ 0 ] !== null) {

     app.debug('invoice has ' + invoice.tags.length + ' tags assigned');
     for (var i = 0; i < invoice.tags.length; i++) {

     app.debug(`processing tag ${invoice.tags[ i ].name}`);
     template += `<div class="tag tag-${invoice.tags[ i ].color || 'blue'}" id="${invoice.tags[ i ]._id}"><span>${invoice.tags[ i ].name}</span></div>`;
     }
     } else {
     template += '<span class="no-tags">[[invoices:no_tags]]</span>';
     }

     template += `</div></section><section class="invoice-actions"><a class="button" href="/invoices/${invoice._id}"><span class="fa fa-eye"></span> [[global:details]]</a>`;

     if (invoice.ownInvoice) {
     template += `<a class="button" href="/invoices/${invoice._id}/edit"><span class="fa fa-edit"></span> [[global:edit]]</a><a class="button danger" href="/invoices/${invoice._id}/delete"><span class="fa fa-trash-o"></span> [[global:delete]]</a>`;
     }

     template += '</section></article>';

     return app.helpers.createTranslatedElement(template);
     };
     */
    app.templates.invoiceCard = function(invoice) {
      let template = new Template(`<article class="invoice" id="{{_id}}">
        <section class="invoice-image">
          <img src="/images/invoices/{{user._id}}/{{_id}}.jpg" alt="Rechnung {{_id}}">
        </section>
        <section class="invoice-data">
          <div class="invoice-id">{{_id}}</div>
          <div class="invoice-owner">
            <div class="profile-picture">
              <img src="/images/users/{{user._id}}.jpg" alt>
            </div>
            <span class="owner-name">{{user.firstName}} {{user.lastName}}</span>
          </div>
          [[invoices:date]]: <span class="invoice-creation-date">{{creationDate}}</span><br>
          [[invoices:sum]]: <span class="invoice-sum">{{sum}}</span>€<br>
          <div class="tags-label">[[invoices:tags]]: </div>
          <div class="invoice-tags">
          {{#if tags}}
            {{#each tags}}
              <div class="tag tag-{{this.color}}" id="{{this._id}}"><span>{{this.name}}</span></div>
            {{/each}}
          {{else}}
            <span class="no-tags">[[invoices:no_tags]]</span>
          {{/if}}
          </div>
        </section>
        <section class="invoice-actions">
          <a class="button" href="/invoices/{{invoice._id}}"><span class="fa fa-eye"></span> [[global:details]]</a>
          {{#if ownInvoice}}
            <a class="button" href="/invoices/{{_id}}/edit"><span class="fa fa-edit"></span> [[global:edit]]</a><a class="button danger" href="/invoices/{{_id}}/delete"><span class="fa fa-trash-o"></span> [[global:delete]]</a>
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

    console.log('live reload working, 2');


    app.listeners.addInvoicesEvents();
    app.listeners.addDeleteInvoiceEvents();
  });
})(app);
