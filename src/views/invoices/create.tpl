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

      <div class="invoice-picture-drop-area" data-upload-text="[[global:dragndrop_drop_here]]">
        <progress min="0" max="100" value="0" class="invoice-upload-progress"></progress>
        <div class="fallback"><label for="invoice-picture">[[invoices:input.picture_label]]</label>
          <input type="file" name="invoicePicture" id="invoice-picture" accept="image/jpeg,image/jpg" required>
        </div>
      </div>

      <label for="invoice-creation-date">[[invoices:date]]:</label>
      <input id="invoice-creation-date" type="date" name="creationDate" value="{todayDate}" required>

      <label for="invoice-sum">[[invoices:sum]]:</label>
      <input id="invoice-sum" type="number" name="sum" step="0.01" placeholder="0,00€">

      <label for="invoice-tag">[[invoices:tags]]:</label>
      <div class="invoice-tags">
        <input id="invoice-tag" type="text" placeholder="[[invoices:input.tag_label]]">
      </div>
    </section>
    <section class="invoice-actions">
      <a class="button" href="/invoices"><span class="fa fa-arrow-left"></span> [[global:back]]</a>
      <button type="button" id="save-invoice"><span class="fa fa-save"></span> [[global:do_save]]</button>
    </section>
  </article>
</div>
<!-- IMPORT partials/footer.tpl -->
