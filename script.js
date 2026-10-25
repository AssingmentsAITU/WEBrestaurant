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
            bookatablebtn.innerHTML = isToggled ?  message  : originalText;
        }
        );
    }
});

// Rating stars
const stars = document.querySelectorAll(".star");

stars.forEach((star, index) => {
    star.addEventListener("click", function() {
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
    }, 600);
}

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page refresh

        if (validateForm()) {
            const formData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                hall: document.getElementById("hall").value
            };

            // Callback function passed as the second argument
            submitFormAsync(formData, function (error, successMessage) {
                const feedbackEl = document.getElementById("form-feedback");
                
                if (feedbackEl) {
                    feedbackEl.style.display = "block";
                    if (error) {
                        feedbackEl.style.backgroundColor = "#f8d7da";
                        feedbackEl.style.color = "#721c24";
                        feedbackEl.textContent = error;
                    } else {
                        feedbackEl.style.backgroundColor = "#d4edda";
                        feedbackEl.style.color = "#155724";
                        feedbackEl.textContent = successMessage;
                        contactForm.reset();
                    }
                }
            });
        }
    });
}

// 1 yuzu object
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const date = new Date();
const yuzuRestaurant = {
    
    name: "Yuzu Kitchen",
    location: "Astana, Mangilik El Ave.",
    currentDay: weekday[date.getDay()],

    isOpenNow: function () {
        const currentHour = date.getHours;
        switch (this.currentDay) {
            case "Monday" || "Tuesday" || "Wednesday" || "Thursday":
                return currentHour >= 10 && currentHour < 23;
            case "Friday":
                return currentHour >= 10 && currentHour < 0;
            case "Saturday":
                return currentHour >= 11 && currentHour < 0;
            case "Sunday":
                return currentHour >= 11 && currentHour < 22;
        }
    },
    
    getStatusMessage: function () {
        if (this.isOpenNow) {
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
    { name: "Yuzu Glazed Salmon", price: "$18", description: "Fresh salmon with citrus reduction", image_src: "/images/glazed-salmon.jpg"},
    { name: "Matcha Pork Ramen", price: "$15", description: "Rich broth with handmade noodles", image_src: "/images/matcha-pork-ramen.webp"},
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

