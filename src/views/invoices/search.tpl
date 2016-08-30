<!-- IMPORT partials/header.tpl -->
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li>
      <a href="/invoices" class="back-link"><span class="fa fa-arrow-left"></span> [[global:back]]</a>
    </li><li>
      <a href="#advanced-search-controls" class="advanced-search-controls-toggle"><span class="fa fa-cogs"></span>
        [[global:advanced]]</a>
    </li>
  </ul>
</nav>
<article class="search-invoices">
  <header class="search-controls">
    <h1>[[search:title]]</h1>
    <input type="search" id="search-input"
           placeholder="[[search:input.placeholder]]"<!-- IF query --> value="{query}"<!-- ENDIF query -->>
    <button type="button" id="submit-search"><span class="fa fa-search"></span></button>
    <section id="advanced-search-controls">
      <h2>[[search:advanced_controls]]</h2>
      <div class="control-container">
        <div class="invoice-id-wrap">
          <label for="invoice-id">[[search:input.id_label]]</label>
          <input id="invoice-id" type="text" name="invoice-id" placeholder="[[search:input.id_placeholder]]">
        </div>
        <div class="invoice-sum-wrap">
          <label for="invoice-sum">[[search:input.sum_label]]</label>
          <select id="invoice-sum" name="invoice-sum">
            <option value="5">[[search:input.sum_below, 5]]</option>
            <option value="10">[[search:input.sum_below, 10]]</option>
            <option value="20">[[search:input.sum_below, 20]]</option>
            <option value="50">[[search:input.sum_below, 50]]</option>
            <option value="100">[[search:input.sum_below, 100]]</option>
            <option value="200">[[search:input.sum_below, 200]]</option>
            <option value="999">[[search:input.sum_above, 200]]</option>
          </select>
        </div>
        <div class="invoice-tags-wrap">
          <label for="invoice-tag">[[search:input.tag_label]]</label>
          <input id="invoice-tag" type="text" name="invoice-tag" placeholder="[[search:input.tag_placeholder]]">
        </div>
        <div class="invoice-date-wrap">
          <label for="invoice-date">[[search:input.date_label]]</label>
          <input id="invoice-date" type="date" name="invoice-date" placeholder="[[search:input.date_placeholder]]">
        </div>
      </div>
    </section>
  </header>
  <section class="search-results">
    <!-- IF results.length -->
    <!-- IF singleResult -->
    <h2>[[search:single_result, {query}]]</h2>
    <!-- ELSE -->
    <h2>[[search:multiple_results, {results.length}, {query}]]</h2>
    <!-- ENDIF singleResult -->

    <!-- ELSE -->

    <!-- IF query --><h2 class="no-results">[[search:no_results, {query}]]</h2><!-- ENDIF query -->

    <!-- ENDIF results.length -->
    <ul class="invoices">
      <!-- BEGIN results -->
      <li class="search-result invoice<!-- IF results.ownInvoice --> own-invoice<!-- ENDIF results.ownInvoice -->"
          id="{results._id}">
        <section class="invoice-image">
          <img src="/images/invoices/{user._id}/{results._id}.jpg" alt="Rechnung {results._id}"
               onerror="app.events.imageError(this)">
        </section>
        <section class="invoice-data">
          <div class="invoice-id">{results._id}</div>
          <div class="invoice-owner" id="{results.user._id}">
            <div class="profile-picture">
              <img src="/images/users/{results.user._id}.jpg" alt>
            </div>
            <span class="owner-name">{results.user.firstName} {results.user.lastName}</span>
          </div>
          [[invoices:date]]: <span class="invoice-creation-date">{results.creationDate}</span><br>
          [[invoices:sum]]: <!-- IF results.sum --><span
          class="invoice-sum">{results.sum}</span>€<!-- ELSE -->[[search:no_sum]]<!-- ENDIF results.sum -->
          <br>
          <div class="tags-label">[[invoices:tags]]:</div>
          <div class="invoice-tags">
            <!-- BEGIN results.tags -->
            <div class="tag tag-{results.tags.color}" id="{results.tags._id}">
              <span>{results.tags.name}</span>
            </div>
            <!-- END results.tags -->

            <!-- IF !results.tags.length -->
            <span class="no-tags">[[search:no_tags]]</span>
            <!-- ENDIF !results.tags.length -->
          </div>
        </section>
        <section class="invoice-actions" data-own="{results.ownInvoice}">
          <a class="button" href="/invoices/{results._id}"><span
            class="fa fa-eye"></span> [[global:details]]</a><!-- IF results.ownInvoice --><a class="button"
                                                                                             href="/invoices/{results._id}/edit"><span
          class="fa fa-edit"></span> [[global:edit]]</a><a class="button danger"
                                                           href="/invoices/{results._id}/delete"><span
          class="fa fa-trash-o"></span> [[global:delete]]</a>
                                                            <!-- ENDIF results.ownInvoice -->
        </section>
      </li>
      <!-- END results -->
    </ul>
  </section>
</article>
<!-- IMPORT partials/footer.tpl -->
