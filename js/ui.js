/* =========================================================
   WEATHER CODE INFORMATION
   Open-Meteo WMO Weather Codes
   ========================================================= */

export function getWeatherInfo(code) {

    if (code === 0) {
        return {
            condition: "Clear Sky",
            icon: "clear.svg"
        };
    }

    if (code === 1 || code === 2) {
        return {
            condition: "Partly Cloudy",
            icon: "partly-cloudy.svg"
        };
    }

    if (code === 3) {
        return {
            condition: "Cloudy",
            icon: "cloudy.svg"
        };
    }

    if (
        code === 45 ||
        code === 48
    ) {
        return {
            condition: "Foggy",
            icon: "fog.svg"
        };
    }

    if (
        code >= 51 &&
        code <= 67
    ) {
        return {
            condition: "Rain",
            icon: "rain.svg"
        };
    }

    if (
        code >= 71 &&
        code <= 77
    ) {
        return {
            condition: "Snow",
            icon: "snow.svg"
        };
    }

    if (
        code >= 80 &&
        code <= 82
    ) {
        return {
            condition: "Rain Showers",
            icon: "rain.svg"
        };
    }

    if (
        code >= 95
    ) {
        return {
            condition: "Thunderstorm",
            icon: "storm.svg"
        };
    }

    return {
        condition: "Unknown Weather",
        icon: "cloudy.svg"
    };
}


/* ================= IMAGE PATH ================= */

export function weatherIcon(code) {

    const info = getWeatherInfo(code);

    return `assets/weather/${info.icon}`;
}


/* ================= FORMAT TIME ================= */

