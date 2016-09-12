'use strict';

module.exports = function(app) {
  window.addEventListener('flatm8:ready', function(event) {
    app.startup.push(function() {
      app.elements.profilePicture = document.getElementsByClassName('profile-picture')[ 0 ];
      app.elements.backLinks      = document.getElementsByClassName('back-link');
      app.elements.inputElements  = document.getElementsByTagName('input');
      app.elements.selectBoxes    = document.getElementsByClassName('select-box');

      app.listeners.addLinkEvents = function() {
        Array.prototype.slice.call(app.elements.backLinks).map(function(backLink) {
          app.on('click', backLink, app.events.revertLastHistoryState);
        });
      };

      app.listeners.addInputEvents = function() {
        Array.prototype.slice.call(app.elements.inputElements).map(function(inputElement) {
          app.on('focus', inputElement, app.events.toggleInputLabelHighlight);
          app.on('blur', inputElement, app.events.toggleInputLabelHighlight);
        });
      };

      app.listeners.addSelectBoxEvents = function() {
        Array.prototype.slice.call(app.elements.selectBoxes).map(function(selectBox) {
          app.on('click', selectBox, app.events.toggleSelectBox);
        });
      };

      app.listeners.addProfilePictureEvents = function() {
        app.on('click', app.elements.profilePicture, app.events.showProfilePictureUploadModal);
      };

      app.events.revertLastHistoryState = function(event) {
        event.preventDefault();
        history.go(-1);

        return false;
      };

      app.events.toggleInputLabelHighlight = function(event) {
        if (event.target.previousElementSibling && event.target.previousElementSibling.tagName == 'LABEL') {
          event.target.previousElementSibling.classList.toggle('in-focus');
        }
      };

      app.events.toggleSelectBox = function(event) {
        console.log('select clicked');
        if (document.querySelectorAll('.select-box.visible').length > 0) {
          for (var i = 0; i < app.elements.selectBoxes.length; i++) {
            app.elements.selectBoxes[ i ].classList.remove('visible');
          }

          return;
        }

        if (!event.target.classList.contains('select-box')) {
          var selectBox = event.target;

          while (selectBox.parentNode) {
            selectBox = selectBox.parentNode;

            if (selectBox.classList.contains('select-box')) {
              return selectBox.classList.add('visible');
            }
          }
        }

        return event.target.classList.add('visible');
      };

      app.events.showProfilePictureUploadModal = function(event) {
        var uploadModal = document.querySelector('.upload-modal');

        // if the current click targets the modal itself, quit
        if (uploadModal) {
          return false;
        }

        app.helpers.openProfilePictureUploadModal();

        return true;
      };

      app.events.hideProfilePictureUploadModal = function(event) {
        var uploadModal = document.querySelector('.upload-modal');

        if (!uploadModal) {
          return false;
        }

        // if the current click targets the modal itself, quit
        if (uploadModal && uploadModal.contains(event.target)) {
          return false;
        }

        if (app.elements.profilePicture.contains(event.target)) {
          return false;
        }

        app.helpers.closeProfilePictureUploadModal();
        return true;
      };

      /**
       * reads the currently selected file and swaps the profile picture
       *
       * @param event
       */
      app.events.previewNewProfilePicture = function(event) {
        app.elements.profilePicture.querySelector('.current-picture').classList.add('loading');
        var file = event.target.files[ 0 ];
        var reader = new FileReader();

        reader.onload = function(event) {

          // iterate over the images in the profile picture container, replace
          // the current content with the image selected for upload
          Array.prototype.forEach.call(
            app.elements.profilePicture.querySelectorAll('img'),
            function(picture) {
              picture.src = event.target.result;
            }
          );

          app.elements.profilePicture.querySelector('.current-picture').classList.remove('loading');
        };
        reader.readAsDataURL(file);
      };

      /**
       * uploads the currently selected file, if the type matches.
       * this uses flatm8's HTTP module for the request.
       */
      app.connectors.uploadProfilePicture = function() {
        var file = document.getElementById('file-input').files[ 0 ];

        if (file.type.match('image\/jp(e)?g')) {
          var data = new FormData();
          data.append('profilePicture', file);
          data.append('user', app.config.user.id);
          data.append('_csrf', document.body.dataset.csrfToken);

          // post the picture to the server
          return app.http.post('/api/user/picture', data, function(response) {

            // if the response is okay (= 200 or 204 set as status code)
            if (response.ok) {

              // iterate over the images in the profile picture container, replace
              // the current content with the image present on the server
              Array.prototype.forEach.call(
                app.elements.profilePicture.querySelectorAll('img'),
                function(picture) {
                  picture.src = '/api/user/picture?cacheBuster=' + Date.now();
                }
              );

              app.helpers.closeProfilePictureUploadModal();
              return app.notifications.success('[[account:upload_profile_picture.success]]');
            } else {
              return app.error(new Error('POST failed: Error ' + response.status + ' - ' + response.statusText), '[[account:upload_profile_picture.error]]');
            }
          });
        } else {
          return app.error('wrong file type: ' + file.type, '[[account:upload_profile_picture.wrong_type]]');
        }
      };

      app.helpers.openProfilePictureUploadModal = function() {
        // add event listener to HTML to close it again
        app.on('click', document.documentElement, app.events.hideProfilePictureUploadModal, { propagate: false });

        app.elements.profilePicture.classList.add('upload-visible');
        app.templates.profilePictureUploadModal.then(function(element) {
          app.elements.profilePicture.appendChild(element);
        }).then(function() {
          app.on('change', app.elements.profilePicture.querySelector('input'), app.events.previewNewProfilePicture);
          app.on('click', app.elements.profilePicture.querySelector('.save-picture'), app.connectors.uploadProfilePicture);
        });
      };

      app.helpers.closeProfilePictureUploadModal = function() {
        // remove the modal
        document.querySelector('.upload-modal').remove();
        app.elements.profilePicture.classList.remove('upload-visible');

        // remove the event listener from HTML
        app.off('click', document.documentElement, app.events.hideProfilePictureUploadModal);
      };

      app.templates.profilePictureUploadModal = (function() {
        var profilePicturePath = '/images/users/' + (app.config.user.hasProfilePicture ? app.config.user._id : 'default') + '.jpg',
            userPrimaryColor   = app.config.user.color,
            userSecondaryColor = app.config.user.color.replace(/, 1\)$/, ', .2)');

        return app.helpers.createTranslatedElement('<div class="upload-modal">' +
          '<header><h2>[[account:upload_profile_picture]]</h2></header>' +
          '<article>' +
          '<section class="preview" style="background: linear-gradient(135deg, ' + userSecondaryColor + ' 0%,' + userPrimaryColor + ' 100%);">' +
          '<div class="current-picture"><img src="' + profilePicturePath + '" alt></div>' +
          '</section>' +
          '<section class="upload-controls">' +
          '<input type="file" name="profilePicture" id="file-input">' +
          '<button type="button" class="save-picture"><span class="fa fa-upload"></span> [[global:do_upload]]</button>' +
          '</section>' +
          '</article>' +
          '</div>');
      })();

      app.listeners.addLinkEvents();
      app.listeners.addInputEvents();
      app.listeners.addSelectBoxEvents();
      app.listeners.addProfilePictureEvents();
    });
  });
};
