function validateForm() {
    let isValid = true;

    clearErrors();


    const form = document.forms["book-form"];
    const nameInput = form["name"];
    const emailInput = form["email"];
    const hallSelect = form["hall"];

    const nameValue = nameInput.value.trim();
    const nameRegex = /^[a-zA-Z]+$/;
    if (nameValue === "") {
        showError(nameInput, "Please enter your name.");
        isValid = false;
    } else if (nameValue.length < 2) {
        showError(nameInput, "Name must be at least 2 characters long.");
        isValid = false;
    }
    else if (!nameRegex.test(nameValue)) {
        showError(nameInput, "Peelaese enter nonumber ok.");
        isValid = false;
    }


    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailValue === "") {
        showError(emailInput, "Please enter your email address.");
        isValid = false;
    } else if (!emailRegex.test(emailValue)) {
        showError(emailInput, "Please enter a valid email address.");
        isValid = false;
    }


    if (!hallSelect.value) {
        showError(hallSelect, "Please select a hall.");
        isValid = false;
    }


    return isValid;
}


function showError(element, message) {
    element.classList.add("input-error");

    const errorSpan = document.createElement("span");
    errorSpan.className = "error-message";
    errorSpan.style.color = "#e74c3c";
    errorSpan.style.fontSize = "0.85rem";
    errorSpan.style.display = "block";
    errorSpan.style.marginTop = "4px";
    errorSpan.innerText = message;

    const formGroup = element.closest(".form-group") || element.parentNode;
    formGroup.appendChild(errorSpan);
}


function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(el => el.remove());

    const errorInputs = document.querySelectorAll(".input-error");
    errorInputs.forEach(el => el.classList.remove("input-error"));
}

// Task 4

// ===== Task 4: Theme Toggle with localStorage Persistence =====
const colorPalettes = [
    { bg: "#EFE6D6", sand: "#FAF7F2", card: "#E3D2B8" }, // Original Warm Cream
    { bg: "#2B2016", sand: "#3B2A20", card: "#1F1812" }  // Dark Mode
];

let currentPaletteIndex = 0;

// Function to apply a theme index to CSS variables
function applyTheme(index) {
    const theme = colorPalettes[index];
    const root = document.documentElement;
    const isDark = (theme.bg === "#2B2016" || index === 1);

    root.style.setProperty("--color-bg", theme.bg);
    root.style.setProperty("--color-sand", theme.sand);
    root.style.setProperty("--color-bg-card", theme.card);

    if (isDark) {
        root.style.setProperty("--color-ink", "#F7F1E6");
        root.style.setProperty("--color-wood", "#EFE6D6");
        root.style.setProperty("--color-btn-bg", "#F7F1E6");
        root.style.setProperty("--color-btn-text", "#2B2016");
        root.style.setProperty("--color-footer-bg", "#18120C");
        root.style.setProperty("--color-footer-text", "#F7F1E6");
        root.style.setProperty("--color-philosophy-bg", "#1F1812");
        root.style.setProperty("--color-philosophy-text", "#F7F1E6");
        root.style.setProperty("--color-booking-bg", "rgba(43, 32, 22, 0.94)");
        root.style.setProperty("--color-input-bg", "#1F1812");
        root.style.setProperty("--color-input-text", "#F7F1E6");
        root.style.setProperty("--color-input-border", "#3B2A20");
        root.style.setProperty("--color-hover-bg", "#2c1e15");
        root.style.setProperty("color-scheme", "dark");
        if (document.body) {
            document.body.classList.add("dark-mode");
        }
    } else {
        root.style.setProperty("--color-ink", "#2B2016");
        root.style.setProperty("--color-wood", "#3B2A20");
        root.style.setProperty("--color-btn-bg", "#2B2016");
        root.style.setProperty("--color-btn-text", "#F7F1E6");
        root.style.setProperty("--color-footer-bg", "#2B2016");
        root.style.setProperty("--color-footer-text", "#F7F1E6");
        root.style.setProperty("--color-philosophy-bg", "#2B2016");
        root.style.setProperty("--color-philosophy-text", "#F7F1E6");
        root.style.setProperty("--color-booking-bg", "rgba(250, 247, 242, 0.92)");
        root.style.setProperty("--color-input-bg", "#FFFFFF");
        root.style.setProperty("--color-input-text", "#2B2016");
        root.style.setProperty("--color-input-border", "#E3D2B8");
        root.style.setProperty("--color-hover-bg", "#d6c1a1");
        root.style.setProperty("color-scheme", "light");
        if (document.body) {
            document.body.classList.remove("dark-mode");
        }
    }
}

