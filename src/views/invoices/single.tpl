<!-- IMPORT partials/header.tpl -->
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li>
      <a href="/invoices" class="back-link"><span class="fa fa-arrow-left"></span> Zurück</a>
    </li><!-- IF userInvoices.ownInvoice --><li>
      <a href="/invoices/{userInvoices._id}/edit"><span class="fa fa-edit"></span> Bearbeiten</a>
    </li><li>
    <a href="/invoices/{userInvoices._id}/delete"><span class="fa fa-save"></span> Löschen</a>
  </li><!-- ENDIF userInvoices.ownInvoice -->
  </ul>
</nav>
<div class="single-invoice">
  <article class="invoice" id="{userInvoices._id}">
    <section class="invoice-data">
      <div class="invoice-id">{userInvoices._id}</div>
      Datum: <span class="invoice-creation-date">{userInvoices.creationDate}</span><br>
      Summe: <span class="invoice-sum">{userInvoices.sum}</span>€<br>
      <span class="tags-label">Tags:</span>
      <div class="invoice-tags">
        <!-- IF userInvoices.tags.length -->
        <!-- BEGIN userInvoices.tags -->
        <div class="tag tag-{userInvoices.tags.color}" id="{userInvoices.tags._id}">
          <span>{userInvoices.tags.name}</span>
        </div>
        <!-- END userInvoices.tags -->
        <!-- ELSE -->
        <span class="no-tags">Es wurden keine Tags angegeben.</span>
        <!-- ENDIF userInvoices.tags.length -->
      </div>
    </section>
    <section class="invoice-image">
      <img src="/images/invoices/{user._id}/{userInvoices._id}.jpg"
           alt="Rechnung {userInvoices._id}">
    </section>
  </article>
</div>
<!-- IMPORT partials/footer.tpl -->
