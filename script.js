function validateForm() {
    let isValid = true;

    clearErrors();

    
    const form = document.forms["book-form"];
    const nameInput = form["name"];
    const emailInput = form["email"];
    const hallSelect = form["hall"];

    const nameValue = nameInput.value.trim();
    if (nameValue === "") {
        showError(nameInput, "Please enter your name.");
        isValid = false;
    } else if (nameValue.length < 2) {
        showError(nameInput, "Name must be at least 2 characters long.");
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
    { bg: "#E2E8D5", sand: "#F2F5ED", card: "#CCD8B8" }, // Sage/Jade
    { bg: "#D9E2EC", sand: "#F0F4F8", card: "#BCCCDC" }, // Slate Blue
    { bg: "#F3E8EE", sand: "#FAF0F5", card: "#E7D3DF" }, // Soft Plum
    { bg: "#2B2016", sand: "#3B2A20", card: "#1F1812" }  // Dark Mode
];

let currentPaletteIndex = 0;

// Function to apply a theme index to CSS variables
function applyTheme(index) {
    const theme = colorPalettes[index];
    const root = document.documentElement;

    root.style.setProperty("--color-bg", theme.bg);
    root.style.setProperty("--color-sand", theme.sand);
    root.style.setProperty("--color-bg-card", theme.card);

    if (theme.bg === "#2B2016") {
        root.style.setProperty("--color-ink", "#F7F1E6");
        root.style.setProperty("--color-wood", "#EFE6D6");
    } else {
        root.style.setProperty("--color-ink", "#2B2016");
        root.style.setProperty("--color-wood", "#3B2A20");
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
    let message = "Hello :)";
    if (bookatablebtn) {
        bookatablebtn.addEventListener("click", function() {
            bookatablebtn.innerHTML = message;
        }
    );
    }
});