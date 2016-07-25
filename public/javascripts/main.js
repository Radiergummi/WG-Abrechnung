/*
 global app
 */

if (! app) {
  var app = require('./app');
}

(function () {
  app.startup.push(function () {
    app.elements.profilePicture = document.getElementsByClassName('profile-picture')[ 0 ];
    app.elements.backLinks      = document.getElementsByClassName('back-link');
    app.elements.inputElements  = document.getElementsByTagName('input');

    app.listeners.addLinkEvents = function () {
      Array.prototype.slice.call(app.elements.backLinks).map(function (backLink) {
        backLink.addEventListener('click', app.events.revertLastHistoryState);
      });
    };

    app.listeners.addInputEvents = function () {
      Array.prototype.slice.call(app.elements.inputElements).map(function (inputElement) {
        inputElement.addEventListener('focus', app.events.toggleInputLabelHighlight);
        inputElement.addEventListener('blur', app.events.toggleInputLabelHighlight);
      });
    };

    app.listeners.addProfilePictureEvents = function () {
      app.elements.profilePicture.addEventListener('click', app.events.toggleProfilePictureUploadModal);
      app.elements.overlay.addEventListener('click', app.events.toggleProfilePictureUploadModal);
    };

    app.events.revertLastHistoryState = function (event) {
      event.preventDefault();
      history.go(- 1);

      return false;
    };

    app.events.toggleInputLabelHighlight = function(event) {


      if (event.target.previousElementSibling.tagName == 'LABEL') {
        event.target.previousElementSibling.classList.toggle('in-focus');
      }
    };

    app.events.toggleProfilePictureUploadModal = function (event) {
      if (document.querySelector('.upload-modal') && document.querySelector('.upload-modal').contains(event.target)) {
        return false;
      }

      if (app.elements.profilePicture.classList.contains('upload-visible')) {
        app.elements.profilePicture.querySelector('.upload-modal').remove();
        app.elements.profilePicture.classList.remove('upload-visible');
        app.elements.overlay.classList.add('disabled');
        return;
      }

      app.elements.overlay.classList.remove('disabled');
      app.elements.profilePicture.classList.add('upload-visible');
      app.elements.profilePicture.appendChild(app.templates.profilePictureUploadModal);
      app.elements.profilePicture.querySelector('.save-picture').addEventListener('click', function () {
        var file = document.getElementById('file-input').files[ 0 ];

        if (file.type.match('image\/jp(e)?g')) {
          var data = new FormData();
          data.append('profilePicture', file);
          data.append('user', app.config.user.id);

          fetch(new Request('/api/user/picture/upload', {
            method: 'post',
            body:   data
          })).then(function (data) {
            var pictures = app.elements.profilePicture.querySelectorAll('img');

            pictures[ 0 ].src = '/images/users/' + app.config.user.id + '.jpg?cacheBuster=' + Date.now();
            pictures[ 1 ].src = '/images/users/' + app.config.user.id + '.jpg?cacheBuster=' + Date.now();

          }, function (error) {
            console.error('An error occurred while trying to save the image.', error);
          });
        } else {
          console.error('wrong file type: ' + file.type);
        }
      });
    };

    app.templates.profilePictureUploadModal = (function () {
      var profilePicturePath = '/images/users/' + (app.config.user.hasProfilePicture ? app.config.user._id : 'default') + '.jpg',
          userPrimaryColor = app.config.user.color,
          userSecondaryColor = app.config.user.color.replace(/, 1\)$/, ', .2)');

      return app.helpers.createElement('<div class="upload-modal">' +
        '<header><h2>Profilbild ändern</h2></header>' +
        '<article>' +
        '<section class="preview" style="background: linear-gradient(135deg, ' + userSecondaryColor + ' 0%,' + userPrimaryColor + ' 100%);">' +
        '<div class="current-picture"><img src="' + profilePicturePath + '" alt></div>' +
        '</section>' +
        '<section class="upload-controls">' +
        '<input type="file" name="profilePicture" id="file-input">' +
        '<button type="button" class="save-picture"><span class="fa fa-upload"></span> Hochladen</button>' +
        '</section>' +
        '</article>' +
        '</div>');
    })();

    app.listeners.addLinkEvents();
    app.listeners.addInputEvents();
    app.listeners.addProfilePictureEvents();
  });
})();
