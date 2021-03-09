//check browser for async functions use//

// I get Chrome like example and I use async functions only with it.
var isChrome =
  !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

//initial variables//
import _ from "lodash";
import axios from "axios";

var input = $("#cityName");
var timer = null;
var outputSearch = $("#result1");
var buttonGeo = $("#geoButton");
var buttonGeoReset = $("#geoButton2");
const token = process.env.API_KEY;

//I manage the city search part of the application//

input.on("keyup", function () {
  /* Debounce */
  if (timer) clearTimeout(timer);
  timer = setTimeout(function () {
    if (input.val() == "") {
      $(".your").css("display", "none");
      $(".mine").css("display", "none");
    } else {
      $(".mine").css("display", "block");
    }
    if ($("#result3")) {
      $("#result3").empty();
    }
    if (!isChrome) {
      searchComp(input.val(), outputSearch);
    } else {
      search(input.val(), outputSearch);
    }
  }, 250);
});

async function search(keyword, output) {
  console.log("Chrome");
  output.html("<h3>Result:</h3><br>");
  output.append(
    $("<div/>").html(
      "<strong>Click on any of the station to see the detailled AQI</strong>"
    )
  );
  output.append($("<div/>").addClass("cp-spinner cp-meter"));

  const url = `//api.waqi.info/search/?token=${token}&keyword=${keyword}`;
  const getData = async (url) => {
    await axios(url)
      .then((result) => {
        output.html("<h3>Pollution and atmospheric conditions</h3><br>");
        if (result.data.length == 0) {
          output.html("<p>No result</p>");
        }
        if (result.data) output.append($("<code>").html(result.data));
        result = result.data;
        createLayoutResult(output, result);
      })
      .catch((error) => {
        output.html("Ops, something not working...<br><br>" + error);
      });
  };
  getData(url);
}

//NoChrome browsers
function searchComp(keyword, output) {
  console.log("NoChrome");
  output.html("<h3>Result:</h3><br>");
  output.append(
    $("<div/>").html(
      "<strong>Click on any of the station to see the detailled AQI</strong>"
    )
  );
  output.append($("<div/>").addClass("cp-spinner cp-meter"));

  $.getJSON(`//api.waqi.info/search/?token=${token}&keyword=${keyword}`)

    .done(function (result) {
      output.html("<h3>Pollution and atmospheric conditions</h3><br>");
      if (result.data.length == 0) {
        output.html("<p>No result</p>");
      }
      if (result.data) output.append($("<code>").html(result.data));
      createLayoutResult(output, result);
    })
    .fail(function (result) {
      output.append("<strong>Ops, something wrong happend: </strong>");
      if (result.data) output.append($("<code>").html(result.data));
    });
}

async function showStation(station, output) {
  const url = "//api.waqi.info/feed/@" + station.uid + "/?token=" + token;
  const getData = async (url) => {
    await axios(url)
      .then((result) => {
        output.html("<h3>Pollution and atmospheric conditions</h3><br>");
        result = result.data;
        createLayout(output, result);
      })
      .catch((error) => {
        output.html("Ops, something not working...<br><br>" + error);
      });
  };
  getData(url);
}

//NoChrome browsers
function showStationComp(station, output) {
  $.getJSON("//api.waqi.info/feed/@" + station.uid + "/?token=" + token)
    .done(function (result) {
      output.html("<h3>Pollution and atmospheric conditions</h3><br>");
      createLayout(output, result);
    })
    .fail(function (result) {
      output.append("Sorry, something wrong happend: ");
      if (result.data) output.append($("<code>").html(result.data));
    });
}

//I manage the part of the application for the geolocation of the city//

buttonGeo.click(function () {
  buttonGeo.css("display", "none");
  initGeo();
  buttonGeoReset.css("display", "block");
});

buttonGeoReset.click(function () {
  buttonGeoReset.css("display", "none");
  buttonGeo.css("display", "block");
  $(".geo").css("display", "none");
});

function initGeo() {
  $(".geo").css("display", "block");
  if (navigator.geolocation) {
    var cord = navigator.geolocation.getCurrentPosition(userPosition);
  } else {
    alert("Check location permissions");
  }

  function userPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    cord = lat + ";" + lon;
    if (!isChrome) {
      geoJSONComp(cord);
    } else {
      geoJSON(cord);
    }
  }
}

