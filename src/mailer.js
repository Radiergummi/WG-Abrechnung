'use strict';

/*
 global module,
 require
 */

var colors            = require('colors'),
    deepExtend        = require('deep-extend'),
    htmlToText        = require('html-to-text'),
    nconf             = require('nconf'),
    nodeMailer        = require('nodemailer'),
    sendmailTransport = require('nodemailer-sendmail-transport'),
    smtpTransport     = require('nodemailer-smtp-transport'),
    winston           = require('winston'),

    User              = require('./user'),
    Translator        = require('../public/javascripts/modules/translator'),

    /**
     * predefined mail transport connectors
     *
     * @type {{local, relay, gmail}}
     */
    transports        = {

      /**
       * local mail transport: will send mails straight from this server
       */
      local: nodeMailer.createTransport(sendmailTransport()),

      /**
       * relay mail transport: will relay mails to a remote SMTP server
       */
      relay: (nconf.get('mail:transport') === 'relay'
          ? nodeMailer.createTransport(nconf.get('mail:relay'))
          : undefined
             ),

      /**
       * gmail relay mail transport: will relay mails to gmail
       */
      gmail: nodeMailer.createTransport(smtpTransport({
        host:   'smtp.gmail.com',
        port:   465,
        secure: true,
        auth:   {
          user: nconf.get('mail:gmail:user'),
          pass: nconf.get('mail:gmail:pass')
        }
      }))
    },

    /**
     * the selected transport
     *
     * @type {object|undefined}
     */
    transport,

    /**
     * the express app
     *
     * @type {object|undefined}
     */
    app;

(function (mailer) {

  /**
   * initializes the mailer
   *
   * @param expressApp
   * @returns {*}
   */
  mailer.initialize = function (expressApp) {

    if ((! nconf.get('mail:transport'))) {
      transport = transports.local;
    } else {

      // loads the transport connector specified in the config file
      transport = transports[ nconf.get('mail:transport') ];
    }
    // references the app
    app = expressApp;

    return mailer;
  };

  /**
   * renders a template and sends it as an email
   *
   * @param {string}   template    the template to render
   * @param {object}   data        the template variables to use
   * @param {string}   userId      the ID of the user to send an email to
   * @param {function} [callback]  an optional callback to run after the email has been sent
   */
  mailer.send = function (template, data, userId, callback) {
    new Promise(function (resolve, reject) {

      // find the user to send an email to
      User.getById(userId, function (error, user) {
        if (error) {
          return reject(error);
        }

        // add user data to template variables
        return resolve(JSON.parse(JSON.stringify(user)));
      });
    })
      .then(function (userData) {

        // if the selected user has no email address available, abort here
        if (! userData.email) {
          return new Error('User %s %s (%s) has no email address. Cannot send mail.' + userData.firstName, userData.lastName, userData._id);
        }

        data.user = userData;

        // add a placeholder subject if none present
        if (! data.subject) {
          data.subject = '[ missing subject - new email from flatm8 ]';
        }

        return new Promise(function (resolve, reject) {

          // render the email using the app's render method
          app.render(template, data, function (error, html) {
            if (error) {
              return reject(error);
            }

            winston.info('[mailer]'.white + ' Rendered template %s, now sending as an email', template);
            return resolve(html);
          })
        })
      })
      .then(function (html) {
        var language = data.user.language || nconf.get('language') || 'en_US';

        return new Promise(function (resolve) {

          // translate the email
          Translator.translate(html, 'de_DE', function (translated) {
            resolve(translated);
          });
        });
      })
      .then(function (html) {

        // create a config object for the mailer
        var mailerConfig = {
          _raw:     data,
          to:       data.user.email,
          from:     nconf.get('name') + ' <' + nconf.get('mail:sender') + '>',
          subject:  data.subject,
          html:     html,
          text:     htmlToText.fromString(html, {
            ignoreImage: true
          }),
          template: template,
          userId:   data.user._id
        };

        // send the email
        mailer.transmit(mailerConfig, callback);
      })
      .catch(function (error) {
        winston.error('[mailer]'.red + ' Could not send email: %s', error.message);
        winston.error(error.stack);
      });
  };

  /**
   * transmit the email with nodeMailer
   *
   * @param {object}   data        the mail data
   * @param {function} [callback]  an optional callback to execute
   */
  mailer.transmit = function (data, callback) {

    // transmit the email using nodeMailer
    transport.sendMail(data, function (error, response) {
      if (error) {
        winston.error('[mailer]'.red + ' Could not send email: %s', error.message);
        return callback(error);
      }

      response.transport = transport;


      winston.info('[mailer]'.white + ' Successfully sent an email to %s', data.to);
      return callback(null, response);
    });
  };
})(module.exports);

