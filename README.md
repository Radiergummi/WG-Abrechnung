# Flatm8
Personal project to organize monthly grocery spending with my flatmates.  
This is just a simple web app that allows you to upload grocery receipts, assign them tags and a sum, and create a split bill at the end of the month.  
That way, everyone pays the same amount and you get some neat stats about your monthly spending.

## About
This is a project intended to ease the way me and the people I'm sharing a flat with calculate their share in our monthly grocery shopping calculation. Up until now, we just went through all the receipts at the end of the month, while those having spent less than the others paid their difference. Obviously, this is a time consuming activity, so we thought *how could we possibly nerd the hell out of this?*

## Current state
Apart from the base structure and working Mongo models as well as a functioning login system, there is not much to do yet. I'm actively working on this, though, so I'd expect an example implementation up and running in about a month.  
Language is german right now, though most of the strings are in the view files - you should have no problem modifying these.

Once the current way of handling receipts works, I'm planning to integrate OCR (using tesseract, maybe) somehow, so the receipts get parsed automatically. That would eliminate the need to enter the sum manually and allow to create detailed product statistics. As far as I've seen, though, that is a non-trivial task which'd require some serious engineering.  

## ToDo-List
- [x] set up express base
- [x] translate processes in models
- [x] set up login system
- [x] implement socket.io
- [x] make invoice-tag relationship work
- [x] set up invoice tagging
- [ ] set up manual invoice sum modification
- [ ] set up invoice creation and upload
- [ ] enable siofu image upload
- [ ] set up admin routes (user management)
- [ ] develop the core algorithms for the calculations
- [ ] set up monthly statements
- [ ] set up gifting, negative invoices (for private product shopping etc.)
- [ ] implement statistics generation and rendering
- [ ] set up mail server with payment notifications
- [ ] set up tests
- [ ] set up PayPal.me integration for instant payments
- [ ] ... more to come

## Routes
So far, there are view routes implemented. I'll try to describe the existing here.

### Dashboard
- `/dashboard` - Home page after login. Shows the five first own invoices for the current month
  and the current cumulated sum until now as well as a diagram

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
