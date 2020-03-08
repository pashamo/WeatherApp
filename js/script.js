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

WEATHER CODES:
http://openweathermap.org/img/wn/{weather.icon}@2x.png

WEATHER MAP URL:
https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}
layer=(clouds_new, precipitation_new, pressure_new, wind_new, temp_new)
z=zoom (use lvl 7)
x=number of x tile coordinate
y=number of y tile coordinate
*/

$(function() {

  var week = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat"
  }

  var apiKey = config.WM_KEY;
  var city = "Brampton";
  var currenturl = "https://api.openweathermap.org/data/2.5/weather";
  var forecasturl = "https://api.openweathermap.org/data/2.5/forecast";
  var wmdata = {
    layer: "clouds_new/",
    z: "6/",
    x: "0/",
    y: "0"
  }

  var wmurl = "https://tile.openweathermap.org/map/"+wmdata.layer+wmdata.z+wmdata.x+wmdata.y+".png";
  var selectors = {
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
  var units = selectors.c;

  getCurrentWeather();
  getHourlyWeather();

  $(".otherForecasts ul li").each(function(index) {
    if (index%2 == 1) {
      $(this).hide();
    }
  });

  //Add event listener for unit selection - triggering data change
  $(".otherForecasts ul li").on("click", function() {
    var indexVal = $(this).index();
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
      $(this).next().toggle(500);
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
        console.log(data);

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
        console.log(data);

        writeTwoFourData(data);
        writeFourZeroData(data);
      }
    });
  }


  function writeData(data) {
    $("#location").text(data.name + ", " + data.sys.country);
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
    for (var i = 0; i < 8; i++) {
      $("#hourlyForecast .space").append("<div></div>");
    }

    var $firstElement = $("#hourlyForecast .space div");
    console.log($firstElement[0]);

    $firstElement.each(function(index) {
      var tempTime = new Date(data.list[index].dt * 1000);
      var hourText = "<p>"+ week[tempTime.getDay()] + "<br />";
      hourText += getAMPM(tempTime) + "</p>";
      hourText += "<img src=\"http://openweathermap.org/img/wn/" + data.list[index].weather[0].icon + "@2x.png\" />";
      hourText += "<p>" + data.list[index].main.temp + " " + units.temperature + "<br />";
      hourText += data.list[index].weather[0].description + "</p>";
      $(this).html(hourText);
    });
  }


  function writeFourZeroData(data) {
    for (var i = 0; i < 40; i++) {
      $("#fiveDayForecast .space").append("<div></div>");
    }

    var $fiveDayElements = $("#fiveDayForecast .space div");
    console.log($fiveDayElements);

    $fiveDayElements.each(function(index) {
      var tempTime = new Date(data.list[index].dt * 1000);
      var hourText = "<span class=\"time\">"+ week[tempTime.getDay()] + " " + getAMPM(tempTime) + "</span><span class=\"image\"><img src=\"http://openweathermap.org/img/wn/" + data.list[index].weather[0].icon + "@2x.png\" /></span><span class=\"temp\">" + data.list[index].main.temp + " " + units.temperature + "</span><span class=\"desc\">" + data.list[index].weather[0].description + "</span>";
      $(this).html(hourText);
    });
  }


  function getAMPM(time) {
    var hour = time.getHours();
    var ampm = hour >= 12 ? "PM" : "AM";
    hour = hour%12 == 0 ? 12 : hour%12;
    return hour + " " + ampm;
  }

});



/*
//test bed
var temp = "<p>Description: "+ data.weather[0].description +"<br />";
temp += "Wind: "+ data.wind.speed + " " + units.windSpeed + "<br />";
temp += "Humidity: "+ data.main.humidity +"%<br />";
temp += "Pressure: "+ data.main.pressure +" hpa<br />";
temp += "Visibility: "+ data.visibility +"<br />";
temp += "Cloud: "+ data.clouds.all +"%<br />";
temp += "Temperature: "+ data.main.temp + " " + units.temperature + "<br />";
temp += "City: "+ data.name + ", " + data.sys.country +"</p>";
$(".test").append(temp);
*/
