# Flatm8 [![Dependencies](https://david-dm.org/Radiergummi/WG-Abrechnung.svg)](https://david-dm.org/Radiergummi/WG-Abrechnung)
Personal project to organize monthly grocery spending with my flatmates.  
This is just a simple web app that allows you to upload grocery receipts, assign them tags and a sum, and create a split bill at the end of the month.  
That way, everyone pays the same amount and you get some neat stats about your monthly spending.

## About
This is a project intended to ease the way me and the people I'm sharing a flat with calculate their share in our monthly grocery shopping calculation. Up until now, we just went through all the receipts at the end of the month, while those having spent less than the others paid their difference. Obviously, this is a time consuming activity, so we thought *how could we possibly nerd the hell out of this?*

## Installation

    # Clone the repository
    git clone https://github.com/Radiergummi/WG-Abrechnung
    
    # Switch the directory
    cd WG-Abrechnung
    
    # Install dependencies
    npm install
    
    # Start flatm8
    ./flatm8 start

Navigate to `http://localhost:3000`.

## Current state
~~Apart from the base structure and working Mongo models as well as a functioning login system, there is not much to do yet. I'm actively working on this, though, so I'd expect an example implementation up and running in about a month.  
Language is german right now, though most of the strings are in the view files - you should have no problem modifying these.~~