// 1. Check for saved theme on page load and apply it immediately
const savedThemeIndex = localStorage.getItem("userThemeIndex");
if (savedThemeIndex !== null) {
    currentPaletteIndex = parseInt(savedThemeIndex, 10);
    applyTheme(currentPaletteIndex);
}

// 2. Set up event listener when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    // Ensure body class is in sync once DOM is ready
    if (document.body) {
        if (currentPaletteIndex === 1) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

    const bgBtn = document.getElementById("bg-toggle-btn");

    if (bgBtn) {
        bgBtn.addEventListener("click", function () {
            // Cycle to next palette
            currentPaletteIndex = (currentPaletteIndex + 1) % colorPalettes.length;

            // Apply styles and save choice to localStorage
            applyTheme(currentPaletteIndex);
            localStorage.setItem("userThemeIndex", currentPaletteIndex);
        });
    }
});

// ===== Task 3: Modal Popup Logic =====
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("booking-modal");
    const openBtn = document.getElementById("open-modal-btn");
    const closeBtn = document.getElementById("close-modal-btn");

    // Open modal on "Reserve a Table" click
    if (openBtn && modal) {
        openBtn.addEventListener("click", function (event) {
            event.preventDefault();
            modal.classList.add("active");
        });
    }

    // Close modal on 'X' button click
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", function () {
            modal.classList.remove("active");
        });
    }

    // Close modal on outside click (dark overlay)
    if (modal) {
        window.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.classList.remove("active");
            }
        });
    }
});

// ===== Task 2: Accordion (FAQ) =====
const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(function (header) {
    header.addEventListener("click", function () {
        const item = header.parentElement;
        const content = header.nextElementSibling;
        const isOpen = item.classList.contains("active");

        if (isOpen) {
            item.classList.remove("active");
            content.style.maxHeight = null;
            header.setAttribute("aria-expanded", "false");
        } else {
            item.classList.add("active");
            content.style.maxHeight = content.scrollHeight + "px";
            header.setAttribute("aria-expanded", "true");
        }
    });
});

function updateDateTime() {
    const dateTimeEl = document.getElementById('date-time');
    if (dateTimeEl) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        dateTimeEl.textContent = now.toLocaleDateString("en-US", options);
    }
}
updateDateTime();
setInterval(updateDateTime, 1000);

function sayHello() {
    console.log("Hello user!")
}

document.addEventListener("DOMContentLoaded", function () {
    const bookatablebtn = document.getElementById("book-a-table-btn");
    let message = "Use Secret Promocode - SE2513 !";
    let isToggled = false;
    if (bookatablebtn) {
        originalText = bookatablebtn.textContent;

        bookatablebtn.addEventListener("click", function () {
            isToggled = !isToggled;
            bookatablebtn.innerText = isToggled ? message : originalText;
        }
        );
    }
});

// Rating stars
const stars = document.querySelectorAll(".star");

stars.forEach((star, index) => {
    star.addEventListener("click", function () {
        stars.forEach((s, i) => {
            s.style.color = i <= index ? "#fd5000" : "gray";
        });
    });
});

// Clear button for Form
const clearBtn = document.getElementById("clear-btn");

if (clearBtn) {
    clearBtn.addEventListener("click", function () {
        const formInputs = document.querySelectorAll(".form-control");
        formInputs.forEach(input => {
            input.value = "";
        });
        clearErrors();
    });
}


