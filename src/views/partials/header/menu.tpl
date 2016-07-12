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
