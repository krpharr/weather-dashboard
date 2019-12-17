var api_key = "51745af60173eebe983991b32379a839";


var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

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


function queryOpenWeather(query) {
    $.ajax({
        url: query,
        method: "GET"
    }).then(function(response) {


        console.log(response);
        $("#city-element-ID").text(response.name);
        $("#country-element-ID").text(response.sys.country);

        var url = `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
        console.log(url);
        var img = $("<img>").attr("src", url);
        $("#icon-element-ID").append(img);

        // $("#icon-element-ID").(response.weather[0].icon);

        $("#lon-element-ID").text("Longitude: " + response.coord.lon);
        $("#lat-element-ID").text("Latitude: " + response.coord.lat);
        $("#wind-element-ID").text("Wind direction: " + response.wind.deg + " Wind speed: " + response.wind.speed);
        $("#humidity-element-ID").text("Humidity: " + response.main.humidity);
        $("#temperature-element-ID").text("Temperature: " + Math.round(temperatureConverter(response.main.temp)));


        x = response.coord.lon;
        y = response.coord.lat;

        var id = response.id;
        localStorage.setItem("wd-current-city-id", id);

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
                let card = $("<div>").addClass("card bg-dark text-white mb-3");
                let img = $("<img>").addClass("card-img").attr("src", "https://via.placeholder.com/160x248");
                img.attr("alt", "...");
                let overlay = $("<div>").addClass("card-img-overlay");
                let title = $("<h5>").addClass("card-title").text(s.date);
                let high_temp = $("<p>").addClass("card-text d-inline").text(`high: ${Math.round(temperatureConverter(s.high))}º\t`);
                var url = `http://openweathermap.org/img/wn/${s.high_icon}@2x.png`;
                var high_icon = $("<img>").addClass("d-inline").attr("src", url);
                high_icon.attr("width", "32px");
                let clouds = $("<p>").addClass("card-text clearfix").text(`clouds: ${s.clouds}%`);
                let low_temp = $("<p>").addClass("card-text d-inline").text(`low: ${Math.round(temperatureConverter(s.low))}º\t`);
                var url = `http://openweathermap.org/img/wn/${s.low_icon}@2x.png`;
                var low_icon = $("<img>").addClass("d-inline").attr("src", url);
                low_icon.attr("width", "32px");
                let humidity = $("<p>").addClass("card-text").text(`humidity: ${s.humidity}%`);
                let wind = $("<p>").addClass("card-text").attr("style", "font-size: 10px;").text(`wind: ${s.wind[0]}º ${s.wind[1]} knots`);
                overlay.append(title, high_temp, high_icon, clouds, low_temp, low_icon, humidity, wind)
                card.append(img, overlay);
                $("#forcast-container-ID").append(card);
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

});