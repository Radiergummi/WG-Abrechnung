<!-- IMPORT partials/header.tpl -->
<article class="login-container">
  <h1>Anmeldung</h1>
  <div class="error-messages">
    <!-- IF error -->
    <div class="message">{error}</div>
    <!-- ENDIF error -->
  </div>
  <form action="/login" method="post" id="login">
    <input type="text" placeholder="Benutzername" name="user" required>
    <input type="password" placeholder="Passwort" name="pass" required>

    <input type="submit" value="Anmelden">
  </form>
</article>
<!-- IMPORT partials/footer.tpl -->
