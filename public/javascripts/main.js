/*
 global app
 */

if (!app) {
  var app = require('./app');
}

(function() {
  app.startup.push(function() {
    app.elements.profilePicture = document.getElementsByClassName('profile-picture')[ 0 ];

    app.listeners.addProfilePictureEvents = function() {
      app.elements.profilePicture.addEventListener('click', app.events.toggleProfilePictureUploadModal);
      app.elements.overlay.addEventListener('click', app.events.toggleProfilePictureUploadModal);
    };

    app.events.toggleProfilePictureUploadModal = function(event) {
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
      app.elements.profilePicture.querySelector('.save-picture').addEventListener('click', function() {
        var file = document.getElementById('file-input').files[ 0 ];

        if (file.type.match('image\/jp(e)?g')) {
          var data = new FormData();
          data.append('profilePicture', file);
          data.append('DEBUG', 'test');
console.log('fetrching now', file)
          fetch(new Request('/api/user/picture/upload', {
            method:  'post',
            body:    data
          })).then(e => console.log(e), d => console.log(d));
        } else {
          console.error('wrong file type: ' + file.type);
        }
      });
    };

    app.templates.profilePictureUploadModal = (function() {
      var profilePicturePath = '/images/users/' + (app.config.user.hasProfilePicture ? app.config.user.id : 'default') + '.jpg';

      return app.helpers.createElement('<div class="upload-modal">' +
        '<header><h2>Profilbild ändern</h2></header>' +
        '<article>' +
        '<div class="current-picture"><img src="' + profilePicturePath + '" alt></div>' +
        '<section class="upload-controls">' +
        '<input type="file" name="profilePicture" id="file-input">' +
        '<button type="button" class="save-picture">Hochladen</button>' +
        '</section>' +
        '</article>' +
        '</div>');
    })();

    app.listeners.addProfilePictureEvents();
  });
})();
