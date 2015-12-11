/* Main JS */

window.onload = function () {
  var paper   = Raphael("holder");
  paper.setViewBox(0, 0, 800, 800, true);
  paper.setSize("100%", "100%");

  var origin  = "50%";
  var radius  = "40%";
  var init    = true;

  var D2R = Math.PI / 180; // Degrees to Radians
  var R2D = 180 / Math.PI; // Radians to Degrees

  var offset  = 270; // repositions the entire dial

  var timezone  = 0;
  var zenith    = "official"; // official, civil, nautical, astronomical

  // get element id`s
  var html = [
    document.getElementById("hours"),
    document.getElementById("minutes"),
    document.getElementById("seconds"),
    document.getElementById("meridium"),
    document.getElementById("day"),
    document.getElementById("month"),
    document.getElementById("date"),
    document.getElementById("year"),
    document.getElementById("sunRiseHr"),
    document.getElementById("sunRiseMin"),
    document.getElementById("sunRiseMeridium"),
    document.getElementById("sunSetHr"),
    document.getElementById("sunSetMin"),
    document.getElementById("sunSetMeridium"),
    document.getElementById("locLon"),
    document.getElementById("locLat")
  ];

  // watch colors
  var colorBW    = ["#000", "#fff"];
  var colorWatch = ["#67b8de", "#fff", "#bdc5cb", "#8f99a0"];
  var colorHand  = ["#6a7883", "#4d5a64", "#f6704d"];
  var colorSun   = ["#c2a57e", "#7c693a"];

  // watch icons
  var icons      = ["", ""];

  // set element defaults
  html[0].innerHTML  = "--";
  html[1].innerHTML  = "--";
  html[2].innerHTML  = "--";
  html[3].innerHTML  = "--";
  html[4].innerHTML  = "--";
  html[5].innerHTML  = "--";
  html[6].innerHTML  = "--";
  html[7].innerHTML  = "--";
  html[8].innerHTML  = "--";
  html[9].innerHTML  = "--";
  html[10].innerHTML = "--";
  html[11].innerHTML = "--";
  html[12].innerHTML = "--";
  html[13].innerHTML = "--";
  html[14].innerHTML = "--";
  html[15].innerHTML = "--";
  
  // draw watch, marks and numbers
  drawWatch(origin, radius, 0, null, colorWatch[1]);
  drawMarks(400, 300, 24, colorWatch[0], 12, colorWatch[3]);
  drawMarks(400, 280, 60, colorWatch[2]);
  drawNumbers(400, 310, 24, colorWatch[3]);

  // draw hands
  var sRise  = paper.path("M400 400 L400 40").attr({"stroke-width": 0.5, "stroke": colorSun[0], "stroke-linecap": "round"});
  var sSet   = paper.path("M400 400 L400 40").attr({"stroke-width": 0.5, "stroke": colorSun[1], "stroke-linecap": "round"});
  var tHr    = paper.path("M400 400 L400 40").attr({"stroke-width": 4, "stroke": colorHand[0], "stroke-linecap": "round"});
  var tMin   = paper.path("M400 400 L400 40").attr({"stroke-width": 3, "stroke": colorHand[1], "stroke-linecap": "round"});
  var tSec   = paper.path("M400 400 L400 40").attr({"stroke-width": 1, "stroke": colorHand[2], "stroke-linecap": "round"});
  var pinion = paper.circle(origin, origin, 6).attr({"stroke": colorWatch[1], "fill": colorWatch[0]});
  var psRise = paper.text(400, 30, icons[0]).attr({"fill": colorSun[0], "font-size": 16, "font-weight": 100, "font-family": "FontAwesome"});
  var psSet  = paper.text(400, 30, icons[1]).attr({"fill": colorSun[1], "font-size": 16, "font-weight": 100, "font-family": "FontAwesome"});

  // Load local data
  loadPageState();
  
  //  Session data
  if (sessionStorage.pageLoadCount) {
    sessionStorage.pageLoadCount = Number(sessionStorage.pageLoadCount) + 1;
  } else {
    sessionStorage.pageLoadCount = 1;
  }

  // color the numbers
  /*html[0].style.color = colors[2];
  html[1].style.color = colors[3];
  html[2].style.color = colors[4];
  html[3].style.color = colors[5];
  html[4].style.color = colors[6];
  html[5].style.color = colors[7];
  html[6].style.color = colors[8];*/

  // get location
  var location = new Object();
  getLocation();

  function drawWatch(origin, radius, width, color, fill) {
    var out = paper.set();
    var x   = origin;
    var y   = origin;
    out.push(paper.circle(x, y, radius).attr({"stroke-width": width, "stroke": color, "fill": fill}));
    return out;
  }

  function drawMarks(origin, radius, total, color, pointer, pointerColor) {
    //var color = "hsb(".concat(Math.round(radius) / 200, ", 1, .75)"),
    var out = paper.set();
    for (var i = 0; i < total; i++) {
      var alpha = 360 / total * i;
      var a     = (270 - alpha) * D2R;
      var x     = origin + radius * Math.cos(a);
      var y     = origin - radius * Math.sin(a);
      if (i%pointer) {
        out.push(paper.circle(x, y, 2).attr({"fill": pointerColor, "stroke": "none"}));
      } else {
        out.push(paper.circle(x, y, 2).attr({"fill": color, "stroke": "none"}));
      }
    }
    return out;
  }

  function drawNumbers(origin, radius, total, color) {
    //var color = "hsb(".concat(Math.round(radius) / 200, ", 1, .75)"),
    var out = paper.set();
    for (var i = 0; i < total; i++) {
      var alpha = 360 / total * i;
      var a     = (270 - alpha) * D2R;
      var x     = origin + radius * Math.cos(a);
      var y     = origin - radius * Math.sin(a);
      out.push(paper.text(x, y, i).attr({"fill": color, "font-size": 10, "font-weight": 600, "font-family": "Lato"}));
    }
    return out;
  }

  function drawHand(origin, radius, total, width, current, color, hand) {
    var alpha  = 360 / total * current;
    var a      = (270 - alpha) * D2R;
    var startX = origin;
    var startY = origin;
    var endX   = startX + radius * Math.cos(a);
    var endY   = startY - radius * Math.sin(a);
    var path   = "M" + startX + " " + startY + " L" + endX + " " + endY;

    if (init) {
      hand.animate({"path": path}, 0);
      hand.attr({"stroke-width": width, "stroke": color, "stroke-linecap": "round"});
    } else {
      hand.animate({"path": path}, 100, "elastic");
      hand.attr({"stroke-width": width, "stroke": color, "stroke-linecap": "round"});
    }
  }

  function drawIcon(origin, radius, total, width, current, hand) {
    var alpha  = 360 / total * current;
    var a      = (270 - alpha) * D2R;
    var startX = origin;
    var startY = origin;
    var endX   = startX + radius * Math.cos(a) - 400;
    var endY   = startY - radius * Math.sin(a) - 30;
    hand.transform("T" + endX + "," + endY);
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(locationSuccess, locationError);
    } else {
      alert("Geolocation is not supported.");
    }
  }

  function locationSuccess(position) {
    location.latitude         = position.coords.latitude;
    location.longitude        = position.coords.longitude;
    location.altitude         = position.coords.altitude;
    location.accuracy         = position.coords.accuracy;
    location.altitudeAccuracy = position.coords.altitudeAccuracy;
    location.heading          = position.coords.heading;
    location.speed            = position.coords.speed;
    location.timestamp        = position.timestamp;
    location.url              = "http://www.maps.google.com/maps?q=" + location.latitude + "," + location.longitude;
    document.getElementById("map").href = location.url;
  }

  function locationError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        alert("Geolocation request denied.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Geolocation information unavailable.");
        break;
      case error.TIMEOUT:
        alert("Geolocation request timed out.");
        break;
      default:
        alert("An unknown error occurred.");
        break;
    }
  }

  function computeSunrise(longitude, latitude, timezone, zenith, day, sunrise) {
  //https://gist.github.com/Tafkas/4742250
  /*
    Sunrise/Sunset Algorithm taken from
    http://williams.best.vwh.net/sunrise_sunset_algorithm.htm
    inputs:
      day = day of the year
      sunrise = true for sunrise, false for sunset
    output:
      time of sunrise/sunset in hours:minutes
    zenith: sun's zenith for sunrise/sunset
      official     = 90 degrees 80'
      civil        = 96 degrees
      nautical     = 102 degrees
      astronomical = 108 degrees
  */
    switch(zenith) {
      case "official":
        zenith = 90.8;
        break;
      case "civil":
        zenith = 96;
        break;
      case "nautical":
        zenith = 102;
        break;
      case "astronomical":
        zenith = 108;
        break;
    }

    // convert the longitude to hour value and calculate an approximate time
    var lnHour = longitude / 15;
    var t;
    if (sunrise) {
      t = day + ((6 - lnHour) / 24);
    } else {
      t = day + ((18 - lnHour) / 24);
    };

    //calculate the Sun's mean anomaly
    M = (0.9856 * t) - 3.289;

    //calculate the Sun's true longitude
    L = M + (1.916 * Math.sin(M * D2R)) + (0.020 * Math.sin(2 * M * D2R)) + 282.634;
    if (L > 360) {
      L = L - 360;
    } else if (L < 0) {
      L = L + 360;
    };

    //calculate the Sun's right ascension
    RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
    if (RA > 360) {
      RA = RA - 360;
    } else if (RA < 0) {
      RA = RA + 360;
    };

    //right ascension value needs to be in the same quadrant
    Lquadrant  = (Math.floor(L / 90)) * 90;
    RAquadrant = (Math.floor(RA / 90)) * 90;
    RA = RA + (Lquadrant - RAquadrant);

    //right ascension value needs to be converted into hours
    RA = RA / 15;

    //calculate the Sun's declination
    sinDec = 0.39782 * Math.sin(L * D2R);
    cosDec = Math.cos(Math.asin(sinDec));

    //calculate the Sun's local hour angle
    cosH = (Math.cos(zenith * D2R) - (sinDec * Math.sin(latitude * D2R))) / (cosDec * Math.cos(latitude * D2R));
    var H;
    if (sunrise) {
      H = 360 - R2D * Math.acos(cosH);
    } else {
      H = R2D * Math.acos(cosH);
    };

    H = H / 15;

    //calculate local mean time of rising/setting
    T = H + RA - (0.06571 * t) - 6.622;

    //adjust back to UTC
    UT = T - lnHour;
    if (UT > 24) {
      UT = UT - 24;
    } else if (UT < 0) {
      UT = UT + 24;
    }

    //convert UT value to local time zone of latitude/longitude
    localT = UT + timezone;

    //convert to minutes
    minutes = (localT) * 60;
    return timeString(minutes, 2);
  }

  function timeString(minutes, flag) {
    // timeString returns a zero-padded string (HH:MM:SS) given time in minutes
    // flag=2 for HH:MM, 3 for HH:MM:SS
    if ((minutes >= 0) && (minutes < 1440)) {
      var floatHour   = minutes / 60.0;
      var hour        = Math.floor(floatHour);
      var floatMinute = 60.0 * (floatHour - Math.floor(floatHour));
      var minute      = Math.floor(floatMinute);
      var floatSec    = 60.0 * (floatMinute - Math.floor(floatMinute));
      var second      = Math.floor(floatSec + 0.5);

      if (second > 59) {
        second = 0;
        minute += 1;
      }
      
      if ((flag == 2) && (second >= 30)) minute++;
      
      if (minute > 59) {
        minute = 0;
        hour += 1;
      }

      var output = [hour, minute];
      
      if (flag > 2) { output = [hour, minute, second]; }
    } else { 
      var output = "error";
    }
    return output;
  }

  function zeroPad(i) {
    if (i < 10) { i = "0" + i; }
    return i;
  }

  function dayOfYear() {
    var yearFirstDay = Math.floor(new Date().setFullYear(new Date().getFullYear(), 0, 1) / 86400000);
    var today = Math.ceil((new Date().getTime()) / 86400000);
    var dayOfYear = today - yearFirstDay;
    return dayOfYear;
  }

  function isLeapYear(year) {
    return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
  }

  function weekName (day) {
    var name = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    return name[day];
  }
  
  function monthName (month) {
    var name = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    return name[month];
  }

  function savePageState(hours, minutes, seconds, meridium, day, month, date, year, longitude, latitude, sRiseHr, sRiseMin, sRiseMeridium, sSetHr, sSetMin, sSetMeridium) {
    if (Modernizr.localstorage) {
      localStorage.setItem("Hours", hours);
      localStorage.setItem("Minutes", minutes);
      localStorage.setItem("Seconds", seconds);
      localStorage.setItem("Meridium", meridium);
      localStorage.setItem("Day", day);
      localStorage.setItem("Month", month);
      localStorage.setItem("Date", date);
      localStorage.setItem("Year", year);
      localStorage.setItem("sunRiseHr", sRiseHr);
      localStorage.setItem("sunRiseMin", sRiseMin);
      localStorage.setItem("sunRiseMeridium", sRiseMeridium);
      localStorage.setItem("sunSetHr", sSetHr);
      localStorage.setItem("sunSetMin", sSetMin);
      localStorage.setItem("sunSetMeridium", sSetMeridium);
      localStorage.setItem("Longitude", longitude);
      localStorage.setItem("Latitude", latitude);
    }
  }

  function loadPageState() {
    if (Modernizr.localstorage) {
      if (localStorage.getItem("Latitude")) {
        html[0].innerHTML  = localStorage.getItem("Hours");
        html[1].innerHTML  = zeroPad(localStorage.getItem("Minutes"));
        html[2].innerHTML  = zeroPad(localStorage.getItem("Seconds"));
        html[3].innerHTML  = localStorage.getItem("Meridium");
        html[4].innerHTML  = weekName(localStorage.getItem("Day"));
        html[5].innerHTML  = monthName(localStorage.getItem("Month"));
        html[6].innerHTML  = zeroPad(localStorage.getItem("Date"));
        html[7].innerHTML  = localStorage.getItem("Year");
        html[8].innerHTML  = localStorage.getItem("sunRiseHr");
        html[9].innerHTML  = zeroPad(localStorage.getItem("sunRiseMin"));
        html[10].innerHTML = localStorage.getItem("sunRiseMeridium");
        html[11].innerHTML = localStorage.getItem("sunSetHr");
        html[12].innerHTML = zeroPad(localStorage.getItem("sunSetMin"));
        html[13].innerHTML = localStorage.getItem("sunSetMeridium");
        html[14].innerHTML = localStorage.getItem("Longitude");
        html[15].innerHTML = localStorage.getItem("Latitude");
      }
    }
  }

  // Loop watch updates
  (function () {
    var d        = new Date;
    var hours    = d.getHours(); // for 24 hours
    //var hours  = hours % 12 || 12; // for 12 hours
    var minutes  = d.getMinutes();
    var seconds  = d.getSeconds();
    var meridium = "";
    if (hours < 12) {meridium = "am"} else {meridium = "pm"}

    var day      = d.getDay();
    var month    = d.getMonth();
    var date     = d.getDate();
    var year     = d.getFullYear();

    var longitude = Math.round(1000000 * location.longitude) / 1000000;
    var latitude  = Math.round(1000000 * location.latitude) / 1000000;
    
    var sunRise    = computeSunrise(longitude, latitude, timezone, zenith, dayOfYear(), true);
    var sunSet     = computeSunrise(longitude, latitude, timezone, zenith, dayOfYear(), false);
    var sunRiseHr  = sunRise[0];
    var sunRiseMin = sunRise[1];
    var sunRiseMeridium = "";
    if (sunRiseHr < 12) {sunRiseMeridium = "am"} else {sunRiseMeridium = "pm"}
    var sunSetHr   = sunSet[0];
    var sunSetMin  = sunSet[1];
    var sunSetMeridium   = "";
    if (sunSetHr < 12) {sunSetMeridium = "am"} else {sunSetMeridium = "pm"}

    html[0].innerHTML  = hours;
    html[1].innerHTML  = zeroPad(minutes);
    html[2].innerHTML  = zeroPad(seconds);
    html[3].innerHTML  = meridium;
    html[4].innerHTML  = weekName(day);
    html[5].innerHTML  = monthName(month);
    html[6].innerHTML  = zeroPad(date);
    html[7].innerHTML  = year;
    html[8].innerHTML  = sunRiseHr;
    html[9].innerHTML  = zeroPad(sunRiseMin);
    html[10].innerHTML = sunRiseMeridium;
    html[11].innerHTML = sunSetHr;
    html[12].innerHTML = zeroPad(sunSetMin);
    html[13].innerHTML = sunSetMeridium;
    html[14].innerHTML = longitude;
    html[15].innerHTML = latitude;

    drawHand(400, 340, 24 * 60, 0.5, (sunRiseHr * 60) + sunRiseMin, colorSun[0], sRise);
    drawIcon(400, 350, 24 * 60, 0.5, (sunRiseHr * 60) + sunRiseMin, psRise);
    drawHand(400, 340, 24 * 60, 0.5, (sunSetHr * 60) + sunSetMin, colorSun[1], sSet);
    drawIcon(400, 350, 24 * 60, 0.5, (sunSetHr * 60) + sunSetMin, psSet);
    drawHand(400, 300, 24, 4, hours, colorHand[0], tHr);
    drawHand(400, 280, 60 * 24, 3, minutes + (hours * 60), colorHand[1], tMin);
    drawHand(400, 280, 60, 1, seconds, colorHand[2], tSec);

    // Save local data
    savePageState(hours, minutes, seconds, meridium, day, month, date, year, longitude, latitude, sunRiseHr, sunRiseMin, sunRiseMeridium, sunSetHr, sunSetMin, sunSetMeridium);
    document.getElementById("sesNo").innerHTML = "You have loaded this page " + sessionStorage.pageLoadCount + " time(s).";

    setTimeout(arguments.callee, 1000);
    init = false;
  })();

};

