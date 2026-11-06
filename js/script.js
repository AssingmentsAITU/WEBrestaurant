/* =====================================================================
   Yuzu Kitchen — main script (uses jQuery 4, loaded in <head>)
   ---------------------------------------------------------------------
   1.  Storage helpers and shared data
   2.  Small helpers: escaping, toasts, modals, dates
   3.  Header: mobile menu, current page, account link, arrow keys
   4.  Light / dark theme switch
   5.  Form validation (used by every form on the site)
   6.  Booking form (Main page modal + Contact page)
   7.  Authentication: sign up and log in
   8.  Profile page
   9.  Menu pages: live search, autocomplete, recent searches, favourites
   10. Recipes page: TheMealDB API
   11. About page: opening hours, clock, FAQ accordion, FAQ highlighting
   12. Main page: greeting, rating, animated counters
   13. Site-wide widgets: scroll ring, copy buttons, lazy images, sound
   14. Start-up: run everything once the page is ready
   ===================================================================== */
"use strict";


/* =====================================================================
   1. Storage helpers and shared data
   ===================================================================== */

// Every localStorage key the site uses, in one place
const STORAGE_KEYS = {
    theme: "yuzuTheme",                    // "light" or "dark"
    users: "yuzuUsers",                    // array of registered users
    session: "yuzuSession",                // email of the logged-in user
    bookings: "yuzuBookings",              // array of table reservations
    favorites: "yuzuFavorites",            // dishes / drinks saved with the heart button
    recentSearches: "yuzuRecentSearches",  // { dishes: [...], drinks: [...] }
    savedRecipes: "yuzuSavedRecipes",      // recipes saved from the API
    recipePrefs: "yuzuRecipePrefs",        // last cuisine / search on the Recipes page
    rating: "yuzuRating"                   // the guest's star rating
};

// Read a JSON value from localStorage. Returns `fallback` if it is missing or broken.
function loadData(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}

// Save any value as JSON. Returns false if the browser refused (e.g. storage full).
function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn("Could not save to localStorage:", error);
        return false;
    }
}

function removeData(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        /* nothing to do */
    }
}

// A one-time message that survives a page redirect (e.g. "Account created!").
// sessionStorage is used so it disappears when the tab is closed.
function setFlashMessage(type, text) {
    try {
        sessionStorage.setItem("yuzuFlash", JSON.stringify({ type: type, text: text }));
    } catch (error) {
        /* nothing to do */
    }
}

