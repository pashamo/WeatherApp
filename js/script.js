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

WEATHER MAP URL:
https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}
layer=(clouds_new, precipitation_new, pressure_new, wind_new, temp_new)
z=zoom (use lvl 7)
x=number of x tile coordinate
y=number of y tile coordinate
*/

$(function() {

  var apiKey = config.WM_KEY;
  var city = "London";
  var currenturl = "https://api.openweathermap.org/data/2.5/weather";
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
      pressure: "hpa"
    },
    c: {
      unitFormat:"metric",
      windSpeed: "m/s",
      temperature: "&#8451;",
      pressure: "hpa"
    }
  };
  var units = selectors.c;

  callAjax();

  $(".otherForecasts ul li").each(function(index) {
    if (index%2 == 1) {
      $(this).hide();
    }
  });

  //Add event listener for unit selection - triggering data change
  $(".otherForecasts ul li").on("click", function() {
    if ($(this).index()%2 == 0) {
      $(this).next().toggle(500);
    }
  });

  $(".unitSelector ul li").on("click", function() {
    console.log($(this).attr('id'));
    if ($(this).attr('id') == "c") {
      units = selectors.c;
    } else {
      units = selectors.f;
    }

    callAjax();
  });

  function callAjax() {
    $.ajax({
      type:"GET",
      url:currenturl,
      data: {
        q: city, //city parameter in api call
        units: units.unitFormat, //unit conversion format
        appid: apiKey
      },
      timeout:2000,
      success: function(data) {
        console.log(data);
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

        writeData(data);
      }
    });
  }

  function writeData(data) {
    $("#location").text(data.name + ", " + data.sys.country);
    $("#temperature").html(data.main.temp + " " + units.temperature);
    $("#feelsLike").html("Feels like " + data.main.feels_like + " " + units.temperature);
    $("#weatherDescription").text(data.weather[0].description);
    $("#windSpeed").html(data.wind.speed + " " + units.windSpeed + " @ " + data.wind.deg + "&#176;");
    $("#humidityIndex").text(data.main.humidity + "%");
    $("#atmosphericPressure").text(data.main.pressure + " " + units.pressure);
    $("#visibility").text(data.visibility);
  }

  $.ajax({
    type: "GET",
    url: wmurl,
    data: {
      cities: true,
      appid: apiKey
    },

  });
});
