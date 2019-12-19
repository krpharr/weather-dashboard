var api_key = "51745af60173eebe983991b32379a839";


var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

const fullDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// const abrevDaysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];


var updatePastSearches = true;

function success(pos) {
    var crd = pos.coords;

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);

    queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude.toFixed(2)}&lon=${crd.longitude.toFixed(2)}&appid=${api_key}`;
    console.log(queryURL);
    console.log(typeof crd.latitude);
    console.log(typeof crd.longitude);
    queryOpenWeather(queryURL);
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);
$("#forecast-header-ID").hide();

function queryOpenWeather(query) {
    $("#forcast-container-ID").empty();


    $.ajax({
        url: query,
        method: "GET"
    }).then(function(response) {

        $("#city-element-ID, #counrty-element-ID, #icon-element-ID, #description-element-ID, #date-element-ID").empty();
        $("#lon-element-ID,#lat-element-ID,#wind-element-ID,#humidity-element-ID,#temperature-element-ID").empty();
        $("#feels-like-element-ID,#temp-min-element-ID,#temp-max-element-ID,#pressure-element-ID,#clouds-element-ID").empty();

        //if in mobile scroll to location of current city conditions
        if ($("#col-a").css("order") === 2) {
            window.scrollTo(0, 0);
        }
        $("#forecast-header-ID").show();

        console.log(response);
        $("#city-element-ID").text(response.name);
        $("#country-element-ID").text(response.sys.country);
        var url = `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
        console.log(url);
        var img = $("<img>").attr("src", url);
        $("#icon-element-ID").append(img);
        // $("#city-header-ID").attr("background-image", url);
        $("#city-header-ID").css('background-image', 'url(' + url + ')');
        // $("#city-header-ID").css("background-position: right top;");

        $("#description-element-ID").text(`${response.weather[0].description}`);
        $("#day-element-ID").text(fullDaysOfWeek[moment().weekday()]);
        $("#date-element-ID").text(moment().format("MM/DD/YYYY"));
        $("#lon-element-ID").text("Longitude: " + response.coord.lon);
        $("#lat-element-ID").text("Latitude: " + response.coord.lat);
        $("#wind-element-ID").text(`Wind: ${response.wind.deg}º / ${response.wind.speed} knots`);
        $("#clouds-element-ID").text(`Clouds: ${response.clouds.all}%`);
        $("#humidity-element-ID").text(`Humidity: ${response.main.humidity}%`);
        $("#temperature-element-ID").text(`${Math.round(temperatureConverter(response.main.temp))}ºF`);
        $("#feels-like-element-ID").text(`feels like: ${Math.round(temperatureConverter(response.main.feels_like))}ºF`);
        $("#temp-min-element-ID").text(`min/max: ${Math.round(temperatureConverter(response.main.temp_min))}º`);
        $("#temp-max-element-ID").text(`/${Math.round(temperatureConverter(response.main.temp_max))}ºF`);
        $("#pressure-element-ID").text(`Pressure: ${response.main.pressure}`);


        x = response.coord.lon;
        y = response.coord.lat;

        var id = response.id;
        localStorage.setItem("wd-current-city-id", id);
        localStorage.setItem("wd-current-city-forecast", JSON.stringify(response));
        let lsArray = JSON.parse(localStorage.getItem("wd-past-searches"));
        let past_search = {
            id: id,
            name: response.name,
            lon: x,
            lat: y
        }
        if (lsArray === null) {
            lsArray = [];
        }
        let getCity = lsArray.filter(ls => {
            return ls.id === id;
        });
        if (getCity.length < 1) {
            lsArray.push(past_search);
        }
        localStorage.setItem("wd-past-searches", JSON.stringify(lsArray));
        updatePastSearches = true;
        // updatePastSearchCards();


    }).then(function(response) {
        var layer = "precipitation_new";
        var z = "3";
        queryURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${api_key}&lat=${y}&lon=${x}`;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            // Create CODE HERE to Log the queryURL
            console.log(response);
            $("#uvindex-element-ID").text("UV Index: " + response.value);
        });

    }).then(function(response) {
        var id = localStorage.getItem("wd-current-city-id");
        queryURL = `http://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=${api_key}`;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            console.log("5 day *************");
            console.log(response);
            // console.log(response.list);
            //create forecast object and array to store response
            forecastArray = [];
            response.list.forEach(forecast => {
                let f = {
                    date: forecast.dt_txt,
                    feels_like: forecast.main.feels_like,
                    clouds: forecast.clouds.all,
                    humidity: forecast.main.humidity,
                    temp: forecast.main.temp,
                    desc: forecast.weather[0].description,
                    icon: forecast.weather[0].icon,
                    main: forecast.weather[0].main,
                    wind: [forecast.wind.deg, forecast.wind.speed]
                }
                forecastArray.push(f);
            });

            console.log(forecastArray);

            //sort by day
            let date = moment();
            console.log(date, forecastArray[0].date);
            // console.log(moment(date).isSameOrAfter(moment(forecastArray[0].date)));
            let forecastByDayArray = [];
            let i = 0;
            let buff = [];

            forecastArray.forEach(forecast => {
                console.log(moment(date).date() === moment(forecast.date).date());
                if (moment(date).date() === moment(forecast.date).date()) {
                    console.log(forecast);
                    buff.push(forecast);
                } else {
                    let buff_copy = buff.slice(0);
                    forecastByDayArray.push(buff_copy);
                    buff = [];
                    date = forecast.date;
                    i += 1;
                }
            });
            console.log(forecastByDayArray);

            if (forecastByDayArray.length < 6) {
                let ls = JSON.parse(localStorage.getItem("wd-current-city-forecast"));
                let f = {
                    date: moment().format(),
                    feels_like: ls.main.feels_like,
                    clouds: ls.clouds.all,
                    humidity: ls.main.humidity,
                    temp: ls.main.temp,
                    desc: ls.weather[0].description,
                    icon: ls.weather[0].icon,
                    main: ls.weather[0].main,
                    wind: [ls.wind.deg, ls.wind.speed]
                }
                forecastByDayArray[0].push(f);
            } else {
                forecastByDayArray.slice(0, 1);
            }

            //create summary for each day
            let summaryArray = [];

            forecastByDayArray.forEach(fArray => {

                if (fArray.length > 0) {
                    // get forecasts with highest and lowest temperatures
                    var high_index = 0;
                    var low_index = 0;
                    var humidity_index = 0;
                    var wind_index = 0;
                    for (var i = 0; i < fArray.length; i++) {
                        if (fArray[i].temp > fArray[high_index].temp) {
                            high_index = i;
                        }
                        if (fArray[i].temp < fArray[low_index].temp) {
                            low_index = i;
                        }
                        if (fArray[i].humidity > fArray[high_index].humidity) {
                            humidity_index = i;
                        }
                        if (fArray[i].wind[1] > fArray[high_index].wind[1]) {
                            wind_index = i;
                        }

                    }
                    let summary = {
                        date: moment(fArray[0].date).format("MM/DD/YYYY"),
                        high: fArray[high_index].temp,
                        high_desc: fArray[high_index].desc,
                        high_icon: fArray[high_index].icon,
                        low: fArray[low_index].temp,
                        low_desc: fArray[low_index].desc,
                        low_icon: fArray[low_index].icon,
                        humidity: fArray[humidity_index].humidity,
                        clouds: fArray[high_index].clouds,
                        wind: fArray[wind_index].wind
                    }
                    summaryArray.push(summary);

                }

            });
            console.log(summaryArray);
            //create and populate 5 day forcast cards
            summaryArray.forEach(s => {
                let card = $("<div>").addClass("card day-forcast bg-dark text-light mb-3 p-2");
                // let img = $("<img>").addClass("card-img").attr("src", "https://via.placeholder.com/160x248");
                // img.attr("alt", "...");
                // let overlay = $("<div>").addClass("card-img-overlay");

                let header = $("<div>").addClass("text-center");
                let title = $("<h3>").addClass("card-title").text(fullDaysOfWeek[moment(s.date).weekday()]);
                let date = $("<p>").addClass("card-text").text(s.date);
                header.append(title, date);

                let high = $("<div>").addClass("d-flex justify-content-between align-items-center");
                let high_temp = $("<p>").addClass("card-text d-inline mr-1").text(`high: ${Math.round(temperatureConverter(s.high))}º\t`);
                var url = `http://openweathermap.org/img/wn/${s.high_icon}@2x.png`;
                let high_icon = $("<img>").addClass("").attr("src", url);
                high_icon.attr("width", "32px");
                let high_desc = $("<div>").addClass("").text(s.high_desc);
                high.append(high_temp, $("<div>").addClass("text-center").append(high_icon, high_desc));

                let low = $("<div>").addClass("d-flex justify-content-between align-items-center");
                let low_temp = $("<p>").addClass("card-text d-inline mr-1").text(`low: ${Math.round(temperatureConverter(s.low))}º\t`);
                url = `http://openweathermap.org/img/wn/${s.low_icon}@2x.png`;
                let low_icon = $("<img>").addClass("").attr("src", url);
                low_icon.attr("width", "32px");
                let low_desc = $("<div>").addClass("").text(s.low_desc);
                low.append(low_temp, $("<div>").addClass("text-center").append(low_icon, low_desc));

                let clouds = $("<p>").addClass("card-text clearfix").text(`clouds: ${s.clouds}%`);

                let humidity = $("<p>").addClass("card-text").text(`humidity: ${s.humidity}%`);
                let wind = $("<p>").addClass("card-text").attr("style", "font-size: 10px;").text(`wind: ${s.wind[0]}º ${s.wind[1]} knots`);
                // overlay.append(title, date, high_temp, high_icon, clouds, low_temp, low_icon, humidity, wind)
                // card.append(img, overlay);

                card.append(header, high, low, clouds, humidity, wind);
                $("#forcast-container-ID").append(card);
            });
        });
    });

}

