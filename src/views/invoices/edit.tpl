<!-- IMPORT partials/header.tpl -->
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li>
      <a href="/invoices" class="back-link"><span class="fa fa-arrow-left"></span> Zurück</a>
    </li><li>
    <a href="/invoices/create/save"><span class="fa fa-save"></span> Speichern</a>
  </li>
  </ul>
</nav>
<div class="edit-invoice">
  <article class="invoice" id="{invoice._id}">
    <section class="invoice-image">
      <img src="/images/invoices/{user._id}/{invoice._id}.jpg"
           alt="Rechnung {invoice._id}">
      <div class="change-image">
        <button class="upload-image"><span class="fa fa-upload"></span></button>
      </div>
    </section>
    <section class="invoice-data">
      <h1 class="invoice-id">Rechnung {invoice._id}</h1>
      <label for="invoice-creation-date">Datum:</label> <input id="invoice-creation-date" type="date" name="creationDate" value="{invoice.inputDate}">
      <label for="invoice-sum">Summe:</label> <input id="invoice-sum" type="number" name="sum" step="0.01" value="{invoice.sum}">
      <span class="tags-label">Tags:</span>
      <div class="invoice-tags">
        <!-- IF invoice.tags.length -->
        <!-- BEGIN invoice.tags -->
        <div class="tag tag-{invoice.tags.color}" id="{invoice.tags._id}">
          <span>{invoice.tags.name}</span>
        </div>
        <!-- END invoice.tags -->
        <!-- ELSE -->
        <span class="no-tags">Es wurden keine Tags angegeben.</span>
        <!-- ENDIF invoice.tags.length -->
      </div>
    </section>
    <section class="invoice-actions">
      <a class="button" href="/invoices"><span class="fa fa-arrow-left"></span> Zurück</a>
      <button type="button" id="save-invoice"><span class="fa fa-save"></span> Speichern</button>
    </section>
  </article>
</div>
<!-- IMPORT partials/footer.tpl -->
