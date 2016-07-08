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
      <!-- IF user.invoices.length -->
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
        <!-- BEGIN user.invoices -->
        <tr id="{user.invoices._id}">
          <td class="invoice-state">
            <!-- IF user.invoices.sum -->
            <span class="fa fa-check"></span>
            <!-- ELSE -->
            <span class="fa fa-times"></span>
            <!-- ENDIF user.invoices.sum -->
          </td>
          <td class="invoice-image">
            <img src="/images/invoices/{user._id}/{user.invoices._id}.jpg" alt>
          </td>
          <td class="invoice-sum">
            <!-- IF user.invoices.sum -->
            <span>{user.invoices.sum} €</span>
            <!-- ELSE -->
            <input type="number" placeholder="Summe" step="0.01" name="sum-{user.invoices._id}">
            <button type="button" class="save-invoice-sum"><span class="fa fa-save"></span> Speichern</button>
            <!-- ENDIF user.invoices.sum -->
          </td>
          <td class="invoice-date">
            <span>{user.invoices.creationDate}</span>
          </td>
          <td class="invoice-tags">
            <!-- BEGIN user.invoices.tags -->
              <div class="tag tag-{user.invoices.tags.color}" id="{user.invoices.tags._id}">
                {user.invoices.tags.name} <span class="remove-tag fa fa-times"></span>
              </div>
            <!-- END user.invoices.tags -->
            <div class="tag editable add-new" contenteditable="true"><span class="fa fa-plus"></span></div>
          </td>
        </tr>
        <!-- END user.invoices -->
        </tbody>
      </table>
      <!-- ELSE -->
      <span class="no-invoices">Noch keine Rechnungen vorhanden.</span>
      <!-- ENDIF user.invoices.length -->
    </div>
  </section>
</article>
<script src="/javascripts/dashboard.js"></script>
<!-- IMPORT partials/footer.tpl -->
