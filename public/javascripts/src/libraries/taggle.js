'use strict';

const Taggle = require('taggle');

/**
 * creates a new tag input using taggle
 *
 * @param   {object}                               app      the app object
 * @param   {string|DOMElement|HTMLElement|object} element  the element to make a tag input
 * @param   {object}                               [config] an optional config object to proxy to Taggle
 *
 * @returns {Taggle}                                        the Taggle instance
 */
module.exports = function(app, element, config) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }

  if (element.isDOMElement) {
    element = element[ 0 ];
  }

  config = config || {};

  /**
   * uploads the new tag to the server
   *
   * @param {HTMLElement}  tagElement
   */
  function getColor (tagElement) {
    let tagNode = app.dom(tagElement),
        tagName = app.dom('.taggle_text', tagElement).text();

    app.io.emit('tags.getColor', {
      tagName: tagName
    }, (error, tagColor) => {
      if (error) {
        return app.error(error);
      }

      app.debug(`got color ${tagColor} for tag ${tagName}. Applying to element: `, tagNode);
      tagNode.addClass('tag-' + tagColor);
    });
  }

  let taggle = new Taggle(element, Object.assign({
    attachTagId:          true,
    preserveCase:         true,
    additionalTagClasses: 'tag',
    duplicateTagClass:    'duplicate',
    hiddenInputName:      'tags',
    placeholder:          'Tags eingeben...',
//  onTagAdd:             getColor,
    tagFormatter:         getColor
  }, config));

  if (element.dataset.tags) {
    let tags = element.dataset.tags.split(',');

    tags.forEach(tag => taggle.add(tag));
    element.removeAttribute('data-tags');
  }

  return taggle;
};
