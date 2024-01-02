const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const popupInnerHtml = document.getElementsByClassName("description-popup")[0];
const popup = document.getElementsByClassName("popup")[0];
const dismiss_btn = document.getElementById("dismiss-popup-btn");
const API_KEY = "65a043012648c35d6df8e9c2c45b0116";
// API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
  var date =
    weatherItem.dt_txt.split(" ")[0]; /* Reformatting the dates to be shown*/
  var dArr = date.split("-");
  var mon = dArr[1];
  var properdate = dArr[2] + "/" + dArr[1] + "/" + dArr[0].substring(2);
  // Converting the month to text
  switch (mon) {
    case "01":
      var month = "Jan";
      break;
    case "02":
      var month = "Feb";
      break;
    case "03":
      var month = "Mar";
      break;
    case "04":
      var month = "Apr";
      break;
    case "05":
      var month = "May";
      break;
    case "06":
      var month = "Jun";
      break;
    case "07":
      var month = "Jul";
      break;
    case "08":
      var month = "Aug";
      break;
    case "09":
      var month = "Sept";
      break;
    case "10":
      var month = "Oct";
      break;
    case "11":
      var month = "Nov";
      break;
    case "12":
      var month = "Dec";
      break;
  }
  var properdate = dArr[2] + " " + month;
  /* External applied images shown according to weather description. */
  function weathericon(weather_desc) {
    var ans = "";
    switch (weather_desc) {
      case "clear sky":
        ans = "complete-clear.png";
        break;
      case "few clouds":
        ans = "partly-cloudy.png";
        break;
      case "scattered clouds":
      case "broken clouds":
        ans = "scatter-clouds.png";
        break;
      case "overcast clouds":
        ans = "overcast.png";
        break;
      case "mist":
      case "fog":
        ans = "mist.png";
        break;
      case "light rain":
      case "drizzle":
      case "moderate rain":
        ans = "light-rain.png";
        break;
      case "rain":
      case "heavy rain":
        ans = "rain.png";
        break;
      case "snow":
      case "heavy snow":
      case "hail":
        ans = "snow.png";
        break;
      case "thunderstorm":
        ans = "thunderstorm.png";
        break;
      default:
        ans = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png`;
        break;
    }
    return ans;
  }

  if (index === 0) {
    // HTML for the main weather card

    return `<div class="details">
                    <h2 class="city">${cityName}</h2> 
                    <h2 class = "date">${properdate}</h2>
                </div>
                <div class="icon">
                    <img src=${weathericon(
                      weatherItem.weather[0].description
                    )} alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                      1
                    )}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>`;
  } else {
    // HTML for the other four day forecast card
    return `<li class="card">
    <div class="first-div">
                    <h3>${properdate}</h3>
                    <h5>${(weatherItem.main.temp - 273.15).toFixed(1)}°C</h5>
                    </div>
                    <img src=${weathericon(
                      weatherItem.weather[0].description
                    )} alt="weather-icon">
                    <span class="description">${
                      weatherItem.weather[0].description
                    }</span>
                    <h6><img class="card-icon" src="wind.png" /> ${
                      weatherItem.wind.speed
                    } M/S</h6>
                    <h6><img class="card-icon" src="blood-drop.png" /> ${
                      weatherItem.main.humidity
                    }%</h6>
                    
                </li>`;
  }
};

/* Fetching Weather data from OpenWeather API by using longitude, latitude and CityName */
const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=32&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      // Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fourDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clearing previous weather data (emptying cards and input box)
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Creating weather cards and adding them to the DOM
      fourDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
      popupInnerHtml.innerHTML = `An internal error occured while fetching the weather forecast. Please try after some time.`;
      popup.classList.add("active");
      console.error("API failed to bring weather forecast data.");
    });
};

/* Function to get city co-ordinates by the city name given by user */
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  // Fetching entered city coordinates (latitude, longitude, and name) from the API response
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) {
        popupInnerHtml.innerHTML = `There does not exist a city with the name ${cityName}. Please enter a valid city name.`;
        popup.classList.add("active");
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        console.error("User enterred invalid city name.");
        return;
      }

      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
      createChart(lon, lat);
    })
    .catch(() => {
      popupInnerHtml.innerHTML = `An itnernal error occurred while fetching the coordinates for ${cityName}. Please try again after some time.`;
      popup.classList.add("active");
      console.error("API Failed to fetch city co-ordinates");
    });
};
/* Function to get User co-ordinates by user location */
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords; // Get coordinates of user location
      // Getting the city co-ordinates by location using reverse geocoding API
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
          createChart(longitude, latitude);
        })
        .catch(() => {
          popupInnerHtml.innerHTML = `An internal error occured while fetching the City Name.`;
          popup.classList.add("active");
          console.error("API error while fetching city name by geolocation.");
          return;
        });
    },
    (error) => {
      // Show Error popup if user denied the location permission
      if (error.code === error.PERMISSION_DENIED) {
        popupInnerHtml.innerHTML = `Geolocation request denied. Please reset location permission to grant access again.`;
        popup.classList.add("active");
        console.error("Geolocation Denied by User");
      } else {
        popupInnerHtml.innerHTML = `Geolocation request error. Please reset location permission.`;
        popup.classList.add("active");
        console.error("Geolocation not provided.");
      }
    }
  );
};

/* Create a chart for next 24 Hours*/
const createChart = (lon, lat) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=40&appid=${API_KEY}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      handleForecastData(data.list);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

/* Extracting the data that came as a response from API*/
function handleForecastData(forecastData) {
  const timestamps = forecastData.map((item) => new Date(item.dt * 1000));
  const temperatures = forecastData.map((item) => item.main.temp - 273.15);
  timestamps.length = 8; // length trimmed to 8 so that only 24 hours data is kept.
  const reformattedDates = timestamps.map(reformatDate);

  // Calling a function to create the chart
  createForecastChart(reformattedDates, temperatures);
}

/* Creating Chart using chart js by data accumulated by API */
async function createForecastChart(timestamps, temperatures) {
  const ctx = document.getElementById("forecastChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: timestamps,
      datasets: [
        {
          label: `24 Hour Temperature (°C)`,
          data: temperatures,
          borderColor: "rgba(0, 118, 155,0.9)",
          backgroundColor: "rgba(0, 118, 155,0.1)",
          borderWidth: 4,
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            stepSize: 3, // Show labels every 3 hours
            displayFormats: {
              hour: "HH:mm",
            },
          },
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

/* Remofrmatting dates revieved from the API to create chart*/
function reformatDate(date) {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  return `${hour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);

//Fetching Default data whenever the user loads the page.
window.onload = getWeatherDetails("Indore", 22.7203616, 75.8681996);
window.onload = createChart(75.8681996, 22.7203616);

//For closing the error popup if it opens.
dismiss_btn.addEventListener("click", () => {
  document.getElementsByClassName("popup")[0].classList.remove("active");
});
