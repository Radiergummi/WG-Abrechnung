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
  <body class="{bodyClass}">
    <div id="overlay" class="disabled"></div>
    <header class="site-header">
      <!-- IF user.loggedIn -->
<nav role="navigation" class="main-navigation">
  <ul>
    <li class="menu-dashboard">
      <a href="/dashboard"><span class="fa fa-circle-o"></span> Übersicht</a>
    </li>
    <li class="menu-invoices">
      <a href="/invoices"><span class="fa fa-inbox"></span> Rechnungen</a>
    </li>
    <li class="menu-statistics">
      <a href="/statistics"><span class="fa fa-bar-chart"></span> Statistiken</a>
    </li>
    <li class="menu-balance">
      <a href="/balance"><span class="fa fa-calculator"></span> Abrechnung</a>
    </li>
    <!-- IF user.isAdmin -->
    <li class="menu-admin">
      <a href="/admin/dashboard" title="Admin"><span class="fa fa-cogs"></span> Verwaltung</a>
    </li>
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
