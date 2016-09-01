<article class="invoice<!-- IF userInvoices.ownInvoice --> own-invoice<!-- ENDIF userInvoices.ownInvoice -->" id="{userInvoices._id}">
  <section class="invoice-image">
    <img src="/images/invoices/{user._id}/{userInvoices._id}.jpg"
         alt="[[invoices:title, {userInvoices._id}]]"
    >
  </section>
  <section class="invoice-data">
    <div class="invoice-id">{userInvoices._id}</div>
    <div class="invoice-owner">
      <div class="profile-picture">
        <img src="/images/users/{userInvoices.user._id}.jpg" alt>
      </div><span class="owner-name">{userInvoices.user.firstName} {userInvoices.user.lastName}</span>
    </div>
    [[invoices:date]]: <span class="invoice-creation-date">{userInvoices.creationDate}</span><br>
    [[invoices:sum]]: <!-- IF userInvoices.sum --><span class="invoice-sum">{userInvoices.sum}</span>€<!-- ELSE -->[[invoices:no_sum]]<!-- ENDIF userInvoices.sum --><br>
    <div class="tags-label">[[invoices:tags]]:</div>
    <div class="invoice-tags">
      <!-- IF userInvoices.tags.length -->
      <!-- BEGIN userInvoices.tags -->
      <div class="tag tag-{userInvoices.tags.color}" id="{userInvoices.tags._id}">
        <span>{userInvoices.tags.name}</span>
      </div>
      <!-- END userInvoices.tags -->
      <!-- ELSE -->
      <span class="no-tags">[[invoices:no_tags]]</span>
      <!-- ENDIF userInvoices.tags.length -->
    </div>
  </section>
  <section class="invoice-actions">
    <a class="button" href="/invoices/{userInvoices._id}"><span class="fa fa-eye"></span>
      [[global:details]]</a><!-- IF userInvoices.ownInvoice --><a class="button" href="/invoices/{userInvoices._id}/edit"><span class="fa fa-edit"></span>
      [[global:edit]]</a><a class="button danger" href="/invoices/{userInvoices._id}/delete"><span
        class="fa fa-trash-o"></span>
      [[global:delete]]</a>
    <!-- ENDIF userInvoices.ownInvoice -->
  </section>
</article>
