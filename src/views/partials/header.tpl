<html lang="de">
  <head>
    <title>WG-Abrechnung</title>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="/stylesheets/style.css" rel="stylesheet"/>
    <script src="/socket.io/socket.io.js"></script>
  </head>
  <body>
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
          <li class="menu-statistics"><a href="/statistics">Statistiken</a></li>
          <!-- IF user.isAdmin -->
          <li class="menu-admin"><a href="/admin/dashboard" title="Admin"><i class="fa fa-cogs"></i> Verwaltung</a></li>
          <!-- ENDIF user.isAdmin -->
        </ul>
      </nav>
      <div class="current-user">
        <span class="username">{user.name}</span>
        <a href="/logout" class="logout button">Abmelden <i class="fa fa-sign-out fa-right"></i></a>
      </div>
      <!-- ENDIF user.loggedIn -->
    </header>
    <nav class="breadcrumbs"></nav>
    <main role="main">
