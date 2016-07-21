<article class="invoice<!-- IF userInvoices.ownInvoice --> own-invoice<!-- ENDIF userInvoices.ownInvoice -->" id="{userInvoices._id}">
  <section class="invoice-image">
    <img src="/images/invoices/{user._id}/{userInvoices._id}.jpg"
         alt="Rechnung {userInvoices._id}"
         onerror="app.events.imageError(this)"
    >
  </section>
  <section class="invoice-data">
    <div class="invoice-id">{userInvoices._id}</div>
    <div class="invoice-owner">
      <div class="profile-picture">
        <img src="/images/users/{userInvoices.user._id}.jpg" alt>
      </div><span class="owner-name">{userInvoices.user.firstName} {userInvoices.user.lastName}</span>
    </div>
    Datum: <span class="invoice-creation-date">{userInvoices.creationDate}</span><br>
    Summe: <!-- IF userInvoices.sum --><span class="invoice-sum">{userInvoices.sum}</span>€<!-- ELSE -->Noch keine Summe angegeben<!-- ENDIF userInvoices.sum --><br>
    <div class="tags-label">Tags:</div>
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
  <section class="invoice-actions">
    <a class="button" href="/invoices/{userInvoices._id}"><span class="fa fa-eye"></span>
      Ansehen</a><!-- IF userInvoices.ownInvoice --><a class="button" href="/invoices/{userInvoices._id}/edit"><span class="fa fa-edit"></span>
      Bearbeiten</a><a class="button danger" href="/invoices/{userInvoices._id}/delete"><span
        class="fa fa-trash-o"></span>
      Löschen</a>
    <!-- ENDIF userInvoices.ownInvoice -->
  </section>
</article>
