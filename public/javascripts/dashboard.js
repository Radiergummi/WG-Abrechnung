webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var app  = __webpack_require__(1),
	    main = __webpack_require__(66)(app);
	
	(function(app) {
	  app.startup.push(function() {
	
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
	        tag:     tag.id,
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
	        tag.classList.remove.apply(tag.classList, [ 'editable', 'add-new' ]);
	        tag.setAttribute('contenteditable', 'false');
	
	        console.log('Tag %s successfully saved.', tag.textContent);
	      });
	    };
	
	    app.connectors.changeTagColor = function(tag, newColor) {
	      app.io.emit('dashboard.updateTagColor', {
	        tagId:    tag.id,
	        newColor: newColor
	      }, function(error, tag) {
	        if (error) {
	          return console.log(error);
	        }
	
	        var searchTag = tag.textContent.trim(),
	            currentTags = [];
	        for (var i = 0; i < blackTags.length; i++) {
	          if (blackTags[i].textContent == 'Baumarkt') {
	            BaumarktTags.push(blackTags[i]);
	          }
	        }
	
	        document.getElementById('577aaea4820862942e3b4768').classList.add('tag-' + tag.color);
	        document.getElementById('577aaea4820862942e3b4768').classList.remove('tag-pink');
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
	
	    for (var i = 0; i < app.elements.tagInputElements.length; i++) {
	      app.listeners.addTagInputEvents(app.elements.tagInputElements[ i ]);
	    }
	
	    for (var j = 0; j < app.elements.tags; j++) {
	      app.listeners.addTagRemovalEvents(app.elements.tags[ i ]);
	    }
	  });
	})(app);


/***/ }
]);
//# sourceMappingURL=dashboard.map