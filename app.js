const cityInput=document.querySelector(".city-input");
const searchButton=document.querySelector(".search-btn");
const locationButton=document.querySelector(".location-btn");
const currentWeatherDiv=document.querySelector(".current-weather");
const weatherCardsDiv=document.querySelector(".weather-cards");

const API_kEY="7d49243ef0b77319dde69ac500591625";//free openweather map api key to access accurate data
const createWeatherCard=(cityName,weatherItem,index)=>{
    if(index===0){//HTML for the main weather card
        return `<div class="details">

                <h2>${cityName}(${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Humidity:${weatherItem.main.humidity}%</h4>
                <h4>Wind:${weatherItem.wind.speed}km/h</h4>
            </div>

             <div class="icon">
                <img src=" https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    }
    else{
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src=" https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Humidity:${weatherItem.main.humidity}%</h4>
                <h4>Wind:${weatherItem.wind.speed}km/h</h4>
                </li>`;
    }
    
}

const getWeatherDetails=(cityName,lat,lon)=>{
    //5 days forecast for particular coordinates using openweathermap api
  const WEATHER_API_URL=`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_kEY}`; 

  fetch(WEATHER_API_URL).then(res=>res.json()).then(data=>{
    const uniqueForecastDays=[];
    
    
//filtering the data to obtain from every 3 hours to 5 days forecast
//dt_txt is used for date and time human readable
    const fiveDaysForecast=data.list.filter(forecast=>{
        const forecastDate=new Date(forecast.dt_txt).getDate();
        if(!uniqueForecastDays.includes(forecastDate)){
            return uniqueForecastDays.push(forecastDate);
        }
    });
    //clear previous weather data
    cityInput.value="";
    currentWeatherDiv.innerHTML="";
    weatherCardsDiv.innerHTML="";

    //creating weathe cards and adding them to the DOM
    fiveDaysForecast.forEach((weatherItem,index)=>{
        //making the data to display on main weather card
        if(index===0){
            currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));
        }
        else{
            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));
        }
       
       
    });
  }).catch(()=>{
    alert("An error occured while fetching the feather forecast!");
});
}

const getCityCoordinates=()=>{
    const cityName=cityInput.value.trim();//get user entered city name and remove extra space
    if(!cityName) return;//return if cityname is empty

    //entering city coordinates using opean weather map api
    const GEOCODING_API_URL=`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_kEY}`;
    //fetch retrives the data from api and return promise
    //json convert the response in usable javascript object
    fetch(GEOCODING_API_URL).then(res=>res.json()).then(data=>{
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const{name,lat,lon}=data[0];
        getWeatherDetails(name,lat,lon);//get enterd city coordinate(lat,lon,name) from api response
    }).catch(()=>{
        alert("An error occured while fetching the coordinates!");
    });

}

const getUserCoordinates=()=>{
    navigator.geolocation.getCurrentPosition(
        Position =>{
           const {latitude,longitude}=Position.coords;
           const REVERSE_GEOCODING_URL=`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_kEY}`;
//get city name from coordinates using reverse geocoding api
           fetch(REVERSE_GEOCODING_URL).then(res=>res.json()).then(data=>{
            const{name}=data[0];
            getWeatherDetails(name,latitude,longitude);
        }).catch(()=>{
            alert("An error occured while fetching the city!");
        });
        },
        error=>{
            if(error.code ===error.PERMISSION_DENIED){
                alert("Geolocation request denied.Please reset location to grant access again.")
            }
        }
    );
}

locationButton.addEventListener("click",getUserCoordinates);
searchButton.addEventListener("click",getCityCoordinates);
cityInput.addEventListener("keyup",e=>e.key === "Enter" && getCityCoordinates());