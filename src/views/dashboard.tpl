<!-- IMPORT partials/header.tpl -->
<article class="dashboard">
  <section class="introduction">
    <h1>[[dashboard:greeting, {user.firstName}]]</h1>
    <p>[[dashboard:intro_text]]</p>
  </section>
  <section class="current-month">
    <div class="open-invoices">
      <!-- IF userInvoices.length -->
      <table>
        <thead>
        <tr>
          <th class="invoice-state">[[dashboard:invoices.status]]</th>
          <th class="invoice-image">[[dashboard:invoices.image]]</th>
          <th class="invoice-sum">[[dashboard:invoices.sum]]</th>
          <th class="invoice-date">[[dashboard:invoices.date]]</th>
          <th class="invoice-tags">[[dashboard:invoices.tags]]</th>
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
            <input type="number" placeholder="[[dashboard:invoices.sum]]" step="0.01" name="sum-{userInvoices._id}">
            <button type="button" class="save-invoice-sum"><span class="fa fa-save"></span> [[global:do_save]]</button>
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
      <span class="no-invoices">[[dashboard:no_invoices]]</span>
      <!-- ENDIF userInvoices.length -->
    </div>
  </section>
</article>
<!-- IMPORT partials/footer.tpl -->
