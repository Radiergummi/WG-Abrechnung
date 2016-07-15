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

<article class="dashboard">
  <section class="introduction">
    <h1>Hi {user.firstName}!</h1>
    <p>
      Hier findest du eine Übersicht über alle aktuellen Rechnungen dieses Monats.
    </p>
  </section>
  <section class="current-month">
    <div class="open-invoices">
      <!-- IF userInvoices.length -->
      <table>
        <thead>
        <tr>
          <th class="invoice-state">
            Status
          </th>
          <th class="invoice-image">
            Rechnung
          </th>
          <th class="invoice-sum">
            Betrag
          </th>
          <th class="invoice-date">
            Datum
          </th>
          <th class="invoice-tags">
            Tags
          </th>
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
            <input type="number" placeholder="Summe" step="0.01" name="sum-{userInvoices._id}">
            <button type="button" class="save-invoice-sum"><span class="fa fa-save"></span> Speichern</button>
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
      <span class="no-invoices">Noch keine Rechnungen vorhanden.</span>
      <!-- ENDIF userInvoices.length -->
    </div>
  </section>
</article>
<script src="/javascripts/dashboard.js"></script>
    </main>
    <script src="/javascripts/main.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function(event) {
        app.init();
      });
    </script>
  </body>
</html>

