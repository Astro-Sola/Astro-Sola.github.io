let url = "https://www.jma.go.jp/bosai/forecast/data/forecast/010000.json";

fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(weather) {
        console.log(weather);
        // 新しい div 要素を作成します
        areaWeather(weather, 2, "海北");
        areaWeather(weather, 5, "奥羽");
        areaWeather(weather, 8, "吾妻");
        areaWeather(weather, 7, "北越");
        areaWeather(weather, 11, "東海");
        areaWeather(weather, 12, "畿内");
        areaWeather(weather, 15, "陰陽");
        areaWeather(weather, 13, "二名");
        areaWeather(weather, 17, "鎮西");
        areaWeather(weather, 20, "龍及");


    });

function areaWeather(weather, i, name) {
    const element = document.getElementById('weather');
    const weatherCode = weather[i].srf.timeSeries[0].areas.weatherCodes[2];
    const newText = name + "地方： " + weatherMatch(weatherCode);
    element.insertAdjacentHTML('beforeend', newText + '　');
}

function weatherMatch(num) {
    let WeatherText = '';
    console.log(num);
    switch (num) {
        case '100':
            WeatherText = '<span class="fs">晴</span>';
            break;
        case '101':
            WeatherText = '<span class="fs">晴</span>/<span class="fc">曇り</span>';
            break;
        case '102':
            WeatherText = '<span class="fs">晴</span>/<span class="fr">雨</span>';
            break;
        case '103':
            WeatherText = '<span class="fs">晴</span>/<span class="fr">雨</span>';
            break;
        case '110':
            WeatherText = '<span class="fs">晴</span>/<span class="fc">曇り</span>';
            break;
        case '111':
            WeatherText = '<span class="fs">晴</span>/<span class="fc">曇り</span>';
            break;
        case '112':
            WeatherText = '<span class="fs">晴</span>/<span class="fr">雨</span>';
            break;
        case '113':
            WeatherText = '<span class="fs">晴</span>/<span class="fr">雨</span>';
            break;
        case '114':
            WeatherText = '<span class="fs">晴</span>/<span class="fr">雨</span>';
            break;
        case '200':
            WeatherText = '<span class="fc">曇</span>';
            break;
        case '201':
            WeatherText = '<span class="fc">曇</span>/<span class="fs">晴</span>';
            break;
        case '202':
            WeatherText = '<span class="fc">曇</span>/<span class="fr">雨</span>';
            break;
        case '203':
            WeatherText = '<span class="fc">曇</span>/<span class="fr">雨</span>';
            break;
        case '209':
            WeatherText = '霧';
            break;
        case '210':
            WeatherText = '<span class="fc">曇</span>/<span class="fs">晴</span>';
            break;
        case '211':
            WeatherText = '<span class="fc">曇</span>/<span class="fs">晴</span>';
            break;
        case '212':
            WeatherText = '<span class="fc">曇</span>/<span class="fr">雨</span>';
            break;
        case '213':
            WeatherText = '<span class="fc">曇</span>/<span class="fr">雨</span>';
            break;
        case '214':
            WeatherText = '<span class="fc">曇</span>/<span class="fr">雨</span>';
            break;
        case '300':
            WeatherText = '<span class="fr">雨</span>';
            break;
        case '301':
            WeatherText = '<span class="fr">雨</span>/<span class="fs">晴</span>';
            break;
        case '306':
            WeatherText = '大雨';
            break;
        case '308':
            WeatherText = '暴風雨';
            break;
        case '311':
            WeatherText = '<span class="fr">雨</span>/<span class="fs">晴</span>';
            break;
        case '313':
            WeatherText = '<span class="fr">雨</span>/<span class="fc">曇</span>';
            break;
        case '400':
            WeatherText = '雪';
            break;
        default:
            WeatherText = '不明';
            break;
    }
    console.log(WeatherText);
    return (WeatherText);
}