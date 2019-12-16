var api_key = "51745af60173eebe983991b32379a839";

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
        $("#temperature-element-ID").text("Temperature: " + temperatureConverter(response.main.temp));

        function temperatureConverter(valNum) {
            valNum = parseFloat(valNum);
            return ((valNum - 273.15) * 1.8) + 32;
        }

        x = response.coord.lon;
        y = response.coord.lat;

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
    });
}




$("#submit-search-btn-ID").on("click", function(event) {
    event.preventDefault();
    var city = $("#input-cityname-ID").val();
    var country = $("#input-country-ID").val();
    var queryURL;

    country === "" ? queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}` : queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${api_key}`;

    console.log(city);
    console.log(typeof country);
    console.log(queryURL);

    queryOpenWeather(queryURL);


});