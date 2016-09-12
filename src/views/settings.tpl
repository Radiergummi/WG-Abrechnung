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
        <a href="#settings-household">[[settings:household]]</a>
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
      <li class="setting setting-role">
        <label for="role">[[users:role]]</label>
        <select id="role" disabled>
          <option
            value="admin"<!-- IF user.isAdmin --> selected<!-- ENDIF user.isAdmin -->>[[global:admin_user]]</option>
          <option
            value="normal"<!-- IF !user.isAdmin --> selected<!-- ENDIF !user.isAdmin -->>[[global:normal_user]]</option>
        </select>
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
            <th class="picture">[[settings:user_management.profile_picture]]</th>
            <th class="first-name">[[users:first_name]]</th>
            <th class="last-name">[[users:last_name]]</th>
            <th class="role">[[users:role]]</th>
            <th class="actions"></th>
          </tr>
          </thead>
          <tbody>
          <!-- BEGIN users -->
          <tr id="{users._id}">
            <td class="picture">
              <div class="profile-picture">
                <img src="/images/users/{users._id}.jpg" title="{users._id}">
              </div>
            </td>
            <td class="first-name">{users.firstName}</td>
            <td class="last-name">{users.lastName}</td>
            <td class="role">[[global:{users.role}_user]]</td>
            <td class="actions">
              <a href="#modal-edit-user" class="edit-user button" data-user-id="{users._id}" data-open-modal><span
                class="fa fa-edit"></span> [[global:edit]] </a>
              <a href="#modal-delete-user" class="remove-user button danger" data-user-id="{users._id}"
                 data-first-name="{users.firstName}" data-on-modal-open-event="prepareDeleteUserModal" data-open-modal><span
                class="fa fa-trash-o"></span> [[global:delete]]</a>
            </td>
          </tr>
          <!-- END users -->
          </tbody>
        </table>
        <div class="help-text" data-help-text-title="[[global:help]]">
          [[settings:user_management.help_text, [[global:admin_users]], [[global:normal_users]]]]
        </div>
        <div class="user-actions">
          <a href="#modal-create-user" class="create-user button" data-open-modal><span
            class="fa fa-user-plus"></span> [[global:do_create]]</a>
          <a href="#modal-invite-user" class="invite-user button" data-open-modal><span
            class="fa fa-paper-plane"></span> [[users:invite]]</a>
        </div>
      </li>
    </ul>
  </section>
</article>
<div id="modal-create-user" class="hidden">
  <div class="modal-content-wrapper modal-create-user-wrapper">
    <header class="modal-header">
      <h2>[[settings:user_management.create_user]]</h2>
    </header>
    <section class="modal-body">
      <p>[[settings:user_management.create_user.help_text]]</p>

      <label for="new-first-name">[[users:first_name]]</label>
      <input id="new-first-name" type="text">

      <label for="new-last-name">[[users:last_name]]</label>
      <input id="new-last-name" type="text">

      <label for="new-role">[[users:role]]</label>
      <select id="new-role">
        <option value="admin">[[global:admin_user]]</option>
        <option value="normal" selected>[[global:normal_user]]</option>
      </select>

      <label for="new-username">[[users:username]]</label>
      <input type="text" id="new-username">

      <label for="new-password">[[users:password]]</label>
      <input type="password" id="new-password">

      <label for="new-email">[[users:email_address]]</label>
      <input type="email" id="new-email">

      <label for="new-language">[[settings:language]]</label>
      <select id="new-language">
        <option value="de_DE" selected>[[settings:language.de_DE]]</option>
        <option value="en_US">[[settings:language.en_US]]</option>
      </select>

      <div class="actions">
        <button type="button" class="create-user"><span class="fa fa-user-plus"></span> [[users:create]]</button>
        <button type="button" class="cancel" data-close-modal><span class="fa fa-times"></span> [[global:cancel]]
        </button>
      </div>
    </section>
  </div>
</div>
<div id="modal-edit-user" class="hidden">
  <div class="modal-content-wrapper modal-invite-user-wrapper">
    <header class="modal-header">
      <h2>[[settings:user_management.edit_user]]</h2>
    </header>
    <section class="modal-body">
      <p>[[settings:user_management.edit_user.help_text]]</p>

      <label for="modified-first-name">[[users:first_name]]</label>
      <input id="modified-first-name" type="text">

      <label for="modified-last-name">[[users:last_name]]</label>
      <input id="modified-last-name" type="text">

      <label for="modified-role">[[users:role]]</label>
      <select id="modified-role">
        <option value="admin">[[global:admin_user]]</option>
        <option value="normal">[[global:normal_user]]</option>
      </select>

      <label for="modified-username">[[users:username]]</label>
      <input type="text" id="modified-username">

      <label for="modified-password">[[users:new_password]]</label>
      <input type="password" id="modified-password">

      <label for="modified-email">[[users:email_address]]</label>
      <input type="email" id="modified-email">

      <label for="modified-language">[[settings:language]]</label>
      <select id="modified-language">
        <option value="de_DE" selected>[[settings:language.de_DE]]</option>
        <option value="en_US">[[settings:language.en_US]]</option>
      </select>

      <div class="actions">
        <button type="button" class="save-user"><span class="fa fa-save"></span> [[global:do_save]]</button>
        <button type="button" class="cancel" data-close-modal><span class="fa fa-times"></span> [[global:cancel]]
        </button>
      </div>
    </section>
  </div>
</div>
<div id="modal-delete-user" class="hidden">
  <div class="modal-content-wrapper dialog-delete-user-wrapper dialog-warning">
    <header class="modal-header">
      <h2>[[settings:user_management.delete_user]]</h2>
    </header>
    <section class="modal-body">
      <span class="dialog-message">[[settings:user_management.warning_delete_user]]</span>
      <div class="actions">
        <button type="button" class="delete-user danger"><span class="fa fa-trash-o"></span> [[global:delete]]</button>
        <button type="button" class="cancel" data-close-modal><span class="fa fa-times"></span> [[global:cancel]]
        </button>
      </div>
    </section>
  </div>
</div>
<div id="modal-invite-user" class="hidden">
  <div class="modal-content-wrapper modal-invite-user-wrapper">
    <header class="modal-header">
      <h2>[[users:invite]]</h2>
    </header>
    <section class="modal-body">
      <p>[[settings:user_management.invite.help_text]]</p>
      <label for="invite-email-address">E-Mail-Adresse</label>
      <input type="email" id="invite-email-address">
      <button type="button" class="send-invite"><span class="fa fa-paper-plane"></span> [[users:invite]]</button>
    </section>
  </div>
</div>
<!-- IMPORT partials/footer.tpl -->
