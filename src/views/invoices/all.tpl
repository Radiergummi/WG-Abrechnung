<!-- IMPORT partials/header.tpl -->
<pre>
  {debug}
</pre>
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li><a href="/invoices/create"><span class="fa fa-plus"></span> Neu</a></li>
  </ul>
</nav>
<article class="invoices">
  <!-- IF invoices.length -->
    <ul>
      <!-- BEGIN invoices -->
        <li id="{invoices._id}" class="invoice">
          Rechnung vom {invoices.creationDate} mit der Summe {invoices.sum}
        </li>
      <!-- END invoices -->
    </ul>
  <!-- ELSE -->
    <span class="no-invoices">Es sind noch keine Rechnungen vorhanden.</span>
  <!-- ENDIF invoices.length -->
</article>
<!-- IMPORT partials/footer.tpl -->