function takeFlashMessage() {
    try {
        const raw = sessionStorage.getItem("yuzuFlash");
        sessionStorage.removeItem("yuzuFlash");
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

/* ----- Users (authentication is simulated with localStorage) ----- */
// NOTE: this is a front-end simulation for the course. A real website would
// send passwords to a server and store only a secure hash, never in the browser.

function getUsers() {
    return loadData(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
    saveData(STORAGE_KEYS.users, users);
}

function findUserByEmail(email) {
    const wanted = String(email).trim().toLowerCase();
    return getUsers().find(function (user) {
        return user.email === wanted;
    }) || null;
}

function getCurrentUser() {
    const email = loadData(STORAGE_KEYS.session, null);
    return email ? findUserByEmail(email) : null;
}

function getFirstName(name) {
    return String(name).trim().split(/\s+/)[0];
}

// "Aigerim Sultanova" -> "AS"
function getInitials(name) {
    return String(name).trim().split(/\s+/).slice(0, 2).map(function (part) {
        return part.charAt(0).toUpperCase();
    }).join("");
}

/* ----- Favourites and saved recipes ----- */

function getFavorites() {
    return loadData(STORAGE_KEYS.favorites, []);
}

function getSavedRecipes() {
    return loadData(STORAGE_KEYS.savedRecipes, []);
}

function getBookingsFor(email) {
    return loadData(STORAGE_KEYS.bookings, []).filter(function (booking) {
        return booking.userEmail === email;
    });
}

/* ----- Labels used when showing bookings ----- */
const HALL_NAMES = { main: "Main Hall", terrace: "Summer Terrace", vip: "VIP Room" };
const TABLE_NAMES = { "2_persons": "Table for two", "4_persons": "Table for four", large: "Big company" };


/* =====================================================================
   2. Small helpers
   ===================================================================== */

// Make user text safe to use inside a RegExp ("(" or "." lose their special meaning)
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Make user text safe to put inside .html() ("<" becomes "&lt;" and so on)
function escapeHtml(text) {
    return $("<div>").text(text).html();
}

// "2026-11-14" -> "Fri, 14 Nov 2026"
function formatDate(isoDate) {
    const date = new Date(isoDate + "T00:00:00");
    return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// Toast notification. Usage: showToast("Saved!", "success" | "info" | "error")
function showToast(message, type, duration) {
    type = type || "success";
    duration = duration || 3000;
    const icons = { success: "fa-circle-check", info: "fa-circle-info", error: "fa-circle-exclamation" };

    let $container = $("#toast-container");
    if ($container.length === 0) {
        $container = $('<div id="toast-container" role="status" aria-live="polite"></div>').appendTo("body");
    }

    const $toast = $('<div class="toast"></div>')
        .addClass("toast-" + type)
        .append($('<i class="toast-icon fa-solid" aria-hidden="true"></i>').addClass(icons[type] || icons.info))
        .append($("<span></span>").text(message));

    $toast.appendTo($container)
        .fadeIn(300)
        .delay(duration)
        .fadeOut(600, function () {
            $(this).remove();
        });
}

// Show a message box inside a form (errors that are not tied to one field)
function showFormAlert($alert, type, message) {
    const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-circle-info" };
    $alert
        .removeClass("is-error is-success is-info")
        .addClass("is-visible is-" + type)
        .empty()
        .append($('<i class="fa-solid" aria-hidden="true"></i>').addClass(icons[type]))
        .append($("<span></span>").text(message));
}

function hideFormAlert($alert) {
    $alert.removeClass("is-visible is-error is-success is-info").empty();
}

/* ----- Modals (booking form, recipe details) ----- */
let lastFocusedElement = null;

function openModal($modal) {
    lastFocusedElement = document.activeElement;
    $modal.addClass("active").attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    // Move keyboard focus into the dialog
    setTimeout(function () {
        $modal.find(".close-btn").trigger("focus");
    }, 50);
}

function closeModal($modal) {
    $modal.removeClass("active").attr("aria-hidden", "true");
    if ($(".modal-overlay.active").length === 0) {
        $("body").removeClass("modal-open");
    }
    $modal.trigger("modal:closed");
    // Return focus to the button that opened the dialog
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function initModals() {
    // Any button with data-open-modal="some-id" opens that modal
    $(document).on("click", "[data-open-modal]", function (event) {
        event.preventDefault();
        openModal($("#" + $(this).data("open-modal")));
    });

    $(document).on("click", ".modal-overlay .close-btn", function () {
        closeModal($(this).closest(".modal-overlay"));
    });

    // Click on the dark background closes the modal
    $(document).on("click", ".modal-overlay", function (event) {
        if (event.target === this) {
            closeModal($(this));
        }
    });

    $(document).on("keydown", function (event) {
        const $open = $(".modal-overlay.active");
        if (event.key === "Escape" && $open.length) {
            closeModal($open.last());
        }
    });
}


/* =====================================================================
   3. Header: mobile menu, current page, account link, arrow keys
   ===================================================================== */

// "Log In" when logged out, "<first name>" (link to the profile) when logged in
function updateAccountLink() {
    const user = getCurrentUser();
    const $link = $("#nav-account");

    if (user) {
        $link.attr({ href: "profile.html", "aria-label": "My profile" })
            .html('<i class="fa-solid fa-circle-user" aria-hidden="true"></i> ')
            .append(document.createTextNode(getFirstName(user.name)));
    } else {
        $link.attr("href", "login.html").removeAttr("aria-label")
            .html('<i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Log In');
    }
}

function initHeader() {
    const $header = $("#main-header");
    const $toggle = $("#nav-toggle");

    updateAccountLink();

    // Underline the link of the page we are on
    const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    $(".main-nav a").each(function () {
        if (String($(this).attr("href")).toLowerCase() === currentPage) {
            $(this).attr("aria-current", "page");
        }
    });

    // Hamburger menu on small screens
    function setMenu(open) {
        $header.toggleClass("nav-open", open);
        $toggle.attr({ "aria-expanded": String(open), "aria-label": open ? "Close menu" : "Open menu" });
    }

    $toggle.on("click", function () {
        setMenu(!$header.hasClass("nav-open"));
    });

    $(".main-nav a").on("click", function () {
        setMenu(false);
    });

    $(document).on("click", function (event) {
        if (!$(event.target).closest("#main-header").length) {
            setMenu(false);
        }
    });

    $(document).on("keydown", function (event) {
        if (event.key === "Escape" && $header.hasClass("nav-open")) {
            setMenu(false);
            $toggle.trigger("focus");
        }
    });

    $(window).on("resize", function () {
        if (window.innerWidth > 1000) {
            setMenu(false);
        }
    });

    // Left / right arrow keys move between header links (from Assignment 5)
    $(document).on("keydown", function (event) {
        const $items = $(".main-nav a, #theme-switch");
        const index = $items.index(document.activeElement);
        if (index === -1) return;

        if (event.key === "ArrowRight") {
            event.preventDefault();
            $items.eq((index + 1) % $items.length).trigger("focus");
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            $items.eq((index - 1 + $items.length) % $items.length).trigger("focus");
        }
    });
}


/* =====================================================================
   4. Light / dark theme switch
   ---------------------------------------------------------------------
   js/theme.js applies the saved theme in <head> (no flash).
   This part handles the switch button and saves the choice.
   ===================================================================== */
function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function initThemeSwitch() {
    const $switch = $("#theme-switch");

    function render() {
        const isDark = getTheme() === "dark";
        $switch.attr("aria-checked", String(isDark));
        $switch.find(".theme-switch-thumb i").attr("class", isDark ? "fa-solid fa-moon" : "fa-solid fa-sun");
    }

    $switch.on("click", function () {
        const next = getTheme() === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);

        // Save the choice so every page opens in the same mode
        try {
            localStorage.setItem(STORAGE_KEYS.theme, next);
            localStorage.removeItem("userThemeIndex"); // old key from Assignment 5
        } catch (error) {
            /* the theme still changes for this page */
        }

        render();
        showToast(next === "dark" ? "Dark mode on" : "Light mode on", "info", 1800);
    });

    // If the theme is changed in another tab, follow it here too
    $(window).on("storage", function (event) {
        if (event.originalEvent.key === STORAGE_KEYS.theme && event.originalEvent.newValue) {
            document.documentElement.setAttribute("data-theme", event.originalEvent.newValue);
            render();
        }
    });

    render();
}


/* =====================================================================
   5. Form validation
   ---------------------------------------------------------------------
   Forms use `novalidate`, so the browser's own checks are off and this
   code does all the validation. Each field lists its rules in a
   data attribute, for example:
       <input id="signup-email" data-validate="required email">
   Errors are shown under the field (not in alert boxes).
   ===================================================================== */
const PATTERNS = {
    // Letters from any alphabet (Latin, Cyrillic, Kazakh...), spaces, ' and -
    name: /^\p{L}[\p{L}' -]{1,39}$/u,
    // something@something.domain
    email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
    // Kazakhstan numbers: +7 701 234 56 78, 8 (701) 234-56-78, +77012345678 ...
    phone: /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/
};

// Password complexity rules (also shown as a live checklist on the forms)
const PASSWORD_RULES = [
    { key: "length", label: "8+ characters", test: function (v) { return v.length >= 8; } },
    { key: "upper", label: "an uppercase letter", test: function (v) { return /[A-Z]/.test(v); } },
    { key: "lower", label: "a lowercase letter", test: function (v) { return /[a-z]/.test(v); } },
    { key: "number", label: "a number", test: function (v) { return /\d/.test(v); } },
    { key: "symbol", label: "a symbol (! @ # ...)", test: function (v) { return /[^A-Za-z0-9\s]/.test(v); } }
];

// Each rule returns true when the value is fine, or an error message
const VALIDATORS = {
    required: function (value, $field) {
        if (value !== "") return true;
        if ($field.data("required-message")) return $field.data("required-message");
        return $field.is("select") ? "Please choose an option." : "This field is required.";
    },

    name: function (value) {
        return PATTERNS.name.test(value) || "Please use 2–40 letters (spaces, hyphens and apostrophes are fine).";
    },

    email: function (value) {
        return PATTERNS.email.test(value) || "Please enter a valid email address, like name@example.com.";
    },

    phone: function (value) {
        return PATTERNS.phone.test(value) || "Please enter a phone number like +7 701 234 56 78.";
    },

    password: function (value) {
        const missing = PASSWORD_RULES.filter(function (rule) {
            return !rule.test(value);
        }).map(function (rule) {
            return rule.label;
        });
        return missing.length === 0 || "Your password still needs " + missing.join(", ") + ".";
    },

    minLength: function (value, $field) {
        const min = Number($field.data("min-length"));
        return value.length >= min || "Please enter at least " + min + " characters.";
    },

    maxLength: function (value, $field) {
        const max = Number($field.data("max-length"));
        return value.length <= max || "Please keep this under " + max + " characters (you have " + value.length + ").";
    },

    // "Confirm password" must equal the field named in data-matches
    matches: function (value, $field) {
        return value === $("#" + $field.data("matches")).val() || "The passwords do not match.";
    },

    // Booking date: today or later, at most 60 days ahead
    bookingDate: function (value) {
        const chosen = new Date(value + "T00:00:00");
        if (isNaN(chosen.getTime())) return "Please choose a valid date.";

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastDay = new Date(today);
        lastDay.setDate(lastDay.getDate() + 60);

        if (chosen < today) return "This date has already passed. Please choose today or a later day.";
        if (chosen > lastDay) return "We take bookings up to 60 days ahead.";
        return true;
    },

    // Booking time: if the date is today, the time must still be ahead
    bookingTime: function (value, $field) {
        const dateValue = $("#" + $field.data("date-field")).val();
        if (!dateValue) return true;
        const slot = new Date(dateValue + "T" + value);
        return slot > new Date() || "This time has already passed today. Please pick a later time.";
    }
};

// Password fields keep spaces exactly as typed; everything else is trimmed
function getFieldValue($field) {
    const value = String($field.val() === null || $field.val() === undefined ? "" : $field.val());
    return $field.hasClass("password-input") ? value : value.trim();
}

function showFieldError($field, message) {
    const errorId = $field.attr("id") + "-error";
    let $error = $("#" + errorId);

    if (!$error.length) {
        $error = $('<p class="field-error"></p>').attr("id", errorId);
        $field.closest(".form-group").append($error);
    }
    $error.text(message);

    // Remember the field's own hint so screen readers read hint + error
    if ($field.data("hint-ids") === undefined) {
        $field.data("hint-ids", $field.attr("aria-describedby") || "");
    }

    $field.addClass("input-error").removeClass("input-valid").attr({
        "aria-invalid": "true",
        "aria-describedby": ($field.data("hint-ids") + " " + errorId).trim()
    });
}

function clearFieldError($field) {
    $("#" + $field.attr("id") + "-error").remove();
    $field.removeClass("input-error").removeAttr("aria-invalid");

    if ($field.data("hint-ids") !== undefined) {
        const hints = $field.data("hint-ids");
        if (hints) {
            $field.attr("aria-describedby", hints);
        } else {
            $field.removeAttr("aria-describedby");
        }
    }
}

// Check one field against all of its rules. Returns true if it is valid.
function validateField($field) {
    const rules = String($field.data("validate") || "").split(/\s+/).filter(Boolean);
    const value = getFieldValue($field);

    // Optional fields are only checked when something was typed
    if (!rules.includes("required") && value === "") {
        clearFieldError($field);
        $field.removeClass("input-valid");
        return true;
    }

    for (const rule of rules) {
        const result = VALIDATORS[rule](value, $field);
        if (result !== true) {
            showFieldError($field, result);
            return false;
        }
    }

    clearFieldError($field);
    $field.addClass("input-valid");
    return true;
}

// Check every field of a form; focus the first wrong one
function validateForm($form) {
    let $firstInvalid = null;

    $form.find("[data-validate]").each(function () {
        const $field = $(this);
        if (!validateField($field) && !$firstInvalid) {
            $firstInvalid = $field;
        }
    });

    if ($firstInvalid) {
        $firstInvalid.trigger("focus");
    }
    return $firstInvalid === null;
}

// Re-check fields while the user types, after the first check
function setupLiveValidation($form) {
    $form.attr("novalidate", "novalidate");

    // Leaving a field that has text in it checks it
    $form.on("focusout", "[data-validate]", function () {
        const $field = $(this);
        if (getFieldValue($field) !== "" || $field.hasClass("input-error")) {
            validateField($field);
        }
    });

    // Fields that were already checked update live while typing
    $form.on("input change", "[data-validate]", function () {
        const $field = $(this);
        if ($field.hasClass("input-error") || $field.hasClass("input-valid")) {
            validateField($field);
        }

        // Changing a password re-checks its "confirm password" field
        $form.find('[data-matches="' + this.id + '"]').filter(".input-error, .input-valid").each(function () {
            validateField($(this));
        });

        // Changing the date re-checks the time
        $form.find('[data-date-field="' + this.id + '"]').filter(".input-error, .input-valid").each(function () {
            validateField($(this));
        });
    });
}

function resetForm($form) {
    $form[0].reset();
    $form.find("[data-validate]").each(function () {
        clearFieldError($(this));
        $(this).removeClass("input-valid");
    });
    $form.find(".char-counter").each(updateCharCounter);
    $form.find(".password-rules li").removeClass("is-met");
    $form.find(".strength-meter span").css("width", 0);
}

// "120 / 300" counter under text areas that have data-max-length
function updateCharCounter() {
    const $counter = $(this);
    const $field = $("#" + $counter.data("for"));
    const length = String($field.val()).length;
    const max = Number($field.data("max-length"));
    $counter.text(length + " / " + max).toggleClass("is-over", length > max);
}

// Password checklist, strength bar and the show / hide eye button
function setupFormHelpers() {
    $(".char-counter").each(function () {
        const counter = this;
        $("#" + $(counter).data("for")).on("input", function () {
            updateCharCounter.call(counter);
        });
        updateCharCounter.call(counter);
    });

    $(".password-rules").each(function () {
        const $list = $(this);
        const $input = $("#" + $list.data("for"));
        const $meter = $list.siblings(".strength-meter").find("span");
        const meterColors = ["#B3261E", "#B3261E", "#D9662B", "#E0A526", "#7FA650", "#2E8540"];

        // Build the list from PASSWORD_RULES so the rules live in one place
        $list.empty();
        PASSWORD_RULES.forEach(function (rule) {
            $("<li></li>").attr("data-rule", rule.key).text(rule.label.charAt(0).toUpperCase() + rule.label.slice(1)).appendTo($list);
        });

        $input.on("input", function () {
            const value = $input.val();
            let passed = 0;

            PASSWORD_RULES.forEach(function (rule) {
                const ok = rule.test(value);
                if (ok) passed++;
                $list.find('[data-rule="' + rule.key + '"]').toggleClass("is-met", ok);
            });

            $meter.css({
                width: (passed / PASSWORD_RULES.length) * 100 + "%",
                backgroundColor: meterColors[passed]
            });
        });
    });

    $(".toggle-password").on("click", function () {
        const $input = $(this).siblings("input");
        const show = $input.attr("type") === "password";
        $input.attr("type", show ? "text" : "password");
        $(this).attr("aria-label", show ? "Hide password" : "Show password")
            .find("i").attr("class", show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye");
    });
}


/* =====================================================================
   6. Booking form (Main page modal + Contact page)
   ===================================================================== */

// Simulates sending the form to a server (Assignment 5: async + callback)
function submitFormAsync(formData, callback) {
    setTimeout(function () {
        const isSuccess = true; // pretend the server accepted it
        if (isSuccess) {
            callback(null, "Thank you, " + getFirstName(formData.name) + "! Your table is booked for " +
                formatDate(formData.date) + " at " + formData.time + ".");
        } else {
            callback("Submission failed. Please try again later.", null);
        }
    }, 1500);
}

function initBookingForms() {
    const $forms = $(".booking-form");
    if (!$forms.length) return;

    const user = getCurrentUser();

    // Logged-in guests do not have to type their details again
    function prefill($form) {
        if (!user) return;
        $form.find('[name="name"]').val(user.name);
        $form.find('[name="email"]').val(user.email);
        $form.find('[name="phone"]').val(user.phone);
    }

    $forms.each(function () {
        const $form = $(this);
        const $alert = $form.find(".form-alert");

        setupLiveValidation($form);
        prefill($form);

        $form.on("submit", function (event) {
            event.preventDefault();
            hideFormAlert($alert);

            if (!validateForm($form)) {
                showToast("Please fix the highlighted fields.", "error");
                return;
            }

            const $button = $form.find('button[type="submit"]');
            const originalHtml = $button.html();

            // Loading state: spinner + disabled button (Assignment 6, Task 6)
            $button.prop("disabled", true)
                .html('<span class="spinner" aria-hidden="true"></span> Please wait...');

            const booking = {
                id: Date.now(),
                name: getFieldValue($form.find('[name="name"]')),
                email: getFieldValue($form.find('[name="email"]')).toLowerCase(),
                phone: getFieldValue($form.find('[name="phone"]')),
                date: $form.find('[name="date"]').val(),
                time: $form.find('[name="time"]').val(),
                hall: $form.find('[name="hall"]').val(),
                tableType: $form.find('[name="table_type"]:checked').val(),
                message: getFieldValue($form.find('[name="message"]')),
                userEmail: user ? user.email : null,
                createdAt: new Date().toISOString()
            };

            submitFormAsync(booking, function (error, successMessage) {
                $button.prop("disabled", false).html(originalHtml);

                if (error) {
                    showFormAlert($alert, "error", error);
                    showToast(error, "error");
                    return;
                }

                // Keep the booking so it appears on the guest's profile
                const bookings = loadData(STORAGE_KEYS.bookings, []);
                bookings.push(booking);
                saveData(STORAGE_KEYS.bookings, bookings);

                const extra = user ? " You can see it on your profile." : " Log in next time to keep track of your bookings.";
                showFormAlert($alert, "success", successMessage + extra);
                showToast("Booking confirmed! See you soon, " + getFirstName(booking.name) + ".", "success");

                resetForm($form);
                prefill($form);

                // Inside the modal on the Main page: close it after a moment
                const $modal = $form.closest(".modal-overlay");
                if ($modal.length) {
                    setTimeout(function () {
                        closeModal($modal);
                        hideFormAlert($alert);
                    }, 2500);
                }
            });
        });

        $form.find(".js-clear-form").on("click", function () {
            resetForm($form);
            hideFormAlert($alert);
            showToast("Form cleared", "info", 2000);
        });
    });
}


/* =====================================================================
   7. Authentication: sign up and log in
   ===================================================================== */
function initSignUp() {
    const $form = $("#signup-form");
    if (!$form.length) return;

    // Already logged in? Go straight to the profile
    if (getCurrentUser()) {
        window.location.replace("profile.html");
        return;
    }

    const $alert = $("#signup-alert");
    setupLiveValidation($form);

    $form.on("submit", function (event) {
        event.preventDefault();
        hideFormAlert($alert);

        if (!validateForm($form)) {
            showFormAlert($alert, "error", "Please fix the highlighted fields and try again.");
            return;
        }

        const $email = $("#signup-email");
        const email = getFieldValue($email).toLowerCase();

        // One account per email address
        if (findUserByEmail(email)) {
            showFieldError($email, "An account with this email already exists. Try logging in instead.");
            $email.trigger("focus");
            return;
        }

        const newUser = {
            name: getFieldValue($("#signup-name")),
            email: email,
            phone: getFieldValue($("#signup-phone")),
            password: $("#signup-password").val(),
            createdAt: new Date().toISOString()
        };

        const users = getUsers();
        users.push(newUser);
        saveUsers(users);

        // Show a welcome message on the log-in page and fill in the email there
        setFlashMessage("success", "Welcome, " + getFirstName(newUser.name) + "! Your account is ready. Please log in.");
        try {
            sessionStorage.setItem("yuzuLastEmail", email);
        } catch (error) {
            /* nothing to do */
        }

        $form.find('button[type="submit"]').prop("disabled", true)
            .html('<span class="spinner" aria-hidden="true"></span> Creating account...');
        setTimeout(function () {
            window.location.href = "login.html";
        }, 700);
    });
}

function initLogIn() {
    const $form = $("#login-form");
    if (!$form.length) return;

    if (getCurrentUser()) {
        window.location.replace("profile.html");
        return;
    }

    const $alert = $("#login-alert");

    // Message from the previous page (account created, logged out...)
    const flash = takeFlashMessage();
    if (flash) {
        showFormAlert($alert, flash.type, flash.text);
    }

    try {
        const lastEmail = sessionStorage.getItem("yuzuLastEmail");
        if (lastEmail) {
            $("#login-email").val(lastEmail);
        }
    } catch (error) {
        /* nothing to do */
    }

    setupLiveValidation($form);

    $form.on("submit", function (event) {
        event.preventDefault();
        hideFormAlert($alert);

        if (!validateForm($form)) {
            return;
        }

        const user = findUserByEmail($("#login-email").val());
        const password = $("#login-password").val();

        // Same message for "no such email" and "wrong password", so nobody can
        // find out which emails are registered
        if (!user || user.password !== password) {
            showFormAlert($alert, "error", "The email or password is incorrect. Please try again.");
            $("#login-password").val("").removeClass("input-valid").trigger("focus");
            return;
        }

        // Start the "session" and go to the profile page
        saveData(STORAGE_KEYS.session, user.email);
        setFlashMessage("success", "Welcome back, " + getFirstName(user.name) + "!");
        try {
            sessionStorage.removeItem("yuzuLastEmail");
        } catch (error) {
            /* nothing to do */
        }

        $form.find('button[type="submit"]').prop("disabled", true)
            .html('<span class="spinner" aria-hidden="true"></span> Logging in...');
        setTimeout(function () {
            window.location.href = "profile.html";
        }, 500);
    });
}


/* =====================================================================
   8. Profile page
   ===================================================================== */
function initProfile() {
    if (!$("#profile-page").length) return;

    let user = getCurrentUser();

    // The profile is only for logged-in users
    if (!user) {
        setFlashMessage("info", "Please log in to see your profile.");
        window.location.replace("login.html");
        return;
    }

    const flash = takeFlashMessage();
    if (flash) {
        showToast(flash.text, flash.type);
    }

    /* ----- Draw the page from the stored data ----- */
    function renderProfile() {
        const bookings = getBookingsFor(user.email);
        const favorites = getFavorites();
        const recipes = getSavedRecipes();
        const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

        $("#profile-avatar").text(getInitials(user.name));
        $("#profile-name").text(user.name);
        $("#profile-email").text(user.email);
        $("#profile-phone").text(user.phone);
        $("#profile-since").text("Member since " + memberSince);

        $("#stat-bookings").text(bookings.length);
        $("#stat-favorites").text(favorites.length);
        $("#stat-recipes").text(recipes.length);

        renderBookings(bookings);
        renderFavorites(favorites);
        renderRecipes(recipes);
    }

    function renderBookings(bookings) {
        const $list = $("#booking-list").empty();

        if (!bookings.length) {
            $list.append('<p class="empty-note">No reservations yet. <a href="contact.html">Book a table</a> and it will show up here.</p>');
            return;
        }

        // Soonest first
        bookings.sort(function (a, b) {
            return (a.date + a.time).localeCompare(b.date + b.time);
        });

        bookings.forEach(function (booking) {
            const isPast = new Date(booking.date + "T" + booking.time) < new Date();
            const $item = $('<div class="saved-item"></div>');
            const $text = $('<div class="saved-item-text"></div>')
                .append($("<strong></strong>").text(formatDate(booking.date) + " · " + booking.time + (isPast ? " (past)" : "")))
                .append($("<span></span>").text((HALL_NAMES[booking.hall] || booking.hall) + " · " + (TABLE_NAMES[booking.tableType] || "")));

            $item.append('<i class="fa-solid fa-calendar-check fa-lg" aria-hidden="true"></i>').append($text);
            $('<button type="button" class="btn btn-danger btn-small js-cancel-booking">Cancel</button>')
                .attr({ "data-id": booking.id, "aria-label": "Cancel booking on " + formatDate(booking.date) })
                .appendTo($item);
            $list.append($item);
        });
    }

    function renderFavorites(favorites) {
        const $list = $("#favorite-list").empty();

        if (!favorites.length) {
            $list.append('<p class="empty-note">Tap the heart next to any dish on the <a href="dishes.html">Dishes</a> or <a href="drinks.html">Drinks</a> page to save it here.</p>');
            return;
        }

        favorites.forEach(function (fav) {
            const $item = $('<div class="saved-item"></div>');
            $("<img>").attr({ src: fav.image, alt: "", loading: "lazy" }).appendTo($item);
            $('<div class="saved-item-text"></div>')
                .append($("<strong></strong>").text(fav.name))
                .append($("<span></span>").text((fav.page === "drinks" ? "Drinks" : "Dishes") + " · " + fav.category + (fav.price ? " · " + fav.price : "")))
                .appendTo($item);
            $('<button type="button" class="btn btn-ghost btn-small js-remove-favorite">Remove</button>')
                .attr({ "data-id": fav.id, "aria-label": "Remove " + fav.name + " from favourites" })
                .appendTo($item);
            $list.append($item);
        });
    }

    function renderRecipes(recipes) {
        const $list = $("#recipe-list").empty();

        if (!recipes.length) {
            $list.append('<p class="empty-note">Find something to cook on the <a href="recipes.html">Recipes</a> page and save it with the heart.</p>');
            return;
        }

        recipes.forEach(function (recipe) {
            const $item = $('<div class="saved-item"></div>');
            $("<img>").attr({ src: recipe.thumb + "/small", alt: "", loading: "lazy" }).appendTo($item);
            $('<div class="saved-item-text"></div>')
                .append($("<strong></strong>").text(recipe.name))
                .append($("<span></span>").text(recipe.area + " recipe"))
                .appendTo($item);
            $('<a class="btn btn-ghost btn-small">View</a>')
                .attr("href", "recipes.html#recipe-" + recipe.id)
                .appendTo($item);
            $('<button type="button" class="btn btn-ghost btn-small js-remove-recipe" aria-label="Remove recipe"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>')
                .attr("data-id", recipe.id)
                .appendTo($item);
            $list.append($item);
        });
    }

    /* ----- Buttons inside the lists ----- */
    $("#booking-list").on("click", ".js-cancel-booking", function () {
        if (!window.confirm("Cancel this reservation?")) return;
        const id = Number($(this).data("id"));
        const bookings = loadData(STORAGE_KEYS.bookings, []).filter(function (b) {
            return b.id !== id;
        });
        saveData(STORAGE_KEYS.bookings, bookings);
        renderProfile();
        showToast("Reservation cancelled", "info");
    });

    $("#favorite-list").on("click", ".js-remove-favorite", function () {
        const id = $(this).data("id");
        saveData(STORAGE_KEYS.favorites, getFavorites().filter(function (f) {
            return f.id !== id;
        }));
        renderProfile();
        showToast("Removed from favourites", "info", 2000);
    });

    $("#recipe-list").on("click", ".js-remove-recipe", function () {
        const id = String($(this).data("id"));
        saveData(STORAGE_KEYS.savedRecipes, getSavedRecipes().filter(function (r) {
            return r.id !== id;
        }));
        renderProfile();
        showToast("Recipe removed", "info", 2000);
    });

    /* ----- Edit details form ----- */
    const $profileForm = $("#profile-form");
    const $profileAlert = $("#profile-alert");
    setupLiveValidation($profileForm);

    function fillProfileForm() {
        $("#edit-name").val(user.name);
        $("#edit-email").val(user.email);
        $("#edit-phone").val(user.phone);
    }
    fillProfileForm();

    $profileForm.on("submit", function (event) {
        event.preventDefault();
        hideFormAlert($profileAlert);
        if (!validateForm($profileForm)) return;

        const oldEmail = user.email;
        const newEmail = getFieldValue($("#edit-email")).toLowerCase();

        if (newEmail !== oldEmail && findUserByEmail(newEmail)) {
            showFieldError($("#edit-email"), "Another account already uses this email.");
            $("#edit-email").trigger("focus");
            return;
        }

        const users = getUsers();
        const stored = users.find(function (u) {
            return u.email === oldEmail;
        });
        stored.name = getFieldValue($("#edit-name"));
        stored.email = newEmail;
        stored.phone = getFieldValue($("#edit-phone"));
        saveUsers(users);

        // Keep the session and the bookings linked to the new email
        if (newEmail !== oldEmail) {
            saveData(STORAGE_KEYS.session, newEmail);
            const bookings = loadData(STORAGE_KEYS.bookings, []);
            bookings.forEach(function (b) {
                if (b.userEmail === oldEmail) b.userEmail = newEmail;
            });
            saveData(STORAGE_KEYS.bookings, bookings);
        }

        user = stored;
        renderProfile();
        updateAccountLink();
        $profileForm.find(".form-control").removeClass("input-valid");
        showFormAlert($profileAlert, "success", "Your details have been updated.");
        showToast("Profile saved", "success");
    });

    /* ----- Change password form ----- */
    const $passwordForm = $("#password-form");
    const $passwordAlert = $("#password-alert");
    setupLiveValidation($passwordForm);

    $passwordForm.on("submit", function (event) {
        event.preventDefault();
        hideFormAlert($passwordAlert);
        if (!validateForm($passwordForm)) return;

        if ($("#current-password").val() !== user.password) {
            showFieldError($("#current-password"), "This is not your current password.");
            $("#current-password").trigger("focus");
            return;
        }

        const users = getUsers();
        const stored = users.find(function (u) {
            return u.email === user.email;
        });
        stored.password = $("#new-password").val();
        saveUsers(users);
        user = stored;

        resetForm($passwordForm);
        showFormAlert($passwordAlert, "success", "Your password has been changed.");
        showToast("Password changed", "success");
    });

    /* ----- Log out / delete account ----- */
    $("#logout-btn").on("click", function () {
        removeData(STORAGE_KEYS.session);
        setFlashMessage("info", "You have been logged out. See you soon!");
        window.location.href = "login.html";
    });

    $("#delete-account-btn").on("click", function () {
        if (!window.confirm("Delete your account and all your reservations? This cannot be undone.")) return;

        saveUsers(getUsers().filter(function (u) {
            return u.email !== user.email;
        }));
        saveData(STORAGE_KEYS.bookings, loadData(STORAGE_KEYS.bookings, []).filter(function (b) {
            return b.userEmail !== user.email;
        }));
        removeData(STORAGE_KEYS.session);
        setFlashMessage("info", "Your account has been deleted.");
        window.location.href = "login.html";
    });

    renderProfile();
}


/* =====================================================================
   9. Menu pages: live search, autocomplete, recent searches, favourites
   ===================================================================== */
function initMenuPage() {
    const $searchInput = $("#menu-search-input");
    if (!$searchInput.length) return;

    const pageKey = $searchInput.data("menu");          // "dishes" or "drinks"
    const $menuItems = $(".menu-item");
    const $suggestions = $("#search-suggestions");
    const $searchCount = $("#search-count");
    const $favFilter = $("#favorites-filter");
    const $empty = $("#menu-empty");
    let favoritesOnly = false;

    // Name of a dish, e.g. "Spring Rolls"
    function itemName($item) {
        return $item.find(".menu-item-name").text().trim();
    }

    /* ----- Favourites (saved in localStorage) ----- */
    function isFavorite(id) {
        return getFavorites().some(function (fav) {
            return fav.id === id;
        });
    }

    function updateFavoriteButtons() {
        $menuItems.each(function () {
            const $item = $(this);
            const saved = isFavorite($item.data("id"));
            $item.find(".fav-btn")
                .attr({
                    "aria-pressed": String(saved),
                    "aria-label": (saved ? "Remove " : "Save ") + itemName($item) + (saved ? " from favourites" : " to favourites")
                })
                .find("i").attr("class", saved ? "fa-solid fa-heart" : "fa-regular fa-heart");
        });

        const count = getFavorites().filter(function (fav) {
            return fav.page === pageKey;
        }).length;
        $("#favorites-count").text(count);
    }

    // Give every item an id and a heart button
    $menuItems.each(function () {
        const $item = $(this);
        $item.attr("data-id", pageKey + ":" + itemName($item).toLowerCase());
        $('<button type="button" class="fav-btn"><i class="fa-regular fa-heart" aria-hidden="true"></i></button>').appendTo($item);
    });

    $menuItems.on("click", ".fav-btn", function () {
        const $button = $(this);
        const $item = $button.closest(".menu-item");
        const id = $item.data("id");
        let favorites = getFavorites();

        if (isFavorite(id)) {
            favorites = favorites.filter(function (fav) {
                return fav.id !== id;
            });
            showToast(itemName($item) + " removed from favourites", "info", 2000);
        } else {
            favorites.push({
                id: id,
                name: itemName($item),
                page: pageKey,
                category: $item.closest("details").find("summary").text().trim(),
                price: $item.find(".menu-item-price").text().trim(),
                image: $item.find("img").attr("src")
            });
            showToast(itemName($item) + " saved to favourites", "success", 2000);
        }

        saveData(STORAGE_KEYS.favorites, favorites);
        $button.toggleClass("is-saved", isFavorite(id));
        updateFavoriteButtons();
        if (favoritesOnly) {
            filterMenu($searchInput.val());
        }
    });

    $favFilter.on("click", function () {
        favoritesOnly = !favoritesOnly;
        $favFilter.attr("aria-pressed", String(favoritesOnly));
        filterMenu($searchInput.val());
    });

    /* ----- Task 1: live filter ----- */
    function filterMenu(term) {
        term = term.trim().toLowerCase();
        const filtering = term !== "" || favoritesOnly;

        // .filter() keeps only the items whose name contains the search term
        const $matches = $menuItems.filter(function () {
            const $item = $(this);
            const nameMatches = itemName($item).toLowerCase().includes(term);
            return nameMatches && (!favoritesOnly || isFavorite($item.data("id")));
        });

        $menuItems.hide();
        $matches.show();

        // Open categories that contain matches, hide the empty ones
        $(".menu-category").each(function () {
            const $details = $(this);
            const hasMatch = $details.find(".menu-item").filter($matches).length > 0;
            if (!filtering) {
                $details.show().prop("open", false);
            } else {
                $details.toggle(hasMatch).prop("open", hasMatch);
            }
        });

        // Result text
        let message = "";
        if (term && favoritesOnly) {
            message = $matches.length + ' favourite(s) match "' + term + '"';
        } else if (term) {
            message = $matches.length ? $matches.length + " item(s) found" : 'No items match "' + term + '"';
        } else if (favoritesOnly) {
            message = $matches.length + " favourite(s)";
        }
        $searchCount.text(message);
        $empty.toggle(filtering && $matches.length === 0);

        return $matches.length;
    }

    /* ----- Task 2: autocomplete suggestions ----- */
    const menuNames = $menuItems.map(function () {
        return {
            name: itemName($(this)),
            category: $(this).closest("details").find("summary").text().trim(),
            $el: $(this)
        };
    }).get();

    let activeIndex = -1;

    function showSuggestions(term) {
        term = term.trim();
        $suggestions.empty();
        activeIndex = -1;

        if (term === "") {
            $suggestions.hide();
            return;
        }

        const regex = new RegExp("(" + escapeRegExp(term) + ")", "ig");
        const found = menuNames.filter(function (item) {
            return item.name.toLowerCase().includes(term.toLowerCase());
        }).slice(0, 8);

        if (found.length === 0) {
            $suggestions.append('<li class="no-results">No suggestions</li>');
        }

        $.each(found, function (i, item) {
            const boldName = escapeHtml(item.name).replace(regex, "<strong>$1</strong>");
            $('<li role="option"></li>')
                .html("<span>" + boldName + "</span><small>" + escapeHtml(item.category) + "</small>")
                .data("item", item)
                .appendTo($suggestions);
        });

        $suggestions.slideDown(150);
    }

    function chooseSuggestion($li) {
        const item = $li.data("item");
        if (!item) return;

        $searchInput.val(item.name);
        $suggestions.hide();
        filterMenu(item.name);
        saveRecentSearch(item.name);

        // Scroll to the chosen dish and flash it
        $("html, body").animate({ scrollTop: item.$el.offset().top - 140 }, 400);
        item.$el.addClass("is-flashing")
            .animate({ opacity: 0.5 }, 200).animate({ opacity: 1 }, 200)
            .animate({ opacity: 0.5 }, 200).animate({ opacity: 1 }, 200, function () {
                $(this).removeClass("is-flashing");
            });
    }

    /* ----- Recent searches (saved in localStorage per page) ----- */
    function getRecentSearches() {
        const all = loadData(STORAGE_KEYS.recentSearches, {});
        return all[pageKey] || [];
    }

    function saveRecentSearch(term) {
        term = term.trim();
        if (term.length < 2) return;

        const all = loadData(STORAGE_KEYS.recentSearches, {});
        // Newest first, no duplicates, at most 6
        const list = (all[pageKey] || []).filter(function (t) {
            return t.toLowerCase() !== term.toLowerCase();
        });
        list.unshift(term);
        all[pageKey] = list.slice(0, 6);
        saveData(STORAGE_KEYS.recentSearches, all);
        renderRecentSearches();
    }

    function renderRecentSearches() {
        const $box = $("#recent-searches").empty();
        const list = getRecentSearches();
        if (!list.length) return;

        $box.append('<span class="recent-label"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Recent:</span>');
        list.forEach(function (term) {
            $('<button type="button" class="chip js-recent"></button>').text(term).appendTo($box);
        });
        $('<button type="button" class="chip-clear js-clear-recent">Clear</button>').appendTo($box);
    }

    $("#recent-searches")
        .on("click", ".js-recent", function () {
            const term = $(this).text();
            $searchInput.val(term).trigger("focus");
            $suggestions.hide();
            filterMenu(term);
            saveRecentSearch(term);
        })
        .on("click", ".js-clear-recent", function () {
            const all = loadData(STORAGE_KEYS.recentSearches, {});
            delete all[pageKey];
            saveData(STORAGE_KEYS.recentSearches, all);
            renderRecentSearches();
            showToast("Recent searches cleared", "info", 1800);
        });

    /* ----- Events ----- */
    let saveTimer = null;

    // Filter in real time as the user types
    $searchInput.on("keyup input", function (event) {
        if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)) return;

        const term = $(this).val();
        const found = filterMenu(term);
        showSuggestions(term);

        // Remember the search once the user stops typing for a moment
        clearTimeout(saveTimer);
        if (found > 0) {
            saveTimer = setTimeout(function () {
                saveRecentSearch(term);
            }, 1500);
        }
    });

    // Keyboard navigation inside the suggestion list
    $searchInput.on("keydown", function (event) {
        const $items = $suggestions.find("li").not(".no-results");

        if (event.key === "Enter") {
            event.preventDefault();
            if (activeIndex >= 0 && $items.length) {
                chooseSuggestion($items.eq(activeIndex));
            } else {
                $suggestions.hide();
                saveRecentSearch($searchInput.val());
            }
            return;
        }
        if (event.key === "Escape") {
            $suggestions.hide();
            return;
        }
        if (!$items.length) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            activeIndex = (activeIndex + 1) % $items.length;
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            activeIndex = (activeIndex - 1 + $items.length) % $items.length;
        } else {
            return;
        }
        $items.removeClass("active").eq(activeIndex).addClass("active");
    });

    // Event delegation: works for <li> items created later
    $suggestions.on("click", "li", function () {
        chooseSuggestion($(this));
    });

    // Close the list when clicking anywhere else
    $(document).on("click", function (event) {
        if (!$(event.target).closest(".search-box").length) {
            $suggestions.hide();
        }
    });

    updateFavoriteButtons();
    renderRecentSearches();
}

/* ----- Chef's specials on the Dishes page (Assignment 5: arrays of objects) ----- */
const chefSpecials = [
    { name: "Yuzu Glazed Salmon", price: "$18", description: "Fresh salmon with a citrus reduction.", image: "images/glazed-salmon.jpg" },
    { name: "Matcha Pork Ramen", price: "$15", description: "Rich broth with handmade noodles.", image: "images/matcha-pork-ramen.webp" },
    { name: "Crispy Soft Shell Crab", price: "$22", description: "Served with our house spicy mayo.", image: "images/shell-crabs.jpg" }
];

function renderSpecials() {
    const $container = $("#specials-container");
    if (!$container.length) return;

    $container.empty();
    chefSpecials.forEach(function (item) {
        const $card = $('<article class="card"></article>');
        $('<div class="card-image"></div>')
            .append($("<img>").attr({ src: item.image, alt: item.name, loading: "lazy" }))
            .appendTo($card);
        $('<div class="card-body"></div>')
            .append($("<h3></h3>").text(item.name))
            .append($("<p></p>").text(item.description))
            .append($('<p class="card-price"></p>').text(item.price))
            .appendTo($card);
        $container.append($card);
    });
}


/* =====================================================================
   10. Recipes page: TheMealDB API  (https://www.themealdb.com)
   ---------------------------------------------------------------------
   - fetch() + async/await to load recipes
   - loading skeleton while waiting, friendly error + "Try again"
   - favourite recipes and the last search are saved in localStorage
   ===================================================================== */
const MEALDB_URL = "https://www.themealdb.com/api/json/v1/1/";
const CUISINES = ["Japanese", "Chinese", "Thai", "Vietnamese", "Malaysian", "Filipino"];

// fetch() with a time limit, so a slow network shows an error instead of loading forever
async function fetchJson(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(function () {
        controller.abort();
    }, timeoutMs || 10000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error("The server answered with status " + response.status);
        }
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

// Turn any fetch error into a sentence a guest understands
function friendlyFetchError(error) {
    if (!navigator.onLine) return "You seem to be offline. Please check your internet connection.";
    if (error.name === "AbortError") return "The recipe service took too long to answer.";
    return "The recipe service is not responding right now.";
}

function isRecipeSaved(id) {
    return getSavedRecipes().some(function (recipe) {
        return recipe.id === String(id);
    });
}

// Save or un-save a recipe; returns true if it is now saved
function toggleSavedRecipe(recipe) {
    let saved = getSavedRecipes();
    const nowSaved = !isRecipeSaved(recipe.id);

    if (nowSaved) {
        saved.push({ id: String(recipe.id), name: recipe.name, thumb: recipe.thumb, area: recipe.area });
        showToast('"' + recipe.name + '" saved to your recipes', "success", 2000);
    } else {
        saved = saved.filter(function (r) {
            return r.id !== String(recipe.id);
        });
        showToast('"' + recipe.name + '" removed', "info", 2000);
    }

    saveData(STORAGE_KEYS.savedRecipes, saved);
    return nowSaved;
}

function initRecipesPage() {
    const $grid = $("#recipe-grid");
    if (!$grid.length) return;

    const $status = $("#recipe-status");
    const $summary = $("#recipe-summary");
    const $filters = $("#cuisine-filters");
    const $form = $("#recipe-search-form");
    const $query = $("#recipe-query");
    const $modal = $("#recipe-modal");
    const $modalBody = $("#recipe-modal-body");

    // Last view: { mode: "cuisine" | "search" | "saved", cuisine, query }
    let prefs = loadData(STORAGE_KEYS.recipePrefs, { mode: "cuisine", cuisine: "Japanese", query: "" });
    let requestNumber = 0; // answers from older requests are ignored
    let currentRecipes = [];

    /* ----- Filter buttons ----- */
    CUISINES.forEach(function (cuisine) {
        $('<button type="button" class="chip"></button>')
            .attr("data-cuisine", cuisine)
            .text(cuisine)
            .appendTo($filters);
    });
    $('<button type="button" class="chip" data-saved="true"><i class="fa-solid fa-heart" aria-hidden="true"></i> Saved (<span id="saved-count">0</span>)</button>')
        .appendTo($filters);

    function updateSavedCount() {
        $("#saved-count").text(getSavedRecipes().length);
    }

    function markActiveFilter() {
        $filters.find(".chip").each(function () {
            const $chip = $(this);
            const active = (prefs.mode === "cuisine" && $chip.data("cuisine") === prefs.cuisine) ||
                (prefs.mode === "saved" && $chip.data("saved") === true);
            $chip.attr("aria-pressed", String(active));
        });
    }

    function savePrefs(newPrefs) {
        prefs = newPrefs;
        saveData(STORAGE_KEYS.recipePrefs, prefs);
        markActiveFilter();
    }

    /* ----- Loading / error / empty states ----- */
    function showLoading() {
        $status.empty();
        $summary.text("Loading recipes...");
        $grid.attr("aria-busy", "true").empty();
        for (let i = 0; i < 8; i++) {
            $grid.append('<div class="skeleton-card" aria-hidden="true"><div class="skeleton-image"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>');
        }
    }

    function showMessage(type, title, text, buttonText, onClick) {
        $grid.attr("aria-busy", "false").empty();
        const icon = type === "error" ? "fa-plug-circle-xmark" : "fa-bowl-food";
        const $box = $('<div class="status-message"></div>').toggleClass("is-error", type === "error")
            .attr("role", type === "error" ? "alert" : "status")
            .append($('<i class="fa-solid" aria-hidden="true"></i>').addClass(icon))
            .append($("<h3></h3>").text(title))
            .append($("<p></p>").text(text));

        if (buttonText) {
            $('<button type="button" class="btn btn-primary"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> </button>')
                .append(document.createTextNode(buttonText))
                .on("click", onClick)
                .appendTo($box);
        }
        $status.empty().append($box);
    }

    /* ----- Recipe cards ----- */
    function renderRecipes(recipes) {
        currentRecipes = recipes;
        $status.empty();
        $grid.attr("aria-busy", "false").empty();

        recipes.forEach(function (recipe, index) {
            const saved = isRecipeSaved(recipe.id);
            const $card = $('<article class="recipe-card"></article>')
                .attr("data-id", recipe.id)
                .css("animation-delay", Math.min(index, 12) * 40 + "ms");

            $('<div class="recipe-card-image"></div>')
                .append($("<img>").attr({ src: recipe.thumb + "/medium", alt: recipe.name, loading: "lazy" }))
                .append($('<span class="recipe-badge"></span>').text(recipe.area))
                .append(
                    $('<button type="button" class="fav-btn js-save-recipe"></button>')
                        .attr({ "aria-pressed": String(saved), "aria-label": (saved ? "Remove " : "Save ") + recipe.name })
                        .append($('<i aria-hidden="true"></i>').addClass(saved ? "fa-solid fa-heart" : "fa-regular fa-heart"))
                )
                .appendTo($card);

            $('<div class="recipe-card-body"></div>')
                .append($("<h3></h3>").text(recipe.name))
                .append('<button type="button" class="btn btn-primary btn-small js-view-recipe">View recipe <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>')
                .appendTo($card);

            $grid.append($card);
        });
    }

    /* ----- The three ways to list recipes ----- */
    async function loadCuisine(cuisine) {
        savePrefs({ mode: "cuisine", cuisine: cuisine, query: "" });
        $query.val("");
        clearFieldError($query);
        const thisRequest = ++requestNumber;
        showLoading();

        try {
            const data = await fetchJson(MEALDB_URL + "filter.php?a=" + encodeURIComponent(cuisine));
            if (thisRequest !== requestNumber) return; // a newer request has started

            const recipes = (data.meals || []).map(function (meal) {
                return { id: meal.idMeal, name: meal.strMeal, thumb: meal.strMealThumb, area: cuisine };
            });

            if (!recipes.length) {
                $summary.text("");
                showMessage("empty", "No recipes yet", "We could not find " + cuisine + " recipes. Try another cuisine.");
                return;
            }
            $summary.text(recipes.length + " " + cuisine + " recipes to cook at home");
            renderRecipes(recipes);
        } catch (error) {
            if (thisRequest !== requestNumber) return;
            $summary.text("");
            showMessage("error", "We couldn't load the recipes", friendlyFetchError(error), "Try again", function () {
                loadCuisine(cuisine);
            });
        }
    }

    async function searchRecipes(query) {
        savePrefs({ mode: "search", cuisine: prefs.cuisine, query: query });
        const thisRequest = ++requestNumber;
        showLoading();

        try {
            const data = await fetchJson(MEALDB_URL + "search.php?s=" + encodeURIComponent(query));
            if (thisRequest !== requestNumber) return;

            const recipes = (data.meals || []).map(function (meal) {
                return { id: meal.idMeal, name: meal.strMeal, thumb: meal.strMealThumb, area: meal.strArea || "World" };
            });

            if (!recipes.length) {
                $summary.text("");
                showMessage("empty", 'Nothing found for "' + query + '"', "Try a different word, like ramen, curry, salmon or rice.");
                return;
            }
            $summary.text(recipes.length + ' result(s) for "' + query + '"');
            renderRecipes(recipes);
        } catch (error) {
            if (thisRequest !== requestNumber) return;
            $summary.text("");
            showMessage("error", "The search didn't work", friendlyFetchError(error), "Try again", function () {
                searchRecipes(query);
            });
        }
    }

    // Saved recipes come from localStorage, so no request is needed
    function showSaved() {
        savePrefs({ mode: "saved", cuisine: prefs.cuisine, query: "" });
        $query.val("");
        clearFieldError($query);
        requestNumber++;
        const saved = getSavedRecipes();

        if (!saved.length) {
            $summary.text("");
            showMessage("empty", "No saved recipes yet", "Tap the heart on any recipe to keep it here and on your profile.");
            return;
        }
        $summary.text(saved.length + " saved recipe(s)");
        renderRecipes(saved);
    }

    /* ----- Recipe details in a modal ----- */
    function buildRecipeDetail(meal) {
        const recipe = { id: meal.idMeal, name: meal.strMeal, thumb: meal.strMealThumb, area: meal.strArea || "World" };
        const $detail = $('<div class="recipe-detail"></div>');

        // Header: picture, title, tags, buttons
        const $tags = $('<div class="recipe-tags"></div>');
        [meal.strArea, meal.strCategory].concat(meal.strTags ? meal.strTags.split(",") : []).forEach(function (tag) {
            if (tag && tag.trim()) {
                $('<span class="recipe-tag"></span>').text(tag.trim()).appendTo($tags);
            }
        });

        const saved = isRecipeSaved(recipe.id);
        const $buttons = $('<div class="button-row"></div>');
        $('<button type="button" class="btn btn-primary btn-small js-modal-save"></button>')
            .html(saved ? '<i class="fa-solid fa-heart" aria-hidden="true"></i> Saved' : '<i class="fa-regular fa-heart" aria-hidden="true"></i> Save recipe')
            .data("recipe", recipe)
            .appendTo($buttons);
        if (meal.strYoutube) {
            $('<a class="btn btn-ghost btn-small" target="_blank" rel="noopener"><i class="fa-brands fa-youtube" aria-hidden="true"></i> Watch video</a>')
                .attr("href", meal.strYoutube).appendTo($buttons);
        }

        $('<div class="recipe-detail-header"></div>')
            .append($("<img>").attr({ src: meal.strMealThumb + "/medium", alt: meal.strMeal }))
            .append($("<div></div>").append($('<h2 id="recipe-modal-title"></h2>').text(meal.strMeal)).append($tags).append($buttons))
            .appendTo($detail);

        // Ingredients: the API gives strIngredient1..20 and strMeasure1..20
        const $ingredients = $('<ul class="ingredient-list"></ul>');
        for (let i = 1; i <= 20; i++) {
            const ingredient = (meal["strIngredient" + i] || "").trim();
            const measure = (meal["strMeasure" + i] || "").trim();
            if (ingredient) {
                $("<li></li>")
                    .append('<i class="fa-solid fa-leaf" aria-hidden="true"></i>')
                    .append($("<span></span>").text((measure ? measure + " " : "") + ingredient))
                    .appendTo($ingredients);
            }
        }
        $detail.append("<h3>Ingredients</h3>").append($ingredients);

        // Instructions split into paragraphs
        const $steps = $('<div class="recipe-steps"></div>');
        String(meal.strInstructions || "").split(/\r?\n+/).forEach(function (line) {
            if (line.trim()) {
                $("<p></p>").text(line.trim()).appendTo($steps);
            }
        });
        $detail.append("<h3>How to cook it</h3>").append($steps);

        return $detail;
    }

    async function openRecipe(id) {
        $modalBody.html('<p class="text-center"><span class="spinner" aria-hidden="true"></span> Loading recipe...</p>');
        openModal($modal);

        try {
            const data = await fetchJson(MEALDB_URL + "lookup.php?i=" + encodeURIComponent(id));
            const meal = data.meals && data.meals[0];
            if (!meal) {
                throw new Error("Recipe not found");
            }
            $modalBody.empty().append(buildRecipeDetail(meal));
            // Put the recipe in the address bar so it can be shared / reopened
            history.replaceState(null, "", "#recipe-" + id);
        } catch (error) {
            $modalBody.empty().append(
                $('<div class="status-message is-error" role="alert"></div>')
                    .append('<i class="fa-solid fa-plug-circle-xmark" aria-hidden="true"></i>')
                    .append("<h3>We couldn't open this recipe</h3>")
                    .append($("<p></p>").text(friendlyFetchError(error)))
                    .append($('<button type="button" class="btn btn-primary">Try again</button>').on("click", function () {
                        openRecipe(id);
                    }))
            );
        }
    }

    $modal.on("modal:closed", function () {
        history.replaceState(null, "", window.location.pathname);
    });

    /* ----- Events ----- */
    $filters.on("click", ".chip", function () {
        if ($(this).data("saved") === true) {
            showSaved();
        } else {
            loadCuisine($(this).data("cuisine"));
        }
    });

    setupLiveValidation($form);
    $form.on("submit", function (event) {
        event.preventDefault();
        if (!validateForm($form)) return;
        searchRecipes(getFieldValue($query));
    });

    $grid.on("click", ".js-view-recipe", function () {
        openRecipe($(this).closest(".recipe-card").data("id"));
    });

    $grid.on("click", ".js-save-recipe", function () {
        const id = String($(this).closest(".recipe-card").data("id"));
        const recipe = currentRecipes.find(function (r) {
            return String(r.id) === id;
        });
        const nowSaved = toggleSavedRecipe(recipe);

        $(this).attr({ "aria-pressed": String(nowSaved), "aria-label": (nowSaved ? "Remove " : "Save ") + recipe.name })
            .toggleClass("is-saved", nowSaved)
            .find("i").attr("class", nowSaved ? "fa-solid fa-heart" : "fa-regular fa-heart");
        updateSavedCount();

        if (prefs.mode === "saved" && !nowSaved) {
            showSaved();
        }
    });

    $modalBody.on("click", ".js-modal-save", function () {
        const recipe = $(this).data("recipe");
        const nowSaved = toggleSavedRecipe(recipe);
        $(this).html(nowSaved ? '<i class="fa-solid fa-heart" aria-hidden="true"></i> Saved' : '<i class="fa-regular fa-heart" aria-hidden="true"></i> Save recipe');
        updateSavedCount();

        // Keep the heart on the card in sync
        $grid.find('.recipe-card[data-id="' + recipe.id + '"] .js-save-recipe')
            .attr("aria-pressed", String(nowSaved))
            .find("i").attr("class", nowSaved ? "fa-solid fa-heart" : "fa-regular fa-heart");
        if (prefs.mode === "saved") {
            showSaved();
        }
    });

    /* ----- First load: restore the last view ----- */
    updateSavedCount();
    markActiveFilter();

    if (prefs.mode === "search" && prefs.query) {
        $query.val(prefs.query);
        searchRecipes(prefs.query);
    } else if (prefs.mode === "saved") {
        showSaved();
    } else {
        loadCuisine(CUISINES.includes(prefs.cuisine) ? prefs.cuisine : "Japanese");
    }

    // A link like recipes.html#recipe-52831 (from the profile) opens that recipe
    const match = window.location.hash.match(/^#recipe-(\d+)$/);
    if (match) {
        openRecipe(match[1]);
    }
}


/* =====================================================================
   11. About page: opening hours, clock, FAQ accordion, FAQ highlighting
   ===================================================================== */

// Restaurant info as an object with methods (Assignment 5)
const yuzuRestaurant = {
    name: "Yuzu Kitchen",
    location: "Astana, Mangilik El Ave. 55",
    // [opening hour, closing hour] for Sunday (0) ... Saturday (6); 24 = midnight
    hours: { 0: [11, 22], 1: [10, 23], 2: [10, 23], 3: [10, 23], 4: [10, 23], 5: [10, 24], 6: [11, 24] },

    isOpenNow: function () {
        const now = new Date();
        const today = this.hours[now.getDay()];
        const time = now.getHours() + now.getMinutes() / 60;
        return time >= today[0] && time < today[1];
    },

    getStatusMessage: function () {
        const today = this.hours[new Date().getDay()];
        const closing = today[1] === 24 ? "midnight" : today[1] + ":00";
        return this.isOpenNow() ? "Open now · until " + closing : "Closed now · opens at " + today[0] + ":00";
    }
};

function initAboutPage() {
    // Open / closed badge
    const $status = $("#status-banner");
    if ($status.length) {
        $status.toggleClass("is-open", yuzuRestaurant.isOpenNow())
            .html('<i class="fa-solid fa-circle" aria-hidden="true"></i> ')
            .append(document.createTextNode(yuzuRestaurant.getStatusMessage()));
    }

    // Live clock
    const $clock = $("#date-time");
    if ($clock.length) {
        const updateClock = function () {
            $clock.text(new Date().toLocaleString("en-US", {
                weekday: "long", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
            }));
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // FAQ accordion (Assignment 5)
    $(".accordion-header").on("click", function () {
        const $header = $(this);
        const $item = $header.parent();
        const content = $header.next(".accordion-content")[0];
        const willOpen = !$item.hasClass("active");

        $item.toggleClass("active", willOpen);
        content.style.maxHeight = willOpen ? content.scrollHeight + "px" : null;
        $header.attr("aria-expanded", String(willOpen));
    });

    // FAQ search with highlighting (Assignment 6, Task 3)
    const $faqInput = $("#faq-search-input");
    const $faqCount = $("#faq-search-count");
    if (!$faqInput.length) return;

    // Only plain-text elements, so replacing their HTML can't break nested tags
    const $targets = $("main").find("h1, h2, h3, p, li, .accordion-header")
        .not(".eyebrow, .search-count")
        .filter(function () {
            return $(this).children().length === 0;
        });

    $targets.each(function () {
        $(this).data("original-text", $(this).text());
    });

    $faqInput.on("keyup input", function (event) {
        const term = $(this).val().trim();
        let total = 0;

        $targets.each(function () {
            const $el = $(this);
            const original = $el.data("original-text");

            if (term === "") {
                $el.text(original);
                return;
            }

            const regex = new RegExp("(" + escapeRegExp(term) + ")", "gi");
            const matches = original.match(regex);

            if (matches) {
                total += matches.length;
                // Wrap every match in <mark>; the <span> keeps the text together in flex buttons
                $el.html("<span>" + escapeHtml(original).replace(regex, '<mark class="highlight">$1</mark>') + "</span>");

                // Open the FAQ answer so the highlighted text is visible
                const $item = $el.closest(".accordion-item");
                if ($item.length && !$item.hasClass("active")) {
                    $item.find(".accordion-header").trigger("click");
                }
            } else {
                $el.text(original);
            }
        });

        if (term === "") {
            $faqCount.text("");
            return;
        }

        $faqCount.text(total ? total + ' match(es) for "' + term + '"' : 'Nothing found for "' + term + '"');

        // Enter jumps to the first match
        if (total && event.key === "Enter") {
            $("html, body").animate({ scrollTop: $("mark.highlight").first().offset().top - 150 }, 400);
        }
    });
}


/* =====================================================================
   12. Main page: greeting, rating, animated counters
   ===================================================================== */
function initGreeting() {
    const $greeting = $("#time-greeting");
    if (!$greeting.length) return;

    const hour = new Date().getHours();
    let timeBlock;

    // switch (true) picks the first case that is true (Assignment 5)
    switch (true) {
        case hour >= 5 && hour < 12:
            timeBlock = "morning";
            break;
        case hour >= 12 && hour < 17:
            timeBlock = "afternoon";
            break;
        case hour >= 17 && hour < 22:
            timeBlock = "evening";
            break;
        default:
            timeBlock = "night";
    }

    const messages = {
        morning: "Good morning! Fresh tea and rolls are ready for early visitors.",
        afternoon: "Good afternoon! Stop by for our wok lunch sets.",
        evening: "Good evening! Enjoy dinner and live music at Yuzu Kitchen.",
        night: "Late night? Our kitchen stays open late on weekends."
    };
    $greeting.text(messages[timeBlock]);
}

function initRating() {
    const $stars = $(".star");
    if (!$stars.length) return;

    const $note = $("#rating-note");

    function paint(count, className) {
        $stars.each(function (index) {
            $(this).toggleClass(className, index < count);
        });
    }

    function showSaved() {
        const saved = loadData(STORAGE_KEYS.rating, 0);
        paint(saved, "is-active");
        $stars.each(function (index) {
            $(this).attr("aria-pressed", String(index < saved));
        });
        $note.text(saved ? "You rated us " + saved + "/5. Thank you!" : "");
    }

    // Hover preview
    $stars.on("mouseenter focus", function () {
        paint($stars.index(this) + 1, "is-preview");
    }).on("mouseleave blur", function () {
        paint(0, "is-preview");
    });

    $stars.on("click", function () {
        const rating = $stars.index(this) + 1;
        saveData(STORAGE_KEYS.rating, rating);
        showSaved();
        showToast("Thanks for rating us " + rating + "/5 ★", "info");
    });

    showSaved();
}

// Numbers count up when the stats come into view (Assignment 6, Task 5)
function initCounters() {
    const $stats = $(".stats-section");
    if (!$stats.length) return;

    let started = false;

    function startCounters() {
        if (started) return;

        const viewBottom = $(window).scrollTop() + $(window).height();
        if (viewBottom < $stats.offset().top + 100) return; // not visible yet

        started = true;
        $(".stat-number").each(function () {
            const $number = $(this);
            const target = parseInt($number.data("target"), 10);
            const suffix = $number.data("suffix") || "";

            // Animate a plain object's property and print it on every step
            $({ value: 0 }).animate({ value: target }, {
                duration: 2200,
                easing: "swing",
                step: function (now) {
                    $number.text(Math.floor(now).toLocaleString("en-US") + suffix);
                },
                complete: function () {
                    $number.text(target.toLocaleString("en-US") + suffix);
                }
            });
        });
    }

    $(window).on("scroll", startCounters);
    startCounters();
}


/* =====================================================================
   13. Site-wide widgets
   ===================================================================== */

// Scroll progress ring on a "back to top" button (Assignment 6, Task 4)
function initScrollRing() {
    const RADIUS = 22;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // length of the ring's outline

    const $toTop = $(
        '<button type="button" id="scroll-top-btn" aria-label="Back to top">' +
            '<svg viewBox="0 0 52 52" aria-hidden="true">' +
                '<circle class="ring-bg" cx="26" cy="26" r="' + RADIUS + '"></circle>' +
                '<circle class="ring-fill" cx="26" cy="26" r="' + RADIUS + '"></circle>' +
            "</svg>" +
            '<span class="scroll-top-arrow" aria-hidden="true">↑</span>' +
        "</button>"
    ).appendTo("body");

    // The ring is one long dash; shifting it with dashoffset hides part of it
    const $ring = $toTop.find(".ring-fill").css({
        strokeDasharray: CIRCUMFERENCE,
        strokeDashoffset: CIRCUMFERENCE
    });

    function updateProgress() {
        const scrollTop = $(window).scrollTop();
        const scrollable = $(document).height() - $(window).height();
        const percent = scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0;

        // 0% -> offset = full length (empty ring), 100% -> offset = 0 (full ring)
        $ring.css("stroke-dashoffset", CIRCUMFERENCE * (1 - percent / 100));
        $toTop.attr("title", Math.round(percent) + "% of the page");
        $toTop.toggleClass("visible", scrollTop > 150);
        $toTop.toggleClass("complete", percent >= 99.5);
    }

    $toTop.on("click", function () {
        $("html, body").animate({ scrollTop: 0 }, 600);
    });

    $(window).on("scroll resize", updateProgress);
    updateProgress();
}

// Copy to clipboard (Assignment 6, Task 8)
function initCopyButtons() {
    // Old-style copy for pages opened over http:// or file://
    function legacyCopy(text) {
        const $temp = $("<textarea>").val(text).css({ position: "fixed", opacity: 0 }).appendTo("body");
        $temp[0].select();
        const ok = document.execCommand("copy");
        $temp.remove();
        return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () {
                return legacyCopy(text);
            });
        }
        return legacyCopy(text);
    }

    function showCopied($button) {
        const $icon = $button.find(".copy-icon");
        $button.addClass("copied");
        $icon.attr("class", "copy-icon fa-solid fa-check");
        $button.find(".copy-tooltip").stop(true, true).fadeIn(150);

        clearTimeout($button.data("timer"));
        $button.data("timer", setTimeout(function () {
            $button.removeClass("copied");
            $icon.attr("class", "copy-icon fa-regular fa-copy");
            $button.find(".copy-tooltip").fadeOut(200);
        }, 2000));
    }

    $(".copy-btn").on("click", function () {
        const $button = $(this);
        const text = $button.siblings(".copy-text").text().trim();

        copyToClipboard(text)
            .then(function () {
                showCopied($button);
                showToast('"' + text + '" copied to clipboard', "success", 2000);
            })
            .catch(function () {
                showToast("Could not copy, please copy it manually.", "error");
            });
    });

    // Also react when the guest selects the text and presses Ctrl+C
    $(".copy-text").on("copy", function () {
        showCopied($(this).siblings(".copy-btn"));
        showToast("Copied to clipboard!", "success", 2000);
    });
}

// Gallery images load only when they scroll into view (Assignment 6, Task 9)
function initLazyImages() {
    if (!$("img.lazy[data-src]").length) return;

    function lazyLoad() {
        const viewBottom = $(window).scrollTop() + $(window).height();

        $("img.lazy[data-src]").each(function () {
            const $img = $(this);
            if ($img.offset().top < viewBottom) {
                $img.one("load", function () {
                    $img.removeClass("lazy").css("opacity", 0).animate({ opacity: 1 }, 600);
                }).one("error", function () {
                    $img.removeClass("lazy").css("opacity", 1);
                });
                $img.attr("src", $img.attr("data-src")).removeAttr("data-src");
            }
        });
    }

    $(window).on("scroll resize", lazyLoad);
    lazyLoad();
}

// Short "click" sound on the main action buttons (Assignment 5, Web Audio API)
function initClickSound() {
    let audioContext = null;

    function playClickSound() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        // One shared context: browsers limit how many can exist
        audioContext = audioContext || new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime);
        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.25);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.25);
    }

    $(document).on("click", ".btn-primary, #theme-switch", playClickSound);
}


/* =====================================================================
   14. Start-up
   ===================================================================== */
$(function () {
    console.log("jQuery is ready!"); // Assignment 6, Task 0

    // Every page
    initHeader();
    initThemeSwitch();
    initModals();
    setupFormHelpers();
    initScrollRing();
    initCopyButtons();
    initClickSound();

    // Page-specific parts (each one does nothing on other pages)
    initBookingForms();
    initSignUp();
    initLogIn();
    initProfile();
    initMenuPage();
    renderSpecials();
    initRecipesPage();
    initAboutPage();
    initGreeting();
    initRating();
    initCounters();
    initLazyImages();
});
