<!-- IMPORT partials/header.tpl -->
<article class="login-container">
  <h1>[[global:login]]</h1>
  <div class="error-messages">
    <!-- IF error -->
    <div class="message">{error}</div>
    <!-- ENDIF error -->
  </div>
  <form action="/login" method="post" id="login">
    <label for="user"><span class="fa fa-user"></span></label><input id="user" type="text" placeholder="[[global:username]]" name="user" required>
    <label for="pass"><span class="fa fa-lock"></span></label><input id="pass" type="password" placeholder="[[global:password]]" name="pass" required>

    <button type="submit"><span class="fa fa-sign-in"></span> [[global:do_login]]</button>
  </form>
</article>
<!-- IMPORT partials/footer.tpl -->
