'use strict';

/*
 global module,
 require
 */
const handlebars = require('handlebars'),
      translator = require('./translator');

/**
 * simple handlebars class abstraction
 *
 * @property {*} source
 */
class Template {

  /**
   * creates a new handlebars template
   *
   * @param {string} text the handlebars template source
   */
  constructor (text) {
    this.source = handlebars.compile(text);
  }

  /**
   * renders a template with data
   *
   * @param   {object}           data the template variables
   * @returns {Promise.<string>}      the promised output
   */
  render (data) {
    return Promise.resolve(this.source(data))
      .then(output => translator.translate(output));
  }

  /**
   * compiles and renders a template in one step
   *
   * @static
   * @param   {string}           text the template source
   * @param   {object}           data the template variables
   * @returns {Promise.<string>}      the promised output
   */
  static render (text, data) {
    return (new Template(text)).render(data);
  }
}

module.exports = Template;
