<!-- IMPORT partials/header.tpl -->
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li>
      <a href="/invoices" class="back-link"><span class="fa fa-arrow-left"></span> [[global:back]]</a>
    </li><li>
    <a href="/invoices/create/save"><span class="fa fa-save"></span> [[global:do_save]]</a>
  </li>
  </ul>
</nav>
<div class="create-invoice">
  <article class="invoice" id="{userInvoices._id}">
    <section class="invoice-image">
    </section>
    <section class="invoice-data">
      <h1 class="invoice-id">[[invoices:title_new]]</h1>
      <label for="invoice-picture">[[invoices:input.invoice_picture]]</label>
      <input type="file" name="invoicePicture" id="invoice-picture" accept="image/jpeg,image/jpg" required>

      <label for="invoice-creation-date">[[invoices:date]]:</label>
      <input id="invoice-creation-date" type="date" name="creationDate" value="{todayDate}" required>

      <label for="invoice-sum">[[invoices:sum]]:</label>
      <input id="invoice-sum" type="number" name="sum" step="0.01" placeholder="0,00€">

      <span class="tags-label">[[invoices:tags]]:</span>
      <div class="invoice-tags"></div>
    </section>
    <section class="invoice-actions">
      <a class="button" href="/invoices"><span class="fa fa-arrow-left"></span> [[global:back]]</a>
      <button type="button" id="save-invoice"><span class="fa fa-save"></span> [[global:do_Save]]</button>
    </section>
  </article>
</div>
<!-- IMPORT partials/footer.tpl -->