// ===== 2. Arrow Key Navigation for Header Menu =====
document.addEventListener("DOMContentLoaded", function () {
    // Select both links and buttons inside <nav>
    const navItems = document.querySelectorAll("nav a, nav button");

    if (navItems.length > 0) {
        document.addEventListener("keydown", function (event) {
            const activeEl = document.activeElement;
            const navArray = Array.from(navItems);

            // Check if keyboard focus is currently inside the nav menu
            let currentIndex = navArray.indexOf(activeEl);

            if (currentIndex !== -1) {
                if (event.key === "ArrowRight") {
                    event.preventDefault(); // Prevent page scrolling
                    const nextIndex = (currentIndex + 1) % navArray.length;
                    navArray[nextIndex].focus();
                } else if (event.key === "ArrowLeft") {
                    event.preventDefault(); // Prevent page scrolling
                    const prevIndex = (currentIndex - 1 + navArray.length) % navArray.length;
                    navArray[prevIndex].focus();
                }
            }
        });
    }
});

// ===== 4. Dynamic Greeting using Switch Statement =====
function displayTimeBasedGreeting() {
    const greetingEl = document.getElementById("time-greeting");
    if (!greetingEl) return;

    const currentHour = new Date().getHours();
    let timeBlock;

    // Determine time range category
    switch (true) {
        case (currentHour >= 5 && currentHour < 12):
            timeBlock = "morning";
            break;
        case (currentHour >= 12 && currentHour < 17):
            timeBlock = "afternoon";
            break;
        case (currentHour >= 17 && currentHour < 22):
            timeBlock = "evening";
            break;
        default:
            timeBlock = "night";
            break;
    }

    // Assign text response using switch
    switch (timeBlock) {
        case "morning":
            greetingEl.textContent = "Good Morning! Fresh tea and rolls ready for early visitors.";
            break;
        case "afternoon":
            greetingEl.textContent = "Good Afternoon! Stop by for our special wok lunch sets.";
            break;
        case "evening":
            greetingEl.textContent = "Good Evening! Enjoy dinner and live music at Yuzu Kitchen.";
            break;
        case "night":
            greetingEl.textContent = "Late Night Special! Kitchen open late for evening cravings.";
            break;
    }
}

document.addEventListener("DOMContentLoaded", displayTimeBasedGreeting);

// ===== 3. Async Form Handling with Callback =====
function submitFormAsync(formData, callback) {
    // Simulating asynchronous submission (e.g., fetch API)
    setTimeout(() => {
        const isSuccess = true; // Simulated response
        if (isSuccess) {
            callback(null, `Thank you, ${formData.name}! Your table reservation is confirmed.`);
        } else {
            callback("Submission failed. Please try again later.", null);
        }
    }, 2000); // short delay that simulates a server call
}

// The submit handler now lives in the jQuery section below (Assignment 6, Task 6)

function capitalize(word) {
    firstLetter = word.slice(0, 1);
    otherLetters = word.slice(1);
    return firstLetter.toUpperCase() + otherLetters.toLowerCase();
}

// 1 yuzu object
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const date = new Date();
const yuzuRestaurant = {

    name: "Yuzu Kitchen",
    location: "Astana, Mangilik El Ave.",
    currentDay: weekday[date.getDay()],

    isOpenNow: function () {
        const currentHour = date.getHours();
        switch (this.currentDay) {
            case "Monday":
            case "Tuesday":
            case "Wednesday":
            case "Thursday":
                return currentHour >= 10 && currentHour < 23;
            case "Friday":
                return currentHour >= 10 && currentHour < 0;
            case "Saturday":
                return currentHour >= 11 && currentHour < 0;
            case "Sunday":
                return currentHour >= 11 && currentHour < 22;
            default:
                return false;
        }
    },

    getStatusMessage: function () {
        if (this.isOpenNow()) {
            return `Restaurant is currently OPEN, visit us at `;
        }
        else {
            return `We are currently closed :( `
        }
    },
};
document.addEventListener("DOMContentLoaded", function () {
    const statusBanner = document.getElementById("status-banner");
    if (statusBanner) {
        statusBanner.textContent = yuzuRestaurant.getStatusMessage();
    }
})


const chefSpecials = [
    { name: "Yuzu Glazed Salmon", price: "$18", description: "Fresh salmon with citrus reduction", image_src: "/images/glazed-salmon.jpg" },
    { name: "Matcha Pork Ramen", price: "$15", description: "Rich broth with handmade noodles", image_src: "/images/matcha-pork-ramen.webp" },
    { name: "Crispy Soft Shell Crab", price: "$22", description: "Served with house spicy mayo", image_src: "/images/shell-crabs.jpg" }
]

