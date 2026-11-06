/* =====================================================================
   Yuzu Kitchen — theme loader
   ---------------------------------------------------------------------
   This tiny script is loaded in <head>, before the page is drawn.
   It reads the saved theme from localStorage and applies it right away,
   so a page never "flashes" light before switching to dark.
   The switch button itself is handled in js/script.js.
   ===================================================================== */
(function () {
    var theme = null;

    try {
        theme = localStorage.getItem("yuzuTheme");

        // Older versions of the site stored the theme as "userThemeIndex" ("1" = dark)
        if (theme === null && localStorage.getItem("userThemeIndex") !== null) {
            theme = localStorage.getItem("userThemeIndex") === "1" ? "dark" : "light";
        }
    } catch (error) {
        // localStorage can be blocked (private mode); fall back to the system setting
    }

    // No saved choice yet: follow the operating system's light/dark setting
    if (theme === null && window.matchMedia) {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
})();
