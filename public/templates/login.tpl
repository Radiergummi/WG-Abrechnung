<html lang="de">
  <head>
    <title>WG-Abrechnung</title>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="/stylesheets/style.css" rel="stylesheet"/>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/javascripts/app.js"></script>
    </head>
  <body>
    <div id="overlay" class="disabled"></div>
    <header class="site-header">
      <!--<a href="/" style="display:inline-block">
        <figure class="logo">
          <img src="/images/logo.svg" alt="">
        </figure>
      </a>-->
      <!-- IF user.loggedIn -->
      <nav role="navigation" class="main-navigation">
        <ul>
          <li class="menu-dashboard"><a href="/dashboard">Übersicht</a></li>
          <li class="menu-invoices"><a href="/invoices">Rechnungen</a></li>
          <li class="menu-statistics"><a href="/statistics">Statistiken</a></li>
          <li class="menu-balance"><a href="/balance">Abrechnung</a></li>
          <!-- IF user.isAdmin -->
          <li class="menu-admin"><a href="/admin/dashboard" title="Admin"><i class="fa fa-cogs"></i> Verwaltung</a></li>
          <!-- ENDIF user.isAdmin -->
        </ul>
      </nav>
      <div class="current-user" id="{user.id}">
        <div class="profile-picture">
        <!-- IF user.hasProfilePicture -->
            <img src="/images/users/{user.id}.jpg?cacheBuster={cacheBuster}" alt="">
        <!-- ELSE -->
            <img src="/images/users/default.jpg" alt="">
        <!-- ENDIF user.hasProfilePicture -->
        </div>
        <span class="username">{user.name}</span>
        <a href="/logout" class="logout button"><i class="fa fa-sign-out"></i> Abmelden</a>
      </div>
      <!-- ENDIF user.loggedIn -->
    </header>
    <nav class="breadcrumbs"></nav>
    <main role="main">

<article class="login-container">
  <h1>Anmeldung</h1>
  <div class="error-messages">
    <!-- IF error -->
    <div class="message">{error}</div>
    <!-- ENDIF error -->
  </div>
  <form action="/login" method="post" id="login">
    <input type="text" placeholder="Benutzername" name="user" required>
    <input type="password" placeholder="Passwort" name="pass" required>

    <input type="submit" value="Anmelden">
  </form>
</article>
    </main>
    <script src="javascripts/main.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function(event) {
        app.init();
      });
    </script>
  </body>
</html>

