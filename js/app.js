import { CONFIG } from "./config.js";

import {
    searchCities,
    getWeather
} from "./api.js";

import {
    renderCurrent,
    renderHourly,
    renderDaily,
    renderSun,
    renderHistory,
    renderSuggestions,
    showLoading,
    showError,
    hideError
} from "./ui.js";


/* =========================================================
   STATE
   ========================================================= */

let selectedUnit =
    localStorage.getItem(
        CONFIG.UNIT_KEY
    ) || "celsius";

let history =
    JSON.parse(
        localStorage.getItem(
            CONFIG.HISTORY_KEY
        ) || "[]"
    );


/* =========================================================
   DOM
   ========================================================= */

const cityInput =
    document.getElementById(
        "cityInput"
    );

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

const unitToggle =
    document.getElementById(
        "unitToggle"
    );

const themeToggle =
    document.getElementById(
        "themeToggle"
    );

const clearHistoryBtn =
    document.getElementById(
        "clearHistory"
    );

const suggestions =
    document.getElementById(
        "suggestions"
    );


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTheme();

        updateUnitButton();

        renderHistory(
            history,
            city => loadCityByName(city)
        );

        loadCityByName(
            CONFIG.DEFAULT_CITY
        );

    }
);


/* =========================================================
   SEARCH CITY
   ========================================================= */

searchBtn.addEventListener(
    "click",
    () => {

        const city =
            cityInput.value.trim();

        if (!city) {

            showError(
                "Please enter a city name."
            );

            return;
        }

        loadCityByName(city);
    }
);


/* =========================================================
   ENTER KEY SEARCH
   ========================================================= */

cityInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            const city =
                cityInput.value.trim();

            if (city) {
                loadCityByName(city);
            }
        }
    }
);


/* =========================================================
   CITY AUTOCOMPLETE
   ========================================================= */

let searchTimer;

cityInput.addEventListener(
    "input",
    () => {

        clearTimeout(searchTimer);

        const value =
            cityInput.value.trim();

        if (value.length < 2) {

            suggestions.classList.remove(
                "show"
            );

            return;
        }

        searchTimer =
            setTimeout(
                async () => {

                    try {

                        const results =
                            await searchCities(
                                value
                            );

                        renderSuggestions(
                            results,
                            place => {

                                cityInput.value =
                                    place.name;

                                loadLocation(
                                    place
                                );
                            }
                        );

                    } catch (error) {

                        console.error(
                            error
                        );

                    }

                },
                350
            );
    }
);


/* =========================================================
   LOAD CITY BY NAME
   ========================================================= */

async function loadCityByName(
    cityName
) {

    try {

        hideError();

        showLoading(true);

        const results =
            await searchCities(
                cityName
            );

        if (!results.length) {

            throw new Error(
                "City not found. Please check the spelling."
            );
        }

        const city =
            results[0];

        cityInput.value =
            city.name;

        await loadLocation(
            city
        );

    } catch (error) {

        showError(
            error.message ||
            "Unable to find this city."
        );

    } finally {

        showLoading(false);

    }
}


/* =========================================================
   LOAD WEATHER
   ========================================================= */

async function loadLocation(
    city
) {

    try {

        hideError();

        showLoading(true);

        const weather =
            await getWeather(
                city.latitude,
                city.longitude,
                selectedUnit
            );

        renderCurrent(
            city,
            weather,
            selectedUnit
        );

        renderHourly(
            weather.hourly,
            selectedUnit
        );

        renderDaily(
            weather.daily
        );

        renderSun(
            weather.daily
        );

        addToHistory(
            city.name
        );

    } catch (error) {

        console.error(error);

        showError(
            "Unable to fetch weather data. Please check your internet connection and try again."
        );

    } finally {

        showLoading(false);

    }
}


/* =========================================================
   HISTORY
   ========================================================= */

function addToHistory(
    city
) {

    history =
        history.filter(
            item =>
                item.toLowerCase() !==
                city.toLowerCase()
        );

    history.unshift(city);

    history =
        history.slice(0, 6);

    localStorage.setItem(
        CONFIG.HISTORY_KEY,
        JSON.stringify(history)
    );

    renderHistory(
        history,
        cityName =>
            loadCityByName(cityName)
    );
}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

clearHistoryBtn.addEventListener(
    "click",
    () => {

        history = [];

        localStorage.removeItem(
            CONFIG.HISTORY_KEY
        );

        renderHistory(
            history,
            city => loadCityByName(city)
        );

    }
);


/* =========================================================
   UNIT TOGGLE
   ========================================================= */

unitToggle.addEventListener(
    "click",
    async () => {

        selectedUnit =
            selectedUnit === "celsius"
                ? "fahrenheit"
                : "celsius";

        localStorage.setItem(
            CONFIG.UNIT_KEY,
            selectedUnit
        );

        updateUnitButton();

        const city =
            cityInput.value.trim() ||
            CONFIG.DEFAULT_CITY;

        await loadCityByName(city);

    }
);


function updateUnitButton() {

    unitToggle.textContent =
        selectedUnit === "celsius"
            ? "°C"
            : "°F";
}


/* =========================================================
   THEME
   ========================================================= */

themeToggle.addEventListener(
    "click",
    () => {

        const isDark =
            document.body.classList.toggle(
                "dark"
            );

        localStorage.setItem(
            CONFIG.THEME_KEY,
            isDark
                ? "dark"
                : "light"
        );

        themeToggle.textContent =
            isDark
                ? "☀"
                : "☾";

    }
);


function initializeTheme() {

    const savedTheme =
        localStorage.getItem(
            CONFIG.THEME_KEY
        );

    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeToggle.textContent =
            "☀";

    } else {

        themeToggle.textContent =
            "☾";
    }
}


/* =========================================================
   QUICK CITY BUTTONS
   ========================================================= */

document
    .querySelectorAll(".city-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const city =
                    button.dataset.city;

                cityInput.value =
                    city;

                loadCityByName(city);

            }
        );

    });


/* =========================================================
   CLOSE SUGGESTIONS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".search-box"
            )
        ) {

            suggestions.classList.remove(
                "show"
            );
        }

    }
);
