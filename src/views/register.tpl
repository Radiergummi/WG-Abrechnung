<!-- IMPORT partials/header.tpl -->
<article class="registration-container">
  <p>{errorMessage}</p>
  <!-- IF error -->
    <div class="error">
      <h1>{error.type}</h1>
      <p>{error.message}</p>
    </div>
  <!-- ELSE -->
  <!-- IF token -->
    <!-- IF verified -->
      <h2>[[global:registration]]</h2>
      <p>
        Bitte das Formular vollständig ausfüllen, um ein Konto anzulegen.
      </p>
      <form id="registration-form" method="post" action="/register">
        <label for="first-name">[[users:first_name]]</label>
        <input id="first-name" type="text" required>

        <label for="last-name">[[users:last_name]]</label>
        <input id="last-name" type="text" required>

        <label for="email-address">[[users:email_address]]</label>
        <input id="email-address" type="email" required>

        <label for="language">[[global:language]]</label>
        <select id="language">
          <option value="de_DE">[[global:language.german]] (de_DE)</option>
          <option value="en_US">[[global:language.english]] (en_US)</option>
        </select>

        <label for="username">[[users:username]]</label>
        <input id="username" type="text" required>

        <label for="password">[[users:password]]</label>
        <input id="password" type="password" required>


        <button type="submit" class="register-button"><span class="fa fa-send"></span> [[global:register]]</button>
      </form>
      </form>
    <!-- ELSE -->
      <div class="error">
        <h1>Die Einladung ist abgelaufen.</h1>
        <p>
          Diese Einladung ist leider nicht mehr gültig.<br>
          Aus Sicherheitsgründen laufen Einladungungen nach drei Tagen ab.
        </p>
      </div>
    <!-- ENDIF verified -->
  <!-- ELSE -->
  <h2>Einladungscode eingeben</h2>
  <p>
    Um mit der Registrierung fortzufahren, bitte jetzt den Einladungscode aus der E-Mail eingeben.
  </p>
  <input id="invitation-token" type="text">

  <button type="button" id="verify-token">[[global:continue]]</button>
  <div class="language-switcher">
    <a href="?lang=en_US" data-language="en_US">English</a>
  </div>
  <!-- ENDIF token -->
  <!-- ENDIF error -->
</article>
<script src="/javascripts/registration.js"></script>
<!-- IMPORT partials/footer.tpl -->
