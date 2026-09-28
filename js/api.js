import { CONFIG } from "./config.js";


/* ================= FETCH HELPER ================= */

async function fetchJSON(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`
        );
    }

    return await response.json();
}


/* ================= GEOCODING ================= */

export async function searchCities(city) {

    const url = new URL(CONFIG.GEOCODING_URL);

    url.searchParams.set("name", city);
    url.searchParams.set("count", "6");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const data = await fetchJSON(url);

    return data.results || [];
}


/* ================= WEATHER ================= */

export async function getWeather(
    latitude,
    longitude,
    unit = "celsius"
) {

    const url = new URL(CONFIG.WEATHER_URL);

    url.searchParams.set(
        "latitude",
        latitude
    );

    url.searchParams.set(
        "longitude",
        longitude
    );

    url.searchParams.set(
        "current",
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "is_day"
        ].join(",")
    );

    url.searchParams.set(
        "hourly",
        [
            "temperature_2m",
            "precipitation_probability",
            "weather_code",
            "wind_speed_10m"
        ].join(",")
    );

    url.searchParams.set(
        "daily",
        [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "sunrise",
            "sunset",
            "precipitation_probability_max"
        ].join(",")
    );

    url.searchParams.set(
        "temperature_unit",
        unit
    );

    url.searchParams.set(
        "wind_speed_unit",
        "kmh"
    );

    url.searchParams.set(
        "timezone",
        "auto"
    );

    url.searchParams.set(
        "forecast_days",
        "7"
    );

    return await fetchJSON(url);
}
