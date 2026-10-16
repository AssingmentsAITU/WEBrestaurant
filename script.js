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

// Palette of background combinations matching your site's CSS variables
const colorPalettes = [
    { bg: "#EFE6D6", sand: "#FAF7F2", card: "#E3D2B8" }, // Original Warm Cream
    { bg: "#E2E8D5", sand: "#F2F5ED", card: "#CCD8B8" }, // Sage/Jade
    { bg: "#D9E2EC", sand: "#F0F4F8", card: "#BCCCDC" }, // Slate Blue
    { bg: "#F3E8EE", sand: "#FAF0F5", card: "#E7D3DF" }, // Soft Plum
    { bg: "#2B2016", sand: "#3B2A20", card: "#1F1812" }  // Dark Mode
];

let currentPaletteIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("booking-modal");
    const openBtn = document.getElementById("open-modal-btn");
    const closeBtn = document.getElementById("close-modal-btn");

    // 1. Open popup when "Reserve a Table" button is clicked
    if (openBtn && modal) {
        openBtn.addEventListener("click", function (event) {
            event.preventDefault();
            modal.classList.add("active");
        });
    }

    // 2. Close popup when 'X' button is clicked
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", function () {
            modal.classList.remove("active");
        });
    }

    // 3. Close popup when clicking outside the modal box on the dark background
    if (modal) {
        window.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.classList.remove("active");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const bgBtn = document.getElementById("bg-toggle-btn");

    if (!bgBtn) {
        console.error("Button with id='bg-toggle-btn' was not found in the HTML.");
        return;
    }

    bgBtn.addEventListener("click", function () {
        // Cycle to next palette
        currentPaletteIndex = (currentPaletteIndex + 1) % colorPalettes.length;
        const theme = colorPalettes[currentPaletteIndex];

        // Change the root CSS variables so all sections update
        const root = document.documentElement;
        root.style.setProperty("--color-bg", theme.bg);
        root.style.setProperty("--color-sand", theme.sand);
        root.style.setProperty("--color-bg-card", theme.card);

        // Optional: invert text color if switching to dark mode
        if (theme.bg === "#2B2016") {
            root.style.setProperty("--color-ink", "#F7F1E6");
            root.style.setProperty("--color-wood", "#EFE6D6");
        } else {
            root.style.setProperty("--color-ink", "#2B2016");
            root.style.setProperty("--color-wood", "#3B2A20");
        }
    });
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

const now = new Date();
const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
};
const dateTimeEl = document.getElementById('date-time');
if (dateTimeEl) {
    dateTimeEl.textContent = now.toLocaleDateString("en-US", options);
}