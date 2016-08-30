<!-- IMPORT partials/header.tpl -->
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li>
      <a href="/invoices/create"><span class="fa fa-plus"></span> [[global:do_create]]</a>
    </li><li>
      <a href="/invoices/search"><span class="fa fa-search"></span> [[invoices:search]]</a>
    </li>
  </ul>
</nav>
<article class="invoices">
  <!-- IF userInvoices.length -->
  <div class="timeline-item timeline-first" data-timeline-description="[[invoices:no_more_recent]]"></div>
    <!-- BEGIN userInvoices -->
      <!-- IMPORT partials/invoice.tpl -->
      <!-- IF !@last -->
        <div class="timeline-item timeline-separator timeline-within-range"></div>
      <!-- ENDIF !@last -->
    <!-- END userInvoices -->
  <div class="timeline-item timeline-data-available"></div>
  <!-- ELSE -->
    <span class="no-invoices">[[invoices:no_invoices]]</span>
  <!-- ENDIF userInvoices.length -->
</article>
<!-- IMPORT partials/footer.tpl -->