export function formatTime(dateTime) {

    const date = new Date(dateTime);

    return date.toLocaleTimeString(
        [],
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* ================= FORMAT DAY ================= */

export function formatDay(dateString, index) {

    if (index === 0) {
        return "Today";
    }

    const date = new Date(
        `${dateString}T12:00:00`
    );

    return date.toLocaleDateString(
        [],
        {
            weekday: "short"
        }
    );
}


/* ================= RENDER CURRENT ================= */

export function renderCurrent(
    city,
    weather,
    unit
) {

    const current = weather.current;

    const info = getWeatherInfo(
        current.weather_code
    );

    document.getElementById("cityName").textContent =
        city.name;

    document.getElementById("locationDetails").textContent =
        [
            city.admin1,
            city.country
        ]
            .filter(Boolean)
            .join(", ");

    document.getElementById("currentTemp").textContent =
        Math.round(current.temperature_2m);

    document.getElementById("condition").textContent =
        info.condition;

    document.getElementById("feelsLike").textContent =
        `${Math.round(current.apparent_temperature)}°`;

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    document.getElementById("rain").textContent =
        `${current.rain ?? 0} mm`;

    const icon =
        document.getElementById("mainWeatherIcon");

    icon.src =
        weatherIcon(current.weather_code);

    icon.alt =
        info.condition;

    renderInsight(current);
}


/* ================= INSIGHT ================= */

function renderInsight(current) {

    const box =
        document.getElementById(
            "weatherInsight"
        );

    const temperature =
        current.temperature_2m;

    const humidity =
        current.relative_humidity_2m;

    const rain =
        current.rain ?? 0;

    const wind =
        current.wind_speed_10m;

    let message =
        "Weather conditions look comfortable right now.";

    if (rain > 5) {

        message =
            "Heavy rainfall is currently reported. Consider carrying an umbrella and avoid unnecessary outdoor travel.";

    } else if (rain > 0) {

        message =
            "Rain is currently reported. An umbrella may be useful if you are heading outside.";

    } else if (temperature >= 35) {

        message =
            "It is quite hot right now. Stay hydrated and avoid prolonged exposure to direct sunlight.";

    } else if (temperature <= 18) {

        message =
            "Temperatures are relatively cool. A light jacket may be useful outdoors.";

    } else if (humidity >= 80) {

        message =
            "Humidity is high. The weather may feel warmer and more uncomfortable than the temperature suggests.";

    } else if (wind >= 35) {

        message =
            "Strong winds are currently reported. Be careful around exposed outdoor areas.";

    }

    box.textContent = message;
}


/* ================= HOURLY ================= */

export function renderHourly(
    hourly,
    unit
) {

    const container =
        document.getElementById(
            "hourlyContainer"
        );

    container.innerHTML = "";

    const currentHour =
        new Date().getHours();

    let startIndex =
        hourly.time.findIndex(
            time => new Date(time).getHours() === currentHour
        );

    if (startIndex < 0) {
        startIndex = 0;
    }

    for (
        let i = startIndex;
        i < Math.min(startIndex + 12, hourly.time.length);
        i++
    ) {

        const time =
            formatTime(hourly.time[i]);

        const temp =
            Math.round(
                hourly.temperature_2m[i]
            );

        const rain =
            hourly.precipitation_probability[i] ?? 0;

        const code =
            hourly.weather_code[i];

        const card =
            document.createElement("div");

        card.className =
            "hour-card";

        card.innerHTML = `

            <div class="hour-time">
                ${time}
            </div>

            <img
                src="${weatherIcon(code)}"
                alt="${getWeatherInfo(code).condition}"
            >

            <div class="hour-temp">
                ${temp}°
            </div>

            <div class="hour-rain">
                💧 ${rain}% rain
            </div>

        `;

        container.appendChild(card);
    }
}


/* ================= DAILY ================= */

export function renderDaily(
    daily
) {

    const container =
        document.getElementById(
            "dailyContainer"
        );

    container.innerHTML = "";

    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const code =
            daily.weather_code[i];

        const info =
            getWeatherInfo(code);

        const card =
            document.createElement("div");

        card.className =
            "day-card";

        card.innerHTML = `

            <div>

                <div class="day-name">
                    ${formatDay(
                        daily.time[i],
                        i
                    )}
                </div>

                <div class="day-date">
                    ${daily.time[i]}
                </div>

            </div>


            <div class="day-weather">

                <img
                    src="${weatherIcon(code)}"
                    alt="${info.condition}"
                >

                <span class="day-condition">
                    ${info.condition}
                </span>

            </div>


            <div class="day-temp">

                ${Math.round(
                    daily.temperature_2m_max[i]
                )}°

                /

                ${Math.round(
                    daily.temperature_2m_min[i]
                )}°

            </div>


            <div class="day-rain">

                💧
                ${daily.precipitation_probability_max[i] ?? 0}%

            </div>

        `;

        container.appendChild(card);
    }
}


/* ================= SUN ================= */

export function renderSun(
    daily
) {

    document.getElementById(
        "sunrise"
    ).textContent =
        formatTime(daily.sunrise[0]);

    document.getElementById(
        "sunset"
    ).textContent =
        formatTime(daily.sunset[0]);
}


/* ================= HISTORY ================= */

export function renderHistory(
    history,
    onSelect
) {

    const container =
        document.getElementById(
            "historyContainer"
        );

    container.innerHTML = "";

    if (!history.length) {

        container.innerHTML =
            `<span class="history-item">
                No recent searches
            </span>`;

        return;
    }

    history.forEach(city => {

        const button =
            document.createElement("button");

        button.className =
            "history-item";

        button.textContent =
            city;

        button.addEventListener(
            "click",
            () => onSelect(city)
        );

        container.appendChild(button);
    });
}


/* ================= SUGGESTIONS ================= */

export function renderSuggestions(
    results,
    onSelect
) {

    const container =
        document.getElementById(
            "suggestions"
        );

    container.innerHTML = "";

    if (!results.length) {

        container.classList.remove("show");

        return;
    }

    results.forEach(place => {

        const button =
            document.createElement("button");

        button.className =
            "suggestion-item";

        button.textContent =
            [
                place.name,
                place.admin1,
                place.country
            ]
                .filter(Boolean)
                .join(", ");

        button.addEventListener(
            "click",
            () => {

                onSelect(place);

                container.classList.remove(
                    "show"
                );
            }
        );

        container.appendChild(button);
    });

    container.classList.add("show");
}


/* ================= LOADING ================= */

export function showLoading(
    visible
) {

    document
        .getElementById("loading")
        .classList.toggle(
            "hidden",
            !visible
        );
}


/* ================= ERROR ================= */

export function showError(
    message
) {

    document
        .getElementById("errorBox")
        .classList.remove("hidden");

    document
        .getElementById("errorMessage")
        .textContent =
        message;
}


export function hideError() {

    document
        .getElementById("errorBox")
        .classList.add("hidden");
}
