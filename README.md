# Yuzu Kitchen 柚子

A multi-page responsive website for **Yuzu Kitchen**, a (fictional) coastal Japanese restaurant in Astana.

- **Live site:** https://assingmentsaitu.github.io/WEBrestaurant/
- **Repository:** https://github.com/assingmentsaitu/WEBrestaurant
- **Team:** Alizhan Rymkhan, Adilbek Shangerey, Yerassyl Gabbas

**Purpose and audience:** people in Astana looking for a place to eat. They can browse the menu, book a table
online, keep their bookings and favourite dishes in an account, and cook Asian recipes at home.

## Pages (10)

| Page | What it does |
|---|---|
| `index.html` | Home: hero, feature cards, animated stats, promo code, star rating, booking modal |
| `about.html` | Story, beliefs, head chef, FAQ with search highlighting, opening hours with live "open now" badge |
| `dishes.html` | Food menu with live search, autocomplete, favourites, recent searches, chef's specials |
| `drinks.html` | Drinks menu with the same search and favourites |
| `recipes.html` | Recipes loaded live from **TheMealDB API**: filter by cuisine, search, view details, save |
| `gallery.html` | Photo gallery with lazy-loaded images and hover captions |
| `contact.html` | Booking form and contact details with copy buttons |
| `signup.html` | Create an account (stored in localStorage) |
| `login.html` | Log in; redirects to the profile |
| `profile.html` | User details, reservations, favourite dishes, saved recipes, edit details, change password, log out |

## Folder structure

```
/project-folder
├── index.html, about.html, dishes.html, drinks.html, recipes.html,
│   gallery.html, contact.html, signup.html, login.html, profile.html
├── css/style.css     all styles, split into numbered sections
├── js/theme.js       applies the saved light/dark theme in <head> (no flash)
├── js/script.js      all behaviour, split into numbered sections
└── images/           local photos and the favicon
```

## How each requirement is met

| Requirement | Where |
|---|---|
| **Responsiveness** | CSS Grid + Flexbox; breakpoints at 1100, 1000, 768 and 480 px; hamburger menu under 1000 px (`style.css` §19) |
| **Hosting** | GitHub Pages (links above); all internal links are relative |
| **Light / dark mode** | Switch in the header (`role="switch"`); choice saved in `localStorage` (`yuzuTheme`) and applied on every page by `js/theme.js` before the page is drawn |
| **Design & UX** | One colour system with tokens for both themes, BJCree / Andika / brush-script fonts, Font Awesome icons, consistent cards, buttons and spacing |
| **5.1 Authentication** | Sign up saves `{name, email, phone, password}`; log in checks them and redirects to `profile.html`; the profile shows the stored details (`script.js` §7–8) |
| **5.2 Validation** | Every form has `novalidate` and no HTML validation attributes. JavaScript checks required fields, email format, password length + complexity (with a live checklist), Kazakhstan phone pattern, matching passwords and booking date/time. Errors appear under each field (`script.js` §5) |
| **5.3 Search / filter** | Live menu filter + autocomplete; favourites filter; recent searches, favourites, saved recipes and the last recipe view are saved in `localStorage` |
| **Animations** | Button lift/shadow, arrow and icon motion, nav underline, card and image zoom, heart "pop", spinning theme-switch icon, skeleton loading, modal pop-in; `prefers-reduced-motion` respected |
| **External API** | [TheMealDB](https://www.themealdb.com): `fetch` + `async/await`, loading skeleton, friendly error with "Try again", 10 s timeout (`script.js` §10) |

## localStorage keys

`yuzuTheme`, `yuzuUsers`, `yuzuSession`, `yuzuBookings`, `yuzuFavorites`, `yuzuRecentSearches`,
`yuzuSavedRecipes`, `yuzuRecipePrefs`, `yuzuRating`

> Authentication is a front-end simulation for the course. Passwords are kept in the browser,
> which a real website must never do; a real site would use a server and store only password hashes.

## Run locally

Open `index.html` in a browser, or serve the folder (e.g. the VS Code Live Server extension).