function geoJSON(cord) {
  const token = process.env.API_KEY;
  var output = $("#result2");
  output.html("<h3>Pollution and atmospheric conditions</h3><br>");
  output.append($("<div/>").html("Loading..."));
  output.append($("<div/>").addClass("cp-spinner cp-meter"));

  const url = `https://api.waqi.info/feed/geo:${cord}/?token=${token}`;
  const getData = async (url) => {
    await axios(url)
      .then((result) => {
        output.html("<h3>Pollution and atmospheric conditions</h3><br>");
        output.append($("<code>").html(result.data));
        result = result.data;
        createLayout(output, result);
      })
      .catch((error) => {
        output.html("Ops, something not working...<br><br>" + error);
      });
  };
  getData(url);
}

//NoChrome browsers
function geoJSONComp(cord) {
  const token = process.env.API_KEY;
  var output = $("#result2");
  output.html("<h3>Pollution and atmospheric conditions</h3><br>");
  output.append($("<div/>").html("Loading..."));
  output.append($("<div/>").addClass("cp-spinner cp-meter"));

  $.getJSON(`//api.waqi.info/feed/geo:${cord}/?token=${token}`)

    .done(function (result) {
      output.html("<h3>Pollution and atmospheric conditions</h3><br>");
      output.append($("<code>").html(result.data));
      createLayout(output, result);
    })
    .fail(function (result) {
      output.append("Sorry, something wrong happend ");
      output.append($("<code>").html(result.data));
    });
}

//funzioni di layout

function createLayoutResult(output, result) {
  var table = $("<table/>");
  output.append(table);
  var outputSearch2 = $("#result3");
  var stationInfo = $("<div/>");
  outputSearch2.append(stationInfo);

  result.data.forEach(function (station, i) {
    var tr = $("<tr>");
    tr.append(
      $("<td>").html("<a href='#result3'>" + station.station.name + "</a>")
    );
    tr.append($("<td>").html(colorize(station.aqi)));
    tr.append($("<td>").html(station.time.stime));
    tr.on("click", function () {
      $(".your").css("display", "block");
      if (!isChrome) {
        showStationComp(station, stationInfo);
      } else {
        showStation(station, stationInfo);
      }
    });
    table.append(tr);
    if (i == 0 && !isChrome) showStationComp(station, stationInfo);
    else if (i == 0) showStation(station, stationInfo);
  });
}

function createLayout(output, result) {
  var names = {
    pm25: "PM<sub>2.5</sub>",
    pm10: "PM<sub>10</sub>",
    o3: "Ozone",
    no2: "Nitrogen Dioxide",
    so2: "Sulphur Dioxide",
    co: "Carbon Monoxyde",
    t: "Temperature",
    w: "Wind",
    r: "Rain",
    h: "Relative Humidity",
    d: "Dew",
    p: "Atmostpheric Pressure",
  };

  let checkCity = _.get(
    result.data.city,
    "name",
    result.data || "Error, search another city or try later"
  );
  let checkTime = _.get(result.data.time, "s", "");
  output.append(
    $("<div class='station'/>").html(`Station: ${checkCity} - ${checkTime}`)
  );

  var table = $("<table/>");
  output.append(table);
  for (var specie in result.data.iaqi) {
    let checkIaqi = _.get(result.data.iaqi[specie], "v", "0");
    var aqi = checkIaqi;
    var tr = $("<tr>");
    tr.append($("<td>").html(names[specie] || specie));
    tr.append($("<td>").html(colorize(aqi, specie)));
    table.append(tr);
  }
}

function colorize(aqi, specie) {
  specie = specie || "aqi";
  if (
    [
      "pm25",
      "pm10",
      "no2",
      "so2",
      "co",
      "o3",
      "aqi",
      "w",
      "h",
      "t",
      "d",
      "wg",
    ].indexOf(specie) < 0
  )
    return aqi;

  var spectrum = [
    { a: 0, b: "#cccccc", f: "#ffffff" },
    { a: 50, b: "#009966", f: "#ffffff" },
    { a: 100, b: "#ffde33", f: "#000000" },
    { a: 150, b: "#ff9933", f: "#000000" },
    { a: 200, b: "#cc0033", f: "#ffffff" },
    { a: 300, b: "#660099", f: "#ffffff" },
    { a: 500, b: "#7e0023", f: "#ffffff" },
  ];

  var i = 0;
  for (i = 0; i < spectrum.length - 2; i++) {
    if (aqi == "-" || aqi <= spectrum[i].a) break;
  }

  return $("<div/>")
    .html(aqi)
    .css("font-size", "100%")
    .css("border-radius", "5px")
    .css("min-width", "40px")
    .css("text-align", "center")
    .css("background-color", spectrum[i].b)
    .css("color", spectrum[i].f);
}
