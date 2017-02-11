<html lang="{language}">
  <head>
    <title>{pageTitle}</title>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="/stylesheets/style.css" rel="stylesheet"/>
<!-- BEGIN clientScripts -->
<script src="/javascripts/{clientScripts.name}<!-- IF !debug -->.min<!-- ENDIF !debug -->.js"></script>
<!-- END clientScripts -->

    </head>
  <body class="{bodyClass}" data-csrf-token="{csrfToken}">
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
  </ul>
</nav>

<div class="current-user" data-user-id="{user._id}">
  <a href="/settings" class="settings button seamless"><span class="fa fa-gears"></span></a>
  <div class="profile-picture">
    <img src="/api/user/picture?cacheBuster={cacheBuster}" alt="">
  </div>
  <span class="username">{user.name}</span>
  <a href="/logout" class="logout button seamless"><span class="fa fa-sign-out"></span> [[global:do_logout]]</a>
</div>

      <!-- ENDIF user.loggedIn -->
    </header>
    <nav class="breadcrumbs"></nav>
    <main role="main">
