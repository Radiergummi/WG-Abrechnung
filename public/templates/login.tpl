<html lang="{language}">
  <head>
    <title>{pageTitle}</title>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="/stylesheets/style.css" rel="stylesheet"/>
<script src="/javascripts/libraries/Chart.bundle.min.js"></script>
<script src="/javascripts/libraries/vanilla-modal.min.js"></script>
<script src="/javascripts/modules/notifications.js"></script>
<script src="/javascripts/modules/translator.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="/javascripts/app.js"></script>

    </head>
  <body class="{bodyClass}">
    <div id="overlay" class="disabled"></div>
    <header class="site-header">
      <!-- IF user.loggedIn -->
<nav role="navigation" class="main-navigation">
  <ul>
    <li class="menu-dashboard<!-- IF dashboardActive --> current-item<!-- ENDIF dashboardActive -->">
      <a href="/dashboard"><span class="fa fa-circle-o"></span> [[menu:dashboard]]</a>
    </li>
    <li class="menu-invoices<!-- IF invoicesActive --> current-item<!-- ENDIF invoicesActive -->">
      <a href="/invoices"><span class="fa fa-inbox"></span> [[menu:invoices]]</a>
    </li>
    <li class="menu-statistics<!-- IF statisticsActive --> current-item<!-- ENDIF statisticsActive -->">
      <a href="/statistics"><span class="fa fa-bar-chart"></span> [[menu:statistics]]</a>
    </li>
    <li class="menu-balance<!-- IF balanceActive --> current-item<!-- ENDIF balanceActive -->">
      <a href="/balance"><span class="fa fa-calculator"></span> [[menu:balance]]</a>
    </li>
    <!-- IF user.isAdmin -->
    <li class="menu-admin">
      <a href="/admin/dashboard" title="Admin"><span class="fa fa-cogs"></span> [[menu:admin]]</a>
    </li>
    <!-- ENDIF user.isAdmin -->
  </ul>
</nav>

<div class="current-user" id="{user.id}">
  <a href="/settings" class="settings button seamless"><span class="fa fa-gears"></span></a>
  <div class="profile-picture">
    <!-- IF user.hasProfilePicture -->
    <img src="/images/users/{user.id}.jpg?cacheBuster={cacheBuster}" alt="">
    <!-- ELSE -->
    <img src="/images/users/default.jpg" alt="">
    <!-- ENDIF user.hasProfilePicture -->
  </div>
  <span class="username">{user.name}</span>
  <a href="/logout" class="logout button seamless"><span class="fa fa-sign-out"></span> [[global:do_logout]]</a>
</div>

      <!-- ENDIF user.loggedIn -->
    </header>
    <nav class="breadcrumbs"></nav>
    <main role="main">

<article class="login-container">
  <h1>[[global:login]]</h1>
  <div class="error-messages">
    <!-- IF error -->
    <div class="message">{error}</div>
    <!-- ENDIF error -->
  </div>
  <form action="/login" method="post" id="login">
    <label for="user"><span class="fa fa-user"></span></label><input id="user" type="text" placeholder="[[global:username]]" name="user" required>
    <label for="pass"><span class="fa fa-lock"></span></label><input id="pass" type="password" placeholder="[[global:password]]" name="pass" required>

    <button type="submit"><span class="fa fa-sign-in"></span> [[global:do_login]]</button>
  </form>
</article>
</main>
<script src="/javascripts/main.js"></script>
<script>
  app.init();
</script>
</body>
</html>