function renderSpecials() {
    const specialsContainer = document.getElementById("specials-container");
    if (!specialsContainer) return;

    specialsContainer.innerHTML = "";

    for (let i = 0; i < chefSpecials.length; i++) {
        const item = chefSpecials[i];

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <strong>${item.price}</strong>
            <img src=${item.image_src} alt="${item.name} img"></img>      
        `;
        specialsContainer.appendChild(card);
    }
}
document.addEventListener("DOMContentLoaded", renderSpecials);

// ===== 1. Play Sound Effects (Web Audio API - No external files needed) =====
function playClickSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // High pitch notification chime

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.25);
}

// Attach sound to action buttons
document.addEventListener("DOMContentLoaded", function () {
    const soundButtons = document.querySelectorAll(".submit-btn, .theme-btn, #open-modal-btn");
    soundButtons.forEach(button => {
        button.addEventListener("click", playClickSound);
    });
});


// ===== 2. Event-Triggered JS Animations =====
document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".card, .special-card");

    cards.forEach(card => {
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";

        // Dynamic JS scale & tilt on hover
        card.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-6px) scale(1.02)";
        });

        // Reset transform on mouse leave
        card.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0) scale(1)";
        });
    });
});

/* =====================================================
   ASSIGNMENT 6 — jQuery
   ===================================================== */

// Task 0: jQuery setup check
$(document).ready(function () {
    console.log("jQuery is ready!");
});

// Helpers shared by several tasks
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(text) {
    return $("<div>").text(text).html();
}


// ===== Task 7: Notification system (toasts) =====
// Usage: showToast("Item added", "success" | "info" | "error")
function showToast(message, type, duration) {
    type = type || "success";
    duration = duration || 3000;
    const icons = { success: "✔", info: "ℹ", error: "✖" };

    let $container = $("#toast-container");
    if ($container.length === 0) {
        $container = $('<div id="toast-container" aria-live="polite"></div>').appendTo("body");
    }

    const $toast = $('<div class="toast"></div>')
        .addClass("toast-" + type)
        .append($('<span class="toast-icon"></span>').text(icons[type] || ""))
        .append($("<span></span>").text(message));

    $toast.appendTo($container)
        .fadeIn(300)
        .delay(duration)
        .fadeOut(600, function () {
            $(this).remove();
        });
}


$(document).ready(function () {

    // ===== Task 4: Colorful scroll progress bar =====
    const $bar = $('<div id="scroll-progress"></div>');
    const $label = $('<div id="scroll-progress-label"></div>');
    $("body").prepend($bar).prepend($label);

    function updateProgress() {
        const scrollTop = $(window).scrollTop();
        const scrollable = $(document).height() - $(window).height();
        const percent = scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0;

        $bar.css("width", percent + "%");
        $label.text(Math.round(percent) + "% read");

        if (percent > 1) {
            $label.stop(true).fadeIn(200);
        } else {
            $label.stop(true).fadeOut(200);
        }
    }
    $(window).on("scroll resize", updateProgress);
    updateProgress();


    // ===== Task 1: Real-time search and live filter (Dishes / Drinks) =====
    const $searchInput = $("#menu-search-input");
    const $menuItems = $(".Menumenu");
    const $suggestions = $("#search-suggestions");
    const $searchCount = $("#search-count");

    // Read the item name without the price, e.g. "Spring Rolls - 5" -> "Spring Rolls"
    function itemName($item) {
        return $item.find("span").first().text().split(" - ")[0].trim();
    }

    function filterMenu(term) {
        term = term.trim().toLowerCase();

        // .filter() keeps only the items whose name contains the search term
        const $matches = $menuItems.filter(function () {
            return itemName($(this)).toLowerCase().includes(term);
        });

        $menuItems.hide();
        $matches.show();

        // Open categories that contain matches, hide empty ones
        $("main details").each(function () {
            const $details = $(this);
            const hasMatch = $details.find(".Menumenu").filter($matches).length > 0;

            if (term === "") {
                $details.show().prop("open", false);
            } else {
                $details.toggle(hasMatch).prop("open", hasMatch);
            }
        });

        if (term === "") {
            $searchCount.text("");
        } else if ($matches.length === 0) {
            $searchCount.text('No items match "' + term + '"');
        } else {
            $searchCount.text($matches.length + " item(s) found");
        }
    }


    // ===== Task 2: Autocomplete search suggestions =====
    // Build the suggestion list from the menu itself: name + category
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
            $("<li></li>")
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

        // Scroll to the chosen dish and flash it
        $("html, body").animate({ scrollTop: item.$el.offset().top - 120 }, 400);
        item.$el.css("background-color", "#ffe066")
            .animate({ opacity: 0.4 }, 200).animate({ opacity: 1 }, 200)
            .animate({ opacity: 0.4 }, 200).animate({ opacity: 1 }, 200, function () {
                $(this).css("background-color", "");
            });
    }

    if ($searchInput.length) {
        // Filter in real time as the user types
        $searchInput.on("keyup input", function (e) {
            if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)) return;
            filterMenu($(this).val());
            showSuggestions($(this).val());
        });

        // Keyboard navigation inside the dropdown
        $searchInput.on("keydown", function (e) {
            const $items = $suggestions.find("li").not(".no-results");
            if (!$items.length) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % $items.length;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + $items.length) % $items.length;
            } else if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                chooseSuggestion($items.eq(activeIndex));
                return;
            } else if (e.key === "Escape") {
                $suggestions.hide();
                return;
            } else {
                return;
            }
            $items.removeClass("active").eq(activeIndex).addClass("active");
        });

        $suggestions.on("click", "li", function () {
            chooseSuggestion($(this));
        });

        // Close the dropdown when clicking anywhere else
        $(document).on("click", function (e) {
            if (!$(e.target).closest(".menu-search").length) {
                $suggestions.hide();
            }
        });
    }


    // ===== Task 3: Search highlighting (About page FAQ + text) =====
    const $faqInput = $("#faq-search-input");
    const $faqCount = $("#faq-search-count");

    if ($faqInput.length) {
        // Only plain-text elements, so replacing their HTML can't break nested tags
        const $highlightTargets = $("main").find("h1, h2, h3, p, li, .accordion-header")
            .not(".eyebrow, .search-count")
            .filter(function () {
                return $(this).children().length === 0;
            });

        // Remember the original text of every element
        $highlightTargets.each(function () {
            $(this).data("original-text", $(this).text());
        });

        $faqInput.on("keyup input", function (e) {
            const term = $(this).val().trim();
            let total = 0;

            $highlightTargets.each(function () {
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
                    // .html() + regex: wrap every match in <mark>
                    $el.html(escapeHtml(original).replace(regex, '<mark class="highlight">$1</mark>'));

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

            // Press Enter to jump to the first match
            if (total && e.key === "Enter") {
                $("html, body").animate({ scrollTop: $("mark.highlight").first().offset().top - 150 }, 400);
            }
        });
    }


    // ===== Task 5: Animated number counter =====
    const $stats = $(".stats-section");
    let countersStarted = false;

    function startCounters() {
        if (countersStarted || !$stats.length) return;

        const statsTop = $stats.offset().top;
        const viewBottom = $(window).scrollTop() + $(window).height();
        if (viewBottom < statsTop + 100) return; // not visible yet

        countersStarted = true;
        $(".stat-number").each(function () {
            const $num = $(this);
            const target = parseInt($num.data("target"), 10);
            const suffix = $num.data("suffix") || "";

            // Animate a plain object's property and print it on every step
            $({ value: 0 }).animate({ value: target }, {
                duration: 2200,
                easing: "swing",
                step: function (now) {
                    $num.text(Math.floor(now).toLocaleString("en-US") + suffix);
                },
                complete: function () {
                    $num.text(target.toLocaleString("en-US") + suffix);
                }
            });
        });
    }
    $(window).on("scroll", startCounters);
    startCounters();


    // ===== Task 6: Loading spinner on submit =====
    $("#contact-form").on("submit", function (e) {
        e.preventDefault();
        const $form = $(this);

        if (!validateForm()) {
            showToast("Please fix the highlighted fields.", "error");
            return;
        }

        const $btn = $form.find('button[type="submit"]');
        const originalHtml = $btn.html();

        // Show spinner + "Please wait..." and block repeated clicks
        $btn.prop("disabled", true)
            .html('<span class="spinner"></span>Please wait...');

        const formData = {
            name: $("#name").val(),
            email: $("#email").val(),
            hall: $("#hall").val()
        };

        submitFormAsync(formData, function (error, successMessage) {
            // Back to normal after the simulated server call
            $btn.prop("disabled", false).html(originalHtml);

            const $feedback = $("#form-feedback");
            if (error) {
                $feedback.css({ backgroundColor: "#f8d7da", color: "#721c24" }).text(error).slideDown();
                showToast(error, "error");
                return;
            }

            $feedback.css({ backgroundColor: "#d4edda", color: "#155724" }).text(successMessage).slideDown();
            showToast("Form submitted successfully! See you soon, " + formData.name + ".", "success");
            $form[0].reset();

            // If the form is inside the booking modal (Main page), close it
            $("#booking-modal").removeClass("active");
        });
    });


    // ===== Task 7 (more uses): toasts for other user actions =====
    $(".star").on("click", function () {
        const rating = $(".star").index(this) + 1;
        showToast("Thanks for rating us " + rating + "/5 ★", "info");
    });

    $("#bg-toggle-btn").on("click", function () {
        // Wait for the theme handler to finish, then read the result
        setTimeout(function () {
            const dark = $("body").hasClass("dark-mode");
            showToast(dark ? "Dark theme enabled" : "Light theme enabled", "info", 2000);
        }, 0);
    });

    $("#clear-btn").on("click", function () {
        showToast("Form cleared", "info", 2000);
    });


    // ===== Task 8: Copy to clipboard button =====
    // Old-style copy: select a hidden textarea and run the "copy" command
    function legacyCopy(text) {
        const $temp = $("<textarea>").val(text).css({ position: "fixed", opacity: 0 }).appendTo("body");
        $temp[0].select();
        const ok = document.execCommand("copy");
        $temp.remove();
        return ok ? Promise.resolve() : Promise.reject();
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            // Modern Clipboard API; if the browser refuses, use the fallback
            return navigator.clipboard.writeText(text).catch(function () {
                return legacyCopy(text);
            });
        }
        // Fallback for http:// or file:// pages
        return legacyCopy(text);
    }

    function showCopied($btn) {
        const $icon = $btn.find(".copy-icon");
        const $tooltip = $btn.find(".copy-tooltip");

        $btn.addClass("copied");
        $icon.text("✓");
        $tooltip.stop(true, true).fadeIn(150);

        clearTimeout($btn.data("timer"));
        $btn.data("timer", setTimeout(function () {
            $btn.removeClass("copied");
            $icon.text("⧉");
            $tooltip.fadeOut(200);
        }, 2000));
    }

    $(".copy-btn").on("click", function () {
        const $btn = $(this);
        const text = $btn.siblings(".copy-text").text().trim();

        copyToClipboard(text)
            .then(function () {
                showCopied($btn);
                showToast('"' + text + '" copied to clipboard', "success", 2000);
            })
            .catch(function () {
                showToast("Could not copy, please copy it manually.", "error");
            });
    });

    // .on("copy"): also react when the user selects the snippet and presses Ctrl+C
    $(".copy-text").on("copy", function () {
        showCopied($(this).siblings(".copy-btn"));
        showToast("Copied to clipboard!", "success", 2000);
    });


    // ===== Task 9: Image lazy loading =====
    function lazyLoad() {
        const viewBottom = $(window).scrollTop() + $(window).height();

        $("img.lazy[data-src]").each(function () {
            const $img = $(this);

            // Load the image only once its top edge scrolls into view
            if ($img.offset().top < viewBottom) {
                $img.one("load", function () {
                    $img.removeClass("lazy").css("opacity", 0).animate({ opacity: 1 }, 600);
                }).one("error", function () {
                    $img.removeClass("lazy").css("opacity", 1);
                });

                $img.attr("src", $img.attr("data-src")).removeAttr("data-src");
                console.log("Lazy loaded:", $img.attr("alt"));
            }
        });
    }
    $(window).on("scroll resize", lazyLoad);
    lazyLoad();
});
