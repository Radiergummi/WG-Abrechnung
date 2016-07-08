    </main>
    <script src="/javascripts/app.js"></script>
    <script>
      app.init({
        basePath: window.location.origin + '/js',
        modules:  [
          'events',
          'templates',
          'notifications',
          'dom',
          'socketio'
        ]
      }, function() {
        console.log('app is loaded')
      });
    </script>
  </body>
</html>
