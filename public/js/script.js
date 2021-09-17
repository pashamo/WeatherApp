/*
API key: config.OLD_KEY || config.WM_KEY

CURRENT WEATHER DATA URL:
api.openweathermap.org/data/2.5/weather?q={city name}&appid={your api key}
api.openweathermap.org/data/2.5/weather?q={city name},{state}&appid={your api key}
api.openweathermap.org/data/2.5/weather?q={city name},{state},{country code}&appid={your api key}

5DAY/3HOUR FORECAST DATA URL:
api.openweathermap.org/data/2.5/forecast?q={city name}&appid={your api key}
api.openweathermap.org/data/2.5/forecast?q={city name},{state}&appid={your api key}
api.openweathermap.org/data/2.5/forecast?q={city name},{state},{country code}&appid={your api key}

WEATHER ICON CODES:
http://openweathermap.org/img/wn/{weather.icon}@2x.png

WEATHER MAP URL:
https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}
layer=(clouds_new, precipitation_new, pressure_new, wind_new, temp_new)
z=zoom (use lvl 7)
x=number of x tile coordinate
y=number of y tile coordinate
*/

$(function() {

  const week = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat"
  }

  let apiKey;
  $.getJSON("./js/config.json", function(data) {
    apiKey = data.WM_KEY;
    getCurrentWeather();
  });
  let oldCity = "Brampton";
  let city = "Brampton";
  let listOfCities;
  let listOfCountries;
  let userOptions = [];
  let currenturl = "https://api.openweathermap.org/data/2.5/weather";
  let forecasturl = "https://api.openweathermap.org/data/2.5/forecast";
  let wmdata = {
    layer: "clouds_new/",
    z: "6/",
    x: "0/",
    y: "0"
  }

  let wmurl = "https://tile.openweathermap.org/map/"+wmdata.layer+wmdata.z+wmdata.x+wmdata.y+".png";
  const selectors = {
    f: {
      unitFormat:"imperial",
      windSpeed: "mph",
      temperature: "&#8457;",
      pressure: "hpa",
      vis: "mi"
    },
    c: {
      unitFormat:"metric",
      windSpeed: "km/h",
      temperature: "&#8451;",
      pressure: "hpa",
      vis: "km"
    }
  };
  let units = selectors.c;


  readFiles();
  getCurrentWeather();
  getHourlyWeather();

  $(".otherForecasts ul li").each(function(index) {
    if (index%2 == 1) {
      $(this).hide();
    }
    $("#note").hide();
  });


  //Add event listener for unit selection - triggering data change
  $(".otherForecasts ul li").on("click", function() {
    let indexVal = $(this).index();
    if (indexVal%2 == 0) {
      if(indexVal == 4) {
        if($(this).next().is(":hidden")) {
          $(this).removeClass("lastItem");
          $(this).next().addClass("lastItem");
        } else {
          $(this).addClass("lastItem");
          $(this).next().removeClass("lastItem");
        }
      }
      $(this).next().slideToggle(500);
    }
    if($(this).index() == 4) {

    }
  });


  $(".unitSelector ul li").on("click", function() {
    console.log($(this).attr('id'));
    if ($(this).attr('id') == "c") {
      units = selectors.c;
      $(this).addClass("current");
      $(this).next().removeClass("current");
    } else {
      units = selectors.f;
      $(this).addClass("current");
      $(this).prev().removeClass("current");
    }

    getCurrentWeather();
    getHourlyWeather();
  });

  $("#searchButton").on("click", function(e) {
    e.preventDefault();
    let tempCity = $("#citySearch").val();
    if (tempCity.length != 0) {
      if (checkCity(tempCity)) {
        oldCity = city;
        showOptions();
      }
      else {
        alert("City not found in Database");
      }
    }
  })


  function getCurrentWeather() {
    $.ajax({
      type:"GET",
      url: currenturl,
      data: {
        q: city, //city parameter in api call
        units: units.unitFormat, //unit conversion format
        appid: apiKey
      },
      timeout:2000,
      success: function(data) {
        writeData(data);
      }
    });
  }


  function getHourlyWeather() {
    $.ajax({
      type:"GET",
      url: forecasturl,
      data: {
        q: city, //city parameter in api call
        units: units.unitFormat, //unit conversion format
        cnt: 40,
        appid: apiKey
      },
      timeout:2000,
      success: function(data) {
        writeTwoFourData(data);
        writeFourZeroData(data);
      }
    });
  }


  function readFiles() {
    $.getJSON("./js/city.list.json", function(data) {
      listOfCities = data
    });
    $.getJSON("./js/countries.json", function(data1) {
      listOfCountries = data1;
    });
  }


  function writeData(data) {
    $("#location").text(data.name + ", " + listOfCountries[data.sys.country]);
    $("#temperature").html(data.main.temp + " " + units.temperature);
    $("#feelsLike").html("Feels like " + data.main.feels_like + " " + units.temperature);
    $("#weatherDescription").text(data.weather[0].description);
    if($("#c").hasClass("current")) {
      $("#windSpeed").html(((data.wind.speed/1000)*3600).toFixed(2) + " " + units.windSpeed + " @ " + data.wind.deg + "&#176;");
    } else {
      $("#windSpeed").html(data.wind.speed + " " + units.windSpeed + " @ " + data.wind.deg + "&#176;");
    }
    $("#humidityIndex").text(data.main.humidity + "%");
    $("#atmosphericPressure").text(data.main.pressure + " " + units.pressure);
    if($("#f").hasClass("current")) {
      $("#visibility").text((data.visibility/1600).toFixed(2) + " " + units.vis);
    } else {
      $("#visibility").text((data.visibility/1000).toFixed(2) + " " + units.vis);
    }

    $(".currentWeather").css("background-image","url(\"http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png\")")
  }


  function writeTwoFourData(data) {
    $("#hourlyForecast .space").empty();
    for (let i = 0; i < 8; i++) {
      $("#hourlyForecast .space").append("<div></div>");
    }

    let $firstElement = $("#hourlyForecast .space div");

    $firstElement.each(function(index) {
      let tempTime = new Date(data.list[index].dt * 1000);
      let hourText = "<p>"+ week[tempTime.getDay()] + "<br />";
      hourText += getAMPM(tempTime) + "</p>";
      hourText += "<img src=\"http://openweathermap.org/img/wn/" + data.list[index].weather[0].icon + "@2x.png\" />";
      hourText += "<p>" + data.list[index].main.temp + " " + units.temperature + "<br />";
      hourText += data.list[index].weather[0].description + "</p>";
      $(this).html(hourText);
    });
  }


  function writeFourZeroData(data) {
    $("#fiveDayForecast .space").empty();
    for (let i = 0; i < 40; i++) {
      $("#fiveDayForecast .space").append("<div></div>");
    }

    let $fiveDayElements = $("#fiveDayForecast .space div");

    $fiveDayElements.each(function(index) {
      let tempTime = new Date(data.list[index].dt * 1000);
      let hourText = "<span class=\"time\">"+ week[tempTime.getDay()] + " " + getAMPM(tempTime) + "</span><span class=\"image\"><img src=\"http://openweathermap.org/img/wn/" + data.list[index].weather[0].icon + "@2x.png\" /></span><span class=\"temp\">" + data.list[index].main.temp + " " + units.temperature + "</span><span class=\"desc\">" + data.list[index].weather[0].description + "</span>";
      $(this).html(hourText);
    });
  }


  function getAMPM(time) {
    let hour = time.getHours();
    let ampm = hour >= 12 ? "PM" : "AM";
    hour = hour%12 == 0 ? 12 : hour%12;
    return hour + " " + ampm;
  }


  function checkCity(cityname) {
    //cityname = cityname.split(" ").join("");
    let tempCityName = cityname.split(",")[0].toLowerCase();
    let flag = false;

    userOptions = [];
    let optionCounter = 0;

    for (let i = 0; i < listOfCities.length; i++) {
      let listCity = listOfCities[i].name.toLowerCase();
      if (tempCityName == listCity) {
        userOptions[optionCounter] = {
          city: listOfCities[i].name,
          state: listOfCities[i].state,
          country: listOfCities[i].country
        };
        optionCounter++;
        flag = true;
      }
    }

    return flag;
  }


  function showOptions() {
    let userSelect;
    $("#note").empty();
    let options = "<div id=\"close\">Back</div><ul id=\"options\">Did you mean:";
    $(userOptions).each(function(index) {
      let formattedLocation = userOptions[index].city+","+userOptions[index].state+","+userOptions[index].country;
      options += "<li>"+formattedLocation.replace(",,",",")+"</li>";
    });
    options += "</ul>";
    $("#note").append(options);
    $("#note").toggle(500);

    $("#close").on("click", function(){
      $("#note").toggle(500);
    });
    $("#options").on("click", function(e){
      userSelect = e.target.textContent;
      $("#note").toggle(500);

      city = userSelect;
      $("#citySearch").val(city);

      getCurrentWeather();
      getHourlyWeather();
    });
  }

});