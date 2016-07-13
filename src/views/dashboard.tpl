<!-- IMPORT partials/header.tpl -->
<article class="dashboard">
  <section class="introduction">
    <h1>Hi {user.firstName}!</h1>
    <p>
      Hier findest du eine Übersicht über alle aktuellen Rechnungen dieses Monats.
    </p>
  </section>
  <section class="current-month">
    <div class="open-invoices">
      <!-- IF userInvoices.length -->
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
            <img src="/images/invoices/{user._id}/{userInvoices._id}.jpg" alt>
          </td>
          <td class="invoice-sum">
            <!-- IF userInvoices.sum -->
            <span>{userInvoices.sum} €</span>
            <!-- ELSE -->
            <input type="number" placeholder="Summe" step="0.01" name="sum-{userInvoices._id}">
            <button type="button" class="save-invoice-sum"><span class="fa fa-save"></span> Speichern</button>
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
      <span class="no-invoices">Noch keine Rechnungen vorhanden.</span>
      <!-- ENDIF userInvoices.length -->
    </div>
  </section>
</article>
<script src="/javascripts/dashboard.js"></script>
<!-- IMPORT partials/footer.tpl -->
