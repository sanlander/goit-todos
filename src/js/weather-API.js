import axios from 'axios';
import { refs } from './refs';
import * as VH from './visually-hidden';

class WeatherApi {
  constructor() {
    this.url =
      'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=0edac89fa8ddb494f2ca9f7bf39ae892&lang=ua';
    this.city = 'Cherkasy';
  }

  async fetchWeather() {
    return await axios.get(`${this.url}&q=${this.city}`).then(r => r.data);
  }
}

const weatherApi = new WeatherApi();

function loadingWeather(e) {
  refs.weather.innerHTML = `
        <p class="weather__loading">Loading...</p>
    `;
}
if (refs.weather.innerHTML) {
  loadingWeather();
}

export async function renderWeather() {
    await weatherApi.fetchWeather().then(r => weatherTemplate(r));
}

async function weatherTemplate(r) {
  const logo = r.weather[0].icon;
  const altLogo = r.weather[0].main;
  const description = r.weather[0].description;
  const currentTemp = Math.round(r.main.temp);
  const feelsLike = Math.round(r.main.feels_like);
  const tempMin = Math.round(r.main.temp_min);
  const tempMax = Math.round(r.main.temp_max);
  const humidity = Math.round(r.main.humidity);
  const speed = r.wind.speed.toFixed(1);

  const template = `
          <p class="weather__title">Черкаси, UA
          <img width="75" class="weather__logo" src="http://openweathermap.org/img/wn/${logo}@2x.png" alt="${altLogo}">
          </p>
          <p class="weather__description">${description}</p>
          <p class="weather__city-temp">${currentTemp}°C</p>
          <p class="weather__feels-like">Відчувається, як <span class="weather__feels-like-temp">${feelsLike}°C</span></p>
          <p class="weather__min-max">min:&nbsp<span class="weather__t-min">${tempMin}°C</span>&nbsp &nbsp max:&nbsp<span class="weather__t-max">${tempMax}°C</span></p>
          <p class="weather__humidity">Вологість &nbsp<span class="weather__humidity-value">${humidity}%</span></p>
          <p class="weather__speed">Швидкість вітру &nbsp<span class="weather__speed-value">${speed} м/с</span></p>
      `;

  refs.weather.innerHTML = template;
}
