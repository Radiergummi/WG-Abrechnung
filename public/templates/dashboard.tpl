<html lang="{language}">
  <head>
    <title>{pageTitle}</title>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="/stylesheets/style.css" rel="stylesheet"/>
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

<article class="dashboard">
  <section class="introduction">
    <h1>[[dashboard:greeting, {user.firstName}]]</h1>
    <p>[[dashboard:intro_text]]</p>
  </section>
  <section class="current-month">
    <div class="open-invoices">
      <!-- IF userInvoices.length -->
      <table>
        <thead>
        <tr>
          <th class="invoice-state">[[dashboard:invoices.status]]</th>
          <th class="invoice-image">[[dashboard:invoices.image]]</th>
          <th class="invoice-sum">[[dashboard:invoices.sum]]</th>
          <th class="invoice-date">[[dashboard:invoices.date]]</th>
          <th class="invoice-tags">[[dashboard:invoices.tags]]</th>
        </tr>
        </thead>
        <tbody>
        <!-- BEGIN userInvoices -->
        <tr id="{userInvoices._id}">
          <td class="invoice-state">
            <!-- IF userInvoices.sum -->
            <span class="fa fa-check"></span>
            <!-- ELSE -->
            <span class="fa fa-times"></span>
            <!-- ENDIF userInvoices.sum -->
          </td>
          <td class="invoice-image">
            <img src="/images/invoices/{user._id}/{userInvoices._id}.jpg" alt onerror="app.events.imageError(this);">
          </td>
          <td class="invoice-sum">
            <!-- IF userInvoices.sum -->
            <span>{userInvoices.sum} €</span>
            <!-- ELSE -->
            <input type="number" placeholder="[[dashboard:invoices.sum]]" step="0.01" name="sum-{userInvoices._id}">
            <button type="button" class="save-invoice-sum"><span class="fa fa-save"></span> [[global:do_save]]</button>
            <!-- ENDIF userInvoices.sum -->
          </td>
          <td class="invoice-date">
            <span>{userInvoices.creationDate}</span>
          </td>
          <td class="invoice-tags">
            <!-- BEGIN userInvoices.tags -->
              <div class="tag tag-{userInvoices.tags.color}" id="{userInvoices.tags._id}">
                {userInvoices.tags.name} <span class="remove-tag fa fa-times"></span>
              </div>
            <!-- END userInvoices.tags -->
            <div class="tag editable add-new" contenteditable="true"><span class="fa fa-plus"></span></div>
          </td>
        </tr>
        <!-- END userInvoices -->
        </tbody>
      </table>
      <!-- ELSE -->
      <span class="no-invoices">[[dashboard:no_invoices]]</span>
      <!-- ENDIF userInvoices.length -->
    </div>
  </section>
</article>
</main>
<!-- IF user.loggedIn -->
<!-- ENDIF user.loggedIn -->
<!--
<script src="/javascripts/libraries/Chart.bundle.min.js"></script>
<script src="/javascripts/libraries/vanilla-modal.min.js"></script>
<script src="/javascripts/src/modules/notifications.js"></script>
<script src="/javascripts/src/modules/translator.js"></script>
-->
<script src="/socket.io/socket.io.js"></script>
<!-- BEGIN clientScripts -->
<script src="/javascripts/{clientScripts.name}<!-- IF !debug -->.min<!-- ENDIF !debug -->.js"></script>
<!-- END clientScripts -->

</body>
</html>

