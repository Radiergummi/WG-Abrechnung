'use strict';

var app = {
  elements:   {},
  listeners:  {},
  events:     {},
  helpers:    {},
  connectors: {},
  templates:  {}
};

app.init = function() {

  // load socket io
  app.io = io();

  for (var i = 0; i < app.elements.tagInputElements.length; i++) {
    app.listeners.addTagInputEvents(app.elements.tagInputElements[ i ]);
  }

  for (var j = 0; j < app.elements.tags; j++) {
    app.listeners.addTagRemovalEvents(app.elements.tags[ i ]);
  }
};

app.helpers.createNode = function(tagName, attributes, content) {
  var node = document.createElement(tagName);

  attributes = attributes || {};

  for (var attr in attributes) {
    node.setAttribute(attr, attributes[ attr ]);
  }

  if (content !== undefined) {
    if (content.tagName) {
      node.appendChild(content);
    } else {
      node.textContent = content;
    }
  }

  return node;
};

app.listeners.addTagInputEvents = function(tagInputElement) {
  tagInputElement.addEventListener('focus', app.events.editNewTag);
  tagInputElement.addEventListener('blur', app.events.leaveTag);
  tagInputElement.addEventListener('keydown', app.events.finishTag);
};

app.listeners.addTagRemovalEvents = function(tag) {
  tag.querySelector('.removeTag').addEventListener('click', app.events.removeTag);
};

// create an array of existing tags
app.elements.tags = Array.prototype.slice.call(document.querySelectorAll('.tag[id]'));

// create an array of tag input elements
app.elements.tagInputElements = Array.prototype.slice.call(document.querySelectorAll('.tag.add-new'));

app.events.removeTag = function(event) {
  var tag = event.target.parentNode;

  app.io.emit('dashboard.removeTag', {
    tag: tag.id,
    invoice: tag.parentNode.parentNode.id
  });
};

app.events.editNewTag = function(event) {

  // remove plus icon
  var plusIcon = event.target.getElementsByTagName('span');
  if (plusIcon.length > 0) {
    event.target.removeChild(plusIcon[ 0 ]);
  }
};

app.events.finishTag = function(event) {
  switch (event.keyCode) {
    case 13: // Enter
    case 9:  // Tab
    case 32: // Space
      event.preventDefault();

      // if the next element is also a tag input
      if (
        (!event.target.nextSibling.nodeName === '#text') &&
        (event.target.nextSibling.classList.contains('tag'))
      ) {
        event.target.nextSibling.focus();
      }

      // save the tag
      app.connectors.saveTag(event.target);

      // add a new tag input
      app.events.addNewTag({
        target: event.target
      });

      return false;
  }
};

app.events.addNewTag = function(event) {
  /*var newTagInput = app.helpers.createNode('div', {
      contentEditable: 'true',
      class:           'tag editable add-new'
    }, app.helpers.createNode('span', {
      class: 'fa fa-plus'
    })
  );*/
  var newTagInput = app.templates.tagInput;

  // add event listeners
  app.listeners.addTagInputEvents(newTagInput);

  event.target.blur();

  // insert new node after current input
  event.target.parentNode.insertBefore(newTagInput, event.target.nextSibling);

  // focus the next input
  newTagInput.focus();

  // push the tag input into the stack
  app.elements.tagInputElements.push(newTagInput);
};

app.events.leaveTag = function(event) {
  event.target.blur();

  // if the tag was left without text being added, insert plus icon again
  if (!event.target.textContent) {
    event.target.appendChild(app.helpers.createNode('span', {
      class: 'fa fa-plus'
    }))
  } else {
    /**
     * TODO: When leaving an input using a mouse click, no new input is created but needs to be
     */
    /*    if (event.target.nextSibling.nodeName !== 'DIV') {
     var newTagInput = app.helpers.createNode('div', {
     contentEditable: 'true',
     class:           'tag editable add-new'
     }, app.helpers.createNode('span', {
     class: 'fa fa-plus'
     })
     );

     // add event listeners
     app.listeners.addTagInputEvents(newTagInput);

     // insert new node after current input
     event.target.parentNode.insertBefore(newTagInput, event.target.nextSibling);

     // push the tag input into the stack
     app.elements.tagInputElements.push(newTagInput);

     }
     */
  }

};

app.connectors.saveTag = function(tag) {
  app.io.emit('dashboard.saveTag', {
    tagName: tag.textContent,
    invoice: event.target.parentNode.parentNode.getAttribute('id')
  }, function(error, savedTag) {
    if (error) {
      console.error(error);
      return tag.remove();
    }

    // add tag color
    tag.classList.add('tag-' + savedTag.color);
    tag.classList.remove.apply(tag.classList, [ 'editable', 'add-new' ]);
    tag.setAttribute('contenteditable', 'false');

    console.log('Tag %s successfully saved.', tag.textContent);
  });
};

app.templates.tagInput = (function() {
  var newTag = app.helpers.createNode('span', {
    contentEditable: 'true',
    class:           'tag editable add-new'
  });

  newTag.appendChild(app.helpers.createNode('span', {
    class: 'fa fa-plus'
  }));

  return newTag;
})();

app.init();
