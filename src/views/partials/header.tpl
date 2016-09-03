<html lang="{language}">
  <head>
    <title>{pageTitle}</title>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="/stylesheets/style.css" rel="stylesheet"/>
    <!-- IMPORT partials/scripts.tpl -->
    </head>
  <body class="{bodyClass}">
    <div id="overlay" class="disabled"></div>
    <header class="site-header">
      <!-- IF user.loggedIn -->
        <!-- IMPORT partials/header/menu.tpl -->
        <!-- IMPORT partials/header/account_menu.tpl -->
      <!-- ENDIF user.loggedIn -->
    </header>
    <nav class="breadcrumbs"></nav>
    <main role="main">
