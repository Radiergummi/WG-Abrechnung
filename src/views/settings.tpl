<!-- IMPORT partials/header.tpl -->
<article class="settings">
  <h1>[[settings:title]]</h1>
  <section class="settings-category settings-content">
    <header class="settings-header">
      <h2 class="settings-category-title">[[settings:content]]</h2>
    </header>
    <ul class="settings-data">
      <li>
        <a href="#settings-user">[[settings:user]]</a>
      </li>
      <li>
        <a href="#settings-interface">[[settings:interface]]</a>
      </li>
      <li>
        <a href="#settings-user-management">[[settings:user_management]]</a>
      </li>
    </ul>
  </section>
  <section class="settings-category" id="settings-user">
    <header class="settings-header">
      <h2 class="settings-category-title">[[settings:user]]</h2>
    </header>
    <ul class="settings-data">
      <li class="settings-group">
        <ul>
          <li class="setting setting-first-name">
            <label for="first-name">[[settings:user.first_name]]</label>
            <input id="first-name" type="text" value="{user.firstName}">
          </li>
          <li class="setting setting-last-name">
            <label for="last-name">[[settings:user.last_name]]</label>
            <input id="last-name" type="text" value="{user.lastName}">
          </li>
        </ul>
      </li>
      <li class="setting setting-email-address">
        <label for="email-address">[[settings:user.email_address]]</label>
        <input id="email-address" type="email" value="{user.email}">
      </li>
    </ul>
  </section>
  <section class="settings-category" id="settings-interface">
    <header class="settings-header">
      <h2 class="settings-category-title">[[settings:interface]]</h2>
    </header>
    <ul class="settings-data">
      <li>
        <label for="language">[[settings:language]]</label>
        <select id="language">
          <optgroup label="[[settings:language.de_DE]]">
            <option value="de_DE" selected>[[settings:language.de_DE]] (de_DE)</option>
            <option value="de_AT">[[settings:language.de_DE]] (de_AT)</option>
            <option value="de_CH">[[settings:language.de_DE]] (de_CH)</option>
          </optgroup>
          <optgroup label="[[settings:language.en_US]]">
            <option value="en_US">[[settings:language.en_US]] (en_US)</option>
            <option value="en_GB">[[settings:language.en_US]] (en_GB)</option>
          </optgroup>
        </select>
      </li>
    </ul>
  </section>
  <section class="settings-category" id="settings-household">
    <header class="settings-header">
      <h2 class="settings-category-title">[[settings:household]]</h2>
    </header>
    <ul class="settings-data">
      <li>
        <label for="household-type">[[settings:household.type]]</label>
        <select id="household-type">
          <option value="single">[[settings:household.type_single]]</option>
          <option value="family">[[settings:household.type_family]]</option>
          <option value="shared_flat">[[settings:household.type_shared_flat]]</option>
        </select>
        <div class="help-text" data-help-text-title="[[global:help]]">
          [[settings:household.help_text]]<br>
          <ul>
            <li>
              <h4>[[settings:household.type_single]]:</h4>
              [[settings:household.help_text.type_single]]
            </li>
            <li>
              <h4>[[settings:household.type_family]]:</h4>
              [[settings:household.help_text.type_family]]
            </li>
            <li>
              <h4>[[settings:household.type_shared_flat]]:</h4>
              [[settings:household.help_text.type_shared_flat]]
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
  <section class="settings-category" id="settings-user-management">
    <header class="settings-header">
      <h2 class="settings-category-title">[[settings:user_management]]</h2>
    </header>
    <ul class="settings-data">
      <li>
        <table class="users">
          <thead>
          <tr>
            <th>[[settings:user_management.profile_picture]]</th>
            <th>[[users:first_name]]</th>
            <th>[[users:last_name]]</th>
            <th>[[users:role]]</th>
            <th class="actions"></th>
          </tr>
          </thead>
          <tbody>
          <!-- BEGIN users -->
          <tr>
            <td>
              <div class="profile-picture">
                <img src="/images/users/{users._id}.jpg" title="{users._id}">
              </div>
            </td>
            <td>{users.firstName}</td>
            <td>{users.lastName}</td>
            <td>[[global:{users.role}_user]]</td>
            <td class="actions">
              <button class="edit-user" data-user-id="{users._id}"><span class="fa fa-edit"></span> [[global:edit]]
              </button>
              <button class="remove-user danger" data-user-id="{users._id}"><span
                class="fa fa-trash-o"></span> [[global:delete]]
              </button>
            </td>
          </tr>
          <!-- END users -->
          </tbody>
        </table>
        <div class="help-text">
          [[settings:user_management.help_text, [[global:admin_users]], [[global:normal_users]]]]
        </div>
        <div class="user-actions">
          <a class="button" href="/users/create"><span class="fa fa-user-plus"></span> [[global:do_create]]</a>
          <button class="invite-user" type="button"><span class="fa fa-paper-plane"></span> [[users:invite]]</button>
        </div>
      </li>
    </ul>
  </section>
</article>
<script src="/javascripts/settings.js"></script>
<!-- IMPORT partials/footer.tpl -->
