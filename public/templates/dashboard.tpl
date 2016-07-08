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
            <img src="/images/users/{user.id}.jpg" alt="">
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
      <!-- IF user.invoices.length -->
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
        <!-- BEGIN user.invoices -->
        <tr id="{user.invoices._id}">
          <td class="invoice-state">
            <!-- IF user.invoices.sum -->
            <span class="fa fa-check"></span>
            <!-- ELSE -->
            <span class="fa fa-times"></span>
            <!-- ENDIF user.invoices.sum -->
          </td>
          <td class="invoice-image">
            <img src="/images/invoices/{user._id}/{user.invoices._id}.jpg" alt>
          </td>
          <td class="invoice-sum">
            <!-- IF user.invoices.sum -->
            <span>{user.invoices.sum} €</span>
            <!-- ELSE -->
            <input type="number" placeholder="Summe" step="0.01" name="sum-{user.invoices._id}">
            <button type="button" class="save-invoice-sum"><span class="fa fa-save"></span> Speichern</button>
            <!-- ENDIF user.invoices.sum -->
          </td>
          <td class="invoice-date">
            <span>{user.invoices.creationDate}</span>
          </td>
          <td class="invoice-tags">
            <!-- BEGIN user.invoices.tags -->
              <div class="tag tag-{user.invoices.tags.color}" id="{user.invoices.tags._id}">
                {user.invoices.tags.name} <span class="remove-tag fa fa-times"></span>
              </div>
            <!-- END user.invoices.tags -->
            <div class="tag editable add-new" contenteditable="true"><span class="fa fa-plus"></span></div>
          </td>
        </tr>
        <!-- END user.invoices -->
        </tbody>
      </table>
      <!-- ELSE -->
      <span class="no-invoices">Noch keine Rechnungen vorhanden.</span>
      <!-- ENDIF user.invoices.length -->
    </div>
  </section>
</article>
<script src="/javascripts/dashboard.js"></script>
    </main>
    <script src="javascripts/main.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function(event) {
        app.init();
      });
    </script>
  </body>
</html>