async function updatePastSearchCards() {
    if (updatePastSearches === false) {
        return;
    } else {
        updatePastSearches = false;
    }
    // get from localStorage
    lsArray = JSON.parse(localStorage.getItem("wd-past-searches"));
    if (lsArray === null || lsArray.length < 1) {
        return;
    }
    //empty container 
    let container = $("#previous-search-ID");
    container.empty();


    //iterate array
    lsArray.forEach(city => {
        //ajax request
        // let queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat.toFixed(2)}&lon=${city.lon.toFixed(2)}&appid=${api_key}`;
        let queryURL = `https://api.openweathermap.org/data/2.5/weather?id=${city.id}&appid=${api_key}`;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            //create card divs
            console.log("********** updatePastSearchCards ajax response ***********");
            console.log(response);
            //set data
            // let city = response;
            let card = $("<div>").addClass("card previous-search text-white bg-info mt-1 mb-1");
            card.attr("data-id", response.id)
            let cardBody = $("<div>").addClass("card-body");
            let cardTitle = $("<h5>").addClass("card-title d-inline");
            let div = $("<div>");
            let cardIcon = $("<img>").addClass("d-inline");
            cardIcon.attr("src", `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
            cardIcon.attr("width", "48px");
            // let cardSubtitle = $("<h6>");
            let cardSubtitle = $("<h6>").addClass("card-subtitle mb-2 text-grey");
            cardTitle.text(city.name); //city name from user search 
            let str = `${Math.round(temperatureConverter(response.main.temp))}º\t${response.weather[0].description}`;
            cardSubtitle.text(str);
            div.append(cardTitle, cardIcon);
            card.append(cardBody, div, cardSubtitle);
            container.append(card);
            //append

            $(".previous-search").on('click', function(event) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                //(... rest of your JS code)
                console.log(event.target);
                var ru = $(this).closest('.previous-search');
                console.log(ru.data());
                console.log(ru.data().id);

                let query = `http://api.openweathermap.org/data/2.5/weather?id=${ru.data().id}&appid=${api_key}`;
                queryOpenWeather(query);
            });
        });

    });
}

function temperatureConverter(valNum) {
    valNum = parseFloat(valNum);
    return ((valNum - 273.15) * 1.8) + 32;
}


$("#submit-search-btn-ID").on("click", function(event) {
    event.preventDefault();
    var city = $("#input-cityname-ID").val();
    var country = $("#input-country-ID").val();
    var queryURL;

    country === "" ? queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}` : queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${api_key}`;

    queryOpenWeather(queryURL);
    $("#input-cityname-ID").val("");
    $("#input-country-ID").val("");
});

// updates search continer if there is new data
var updatePastSearchesListener = setInterval(function() {
    if (updatePastSearches) {
        updatePastSearchCards();
    }
}, 1000);

//update current conditions for past searches
var updatePastSearchContainer = setInterval(function() {
    updatePastSearches = true;
}, 60000 * 5);