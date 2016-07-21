<!-- IMPORT partials/header.tpl -->
<nav class="invoices-navigation sub-navigation">
  <ul>
    <li>
      <a href="/invoices" class="back-link"><span class="fa fa-arrow-left"></span> Zurück</a>
    </li><li>
      <a href="#advanced-search-controls" class="advanced-search-controls-toggle"><span class="fa fa-cogs"></span>
        Erweitert</a>
    </li>
  </ul>
</nav>
<article class="search-invoices">
  <header class="search-controls">
    <h1>Suche nach Rechnungen</h1>
    <input type="search" id="search-input" placeholder="ID, Summe oder Datum"<!-- IF query --> value="{query}"<!-- ENDIF query -->>
    <button type="button" id="submit-search"><span class="fa fa-search"></span></button>
    <section id="advanced-search-controls">
      <h2>Erweiterte Einstellungen</h2>
      <div class="control-container">
        <div class="invoice-id-wrap">
          <label for="invoice-id">ID</label>
          <input id="invoice-id" type="text" name="invoice-id" placeholder="Rechnungs-ID">
        </div>
        <div class="invoice-sum-wrap">
          <label for="invoice-sum">Summe</label>
          <select id="invoice-sum" name="invoice-sum">
            <option value="5">Unter 5€</option>
            <option value="10">Unter 10€</option>
            <option value="20">Unter 20€</option>
            <option value="50">Unter 50€</option>
            <option value="100">Unter 100€</option>
            <option value="200">Unter 200€</option>
            <option value="999">Über 200€</option>
          </select>
        </div>
        <div class="invoice-tags-wrap">
          <label for="invoice-tag">Tag</label>
          <input id="invoice-tag" type="text" name="invoice-tag" placeholder="Tag-Name">
        </div>
        <div class="invoice-date-wrap">
          <label for="invoice-date">Datum</label>
          <input id="invoice-date" type="date" name="invoice-date">
        </div>
      </div>
    </section>
  </header>
  <section class="search-results">
    <!-- IF results.length -->
      <!-- IF singleResult -->
        <h2>Ein Ergebnis für <span class="search-query">{query}</span></h2>
      <!-- ELSE -->
        <h2>{results.length} Ergebnisse für <span class="search-query">{query}</span></h2>
      <!-- ENDIF singleResult -->

    <!-- ELSE -->

      <!-- IF query -->
        <h2 class="no-results">Keine Ergebnisse für <span class="search-query">{query}</span></h2>
      <!-- ENDIF query -->

    <!-- ENDIF results.length -->
    <ul class="invoices">
      <!-- BEGIN results -->
        <li class="search-result invoice<!-- IF results.ownInvoice --> own-invoice<!-- ENDIF results.ownInvoice -->" id="{results._id}">
          <section class="invoice-image">
            <img src="/images/invoices/{user._id}/{results._id}.jpg" alt="Rechnung {results._id}" onerror="app.events.imageError(this)">
          </section>
          <section class="invoice-data">
            <div class="invoice-id">{results._id}</div>
            <div class="invoice-owner" id="{results.user._id}">
              <div class="profile-picture">
                <img src="/images/users/{results.user._id}.jpg" alt>
              </div><span class="owner-name">{results.user.firstName} {results.user.lastName}</span>
            </div>
            Datum: <span class="invoice-creation-date">{results.creationDate}</span><br>
            Summe: <!-- IF results.sum --><span class="invoice-sum">{results.sum}</span>€<!-- ELSE -->Noch keine Summe angegeben<!-- ENDIF results.sum -->
            <br>
            <div class="tags-label">Tags:</div>
            <div class="invoice-tags">
              <!-- BEGIN results.tags -->
                <div class="tag tag-{results.tags.color}" id="{results.tags._id}">
                  <span>{results.tags.name}</span>
                </div>
              <!-- END results.tags -->

              <!-- IF !results.tags.length -->
              <span class="no-tags">Es wurden keine Tags angegeben.</span>
              <!-- ENDIF !results.tags.length -->
            </div>
          </section>
          <section class="invoice-actions" data-own="{results.ownInvoice}">
            <a class="button" href="/invoices/{results._id}"><span class="fa fa-eye"></span> Ansehen</a><!-- IF results.ownInvoice --><a class="button" href="/invoices/{results._id}/edit"><span class="fa fa-edit"></span> Bearbeiten</a><a class="button danger" href="/invoices/{results._id}/delete"><span class="fa fa-trash-o"></span> Löschen</a>
            <!-- ENDIF results.ownInvoice -->
          </section>
        </li>
      <!-- END results -->
    </ul>
  </section>
</article>
<script src="/javascripts/invoices.search.js"></script>
<!-- IMPORT partials/footer.tpl -->