*Update 2016/08/01:* Much has changed over the last course of weeks! Dynamic data loading as well as a proper translation system has been implemented. A server-side statistics API is in the making, the mailer is set up and working (both local and relay works) and cron job handling (for monthly calculations and so on) works using [agenda](https://github.com/rschmukler/agenda). More to come.

*Update 2016/08/16:* Localization is finally working - flatm8 can be completely translated using JSON translation files. The module works on both server as well as client side. I will put a complete documentation in the wiki pages as soon as I'm ready.

*Update 2016/08/22:* In the mean time, I built a settings page for both global and user specific settings (depending on the users role) including full CRUD user management with an invitation system to add new users via expiring invitation tokens. Additionally, the clientside framework has received a lot of love: there are toast notifications and try-catch abstractions to prevent uncaught exceptions, even for event callbacks. There is a HTTP request abstraction layer that uses the fetch API if available or falls back to XHR; and lastly I included a globally available (`app.debug()`) function that works like the server side debug module.

*Update 2016/08/30:* Clientside scripts have been modified to use webpack. That way, using `require()` to load dependencies is possible, as well as asset minification and proper code splitting. No more async load timing issues, awkward dependency hacks and single script files for each page. Maybe I should also implement clientside routing, webpack has a pretty convenient chunk loading API... Another bullet point is converting the code to ES6 and using babel to translate it for clients.

Once the current way of handling receipts works, I'm planning to integrate OCR (using tesseract, maybe) somehow, so the receipts get parsed automatically. That would eliminate the need to enter the sum manually and allow to create detailed product statistics. As far as I've seen, though, that is a non-trivial task which'd require some serious engineering.  

## ToDo-List
- [x] set up express base
- [x] translate processes in models
- [x] set up login system
- [x] implement socket.io
- [ ] build REST API routes for socket.io methods
- [x] make invoice-tag relationship work
- [x] set up invoice tagging
- [ ] set up manual invoice sum modification
- [x] set up invoice creation and upload
- [ ] enable siofu image upload
- [ ] set up input validation
- [ ] handle input errors gracefully
- [x] set up admin routes (user management)
- [ ] develop the core algorithms for the calculations
- [ ] set up monthly statements
- [ ] set up gifting, negative invoices (for private product shopping etc.)
- [x] implement statistics generation and rendering
- [x] set up mail server with payment notifications
- [ ] set up tests
- [ ] set up PayPal.me integration for instant payments
- [ ] ... more to come

## Routes
So far, there are view routes implemented. I'll try to describe the existing here.

### Dashboard
- `/dashboard` - Home page after login. Shows the five first own invoices for the current month
  and the current cummulated sum until now as well as a diagram

### Invoices
- `/invoices` - Shows all invoices in descending order (by date)
- `/invoices/current` - Shows all invoices for this month in descending order (by date)
- `/invoices/:year` - Shows all invoices for a given year
- `/invoices/:year/:month` - Shows all invoices for a given month of a given year
- `/invoices/:year/:month/:day` - Shows all invoices for a given day of a given month of a given year
- `/invoices/create` - Allows to create a new invoice
- `/invoices/remove` - Allows to remove an existing invoice
- `/invoices/refund` - Allows to create a refund pseudo invoice

### Statistics
- `/statistics` - Shows a compilation of multiple statistics
- `/statistics/current` - Shows statistics for the current month
- `/statistics/:year` - Shows all statistics for a given year
- `/statistics/:year/:month` - Shows all statistics for a given month of a given year
- `/statistics/:year/:month/:day` - Shows all statistics for a given day of a given month of a given year

### Balance
- `/balance` - Shows the current balance page with the users balance

### Admin
- `/admin` - Shows the admin panel
- `/admin/users` - Shows the user management
- `/admin/invoices` - Shows the invoice management
- `/admin/tags` - Shows the tag management
- `/admin/config` - Shows the general configuration page


# API
The following document describes the flatm8 API (*as planned*). Currently, I don't really use REST methods due to socket.io being somewhat easier to use, though I'd like to use the REST API for client-initiated requests and socket.io for server-side pushing, as in streaming modified/new data or pushing notifications to clients.  
All endpoints will return JSON objects (*even though I may implement a config setting to allow setting the API data type*). If requests fail due to client errors (eg. the response has a `4xx` error code), they will contain an error object like this:

````json
{
  "error": {
    "status": <status code>,
    "reason": "<error category, eg. 'authentication' or 'invalid'>",
    "message": {
      "raw": "<error message in english intended for developers>",
      "translation": "<friendly error message translation key>"
    }
  }
}
````

The API URI prefix is defined in the configuration and defaults to `/api/v1` where `v1` indicates API version 1.

## Endpoints
**Bold endpoints** will require authentication.

| method | URI                           | description                       | possible responses                                                                |
|:------:|-------------------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| GET    | `/`                           | lists available endpoints         | `200`: list of endpoints                                                          |


### Invoices endpoints
| method | URI                           | description                       | possible responses                                                                |
|:------:|-------------------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| GET    | `/invoices`                   | lists all invoices                | `200`: list of invoices                                                           |
| POST   | `/invoices`                   | creates a new invoice             | `201`: created, Location points to new invoice<br>`400`: invalid data             |
| GET    | `/invoices/:invoice-id`       | returns a specific invoice        | `200`: invoice data<br>`404`: no such invoice<br>`400`: invalid ID                |
| PUT    | `/invoices/:invoice-id`       | updates an existing invoice       | `204`: invoice was updated<br>`404`: no such invoice<br>`400`: invalid data       |
| DELETE | `/invoices/:invoice-id`       | deletes an existing invoice       | `204`: invoice was deleted<br>`404`: no such invoice                              |
| GET    | `/invoices/:year`             | lists all invoices from date      | `200`: list of invoices from `year`<br>`400`: invalid date                        |
| DELETE | `/invoices/:year`             | deletes all invoices from date    | `204`: invoices were deleted<br>`400`: invalid date                               |
| GET    | `/invoices/:year/:month`      | lists all invoices from date      | `200`: list of invoices from `year/month`<br>`400`: invalid date                  |
| DELETE | `/invoices/:year/:month`      | deletes all invoices from date    | `204`: invoices were deleted<br>`400`: invalid date                               |
| GET    | `/invoices/:year/:month/:day` | lists all invoices from date      | `200`: list of invoices from `year/month/day`<br>`400`: invalid date              |
| DELETE | `/invoices/:year/:month/:day` | deletes all invoices from date    | `204`: invoices were deleted<br>`400`: invalid date                               |


### Users endpoints
| method | URI                           | description                       | possible responses                                                                |
|:------:|-------------------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| GET    | `/users`                      | lists all users                   | `200`: list of users                                                              |
| POST   | `/users`                      | creates a new user                | `201`: created, Location points to new user<br>`400`: invalid data                |
| GET    | `/users:user-id`              | returns a specific user           | `200`: user data<br>`404`: no such user<br>`400`: invalid ID                      |
| PUT    | `/users/:user-id`             | updates an existing user          | `204`: user was updated<br>`404`: no such user<br>`400`: invalid data             |
| DELETE | `/users/:user-id`             | deletes an existing user          | `204`: user was deleted<br>`404`: no such user                                    |
| GET    | `/users/:user-id/invoices`    | returns a specific users invoices | `200`: user invoice data<br>`404`: no such user<br>`400`: invalid ID              |
| DELETE | `/users/:user-id/invoices`    | deletes all invoices of a user    | `204`: invoices were deleted<br>`404`: no such user                               |


### Invitations endpoints
| method | URI                           | description                       | possible responses                                                                |
|:------:|-------------------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| GET    | `/invitations`                | lists all invitations             | `200`: list of invitations                                                        |
| DELETE | `/invitations`                | deletes all invitations           | `204`: invitations were deleted                                                   |
| POST   | `/invitations`                | creates a new invitation          | `201`: created, Location points to new invitation<br>`400`: invalid data          |
| GET    | `/invitations/:invitation-id` | returns a specific invitation     | `200`: invitation data<br>`404`: no such invitation<br>`400`: invalid ID          |
| PUT    | `/invitations/:invitation-id` | updates an existing invitation    | `204`: invitation was updated<br>`404`: no such invitation<br>`400`: invalid data |
| DELETE | `/invitations/:invitation-id` | deletes an existing invitation    | `204`: invitation was deleted<br>`404`: no such invitation                        |

### Tags endpoints
| method | URI                           | description                       | possible responses                                                                |
|:------:|-------------------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| GET    | `/tags`                       | lists all tags                    | `200`: list of tags                                                               |
| POST   | `/tags`                       | creates a new tag                 | `201`: created, Location points to new tag<br>`400`: invalid data                 |
| GET    | `/tags:tag-id`                | returns a specific tag            | `200`: tag data<br>`404`: no such tag<br>`400`: invalid ID                        |
| PUT    | `/tags/:tag-id`               | updates an existing tag           | `204`: tag was updated<br>`404`: no such tag<br>`400`: invalid data               |
| DELETE | `/tags/:tag-id`               | deletes an existing tag           | `204`: tag was deleted<br>`404`: no such tag                                      |
| GET    | `/tags/:tag-id/invoices`      | returns all invoices with a tag   | `200`: tagged invoices<br>`404`: no such tag<br>`400`: invalid ID                 |
| DELETE | `/tags/:tag-id/invoices`      | deletes all invoices with a tag   | `204`: invoices were deleted<br>`404`: no such tag                                |


#### User endpoints
| method | URI                           | description                       | possible responses                                                                |
|:------:|-------------------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| GET    | `/user`                       | returns the current user          | `200`: user data<br>`401`: Not logged in                                          |
| PUT    | `/user/picture`               | uploads a new user picture        | `204`: image uploaded<br>`401`: Not logged in<br>`400`: validation error          |
| DELETE | `/user/picture`               | deletes the user picture          | `204`: image deleted<br>`401`: Not logged in<br>`404`: no image uploaded          |



