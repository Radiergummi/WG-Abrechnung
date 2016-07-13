<!-- IMPORT partials/header.tpl -->
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li>
      <a href="/invoices/create"><span class="fa fa-plus"></span> Neu</a>
    </li><li>
      <a href="/invoices/search"><span class="fa fa-search"></span> Suchen</a>
    </li>
  </ul>
</nav>
<article class="invoices">
  <!-- IF userInvoices.length -->
  <div class="timeline-item timeline-first" data-timeline-description="Keine aktuelleren Daten"></div>
    <!-- BEGIN userInvoices -->
      <!-- IMPORT partials/invoice.tpl -->
      <!-- IF !@last -->
        <div class="timeline-item timeline-separator timeline-within-range"></div>
      <!-- ENDIF !@last -->
    <!-- END userInvoices -->
  <div class="timeline-item timeline-loading"></div>
  <div class="timeline-item timeline-last" data-timeline-description="Keine älteren Daten"></div>
  <!-- ELSE -->
    <span class="no-invoices">Es sind noch keine Rechnungen vorhanden.</span>
  <!-- ENDIF userInvoices.length -->
</article>
<script src="/javascripts/invoices.all.js"></script>
<!-- IMPORT partials/footer.tpl -->
