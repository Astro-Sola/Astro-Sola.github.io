let url = 'https://www.jma.go.jp/bosai/forecast/data/forecast/010000.json';

// fetch()メソッドを使用してリクエストを送信する
fetch(url)
  .then(response => response.json()) // レスポンスをJSONとして解析する
  .then(json => {
    // JSONオブジェクトから配列を作成する
    const weatherDataJSONArray = Object.values(json);
    weatherDataConverter('海北', weatherDataJSONArray, 2);
    weatherDataConverter('奥羽', weatherDataJSONArray, 5);
    weatherDataConverter('東国', weatherDataJSONArray, 8);
    weatherDataConverter('北山', weatherDataJSONArray, 7);
    weatherDataConverter('海道', weatherDataJSONArray, 11);
    weatherDataConverter('京摂', weatherDataJSONArray, 12);
    weatherDataConverter('陰陽', weatherDataJSONArray, 15);
    weatherDataConverter('二名', weatherDataJSONArray, 13);
    weatherDataConverter('西南', weatherDataJSONArray, 17);
    weatherDataConverter('琉球', weatherDataJSONArray, 20);

  })
  .catch(error => {
    console.error('Error:', error);
  });

function weatherDataConverter(regionName, JSONdataArray, areanum){
    const areaName = JSONdataArray[areanum].srf.timeSeries[0].areas.area.name;
    const areaCode = JSONdataArray[areanum].srf.timeSeries[0].areas.weatherCodes[0];
    //console.log(JSONdataArray[areanum].srf.timeSeries[0].areas);
    //console.log(areaName);
    //console.log(areaCode);
    //console.log(weatherCase(areaCode));
    const areaWeather = weatherCase(areaCode);

    const text = regionName + '地方：' + areaWeather + ' ／ ' ;
    const newtext = textConveter(text);
    const node = document.createElement('span');
    node.innerHTML = newtext;
    document.getElementById('weather').appendChild(node);

}

function textConveter(text){
    const laterReplace = text.replace('後', ' ⇒ ');
    const partlyReplace = laterReplace.replace('時々', '｜');
    const onceReplace = partlyReplace.replace('一時', '｜');
    const sunnyReplace = onceReplace.replace('晴', '<span class="fs">☀</span>');
    const cloudyReplace = sunnyReplace.replace('曇', '<span class="fc">☁</span>');
    const rainyReplace = cloudyReplace.replace('雨', '<span class="fr">☂</span>');
    const snowyReplace = rainyReplace.replace('雪', '☃');
    return snowyReplace;
}

function weatherCase(weatherCode){
    let weatherIcon = null;
    switch(weatherCode){
        case '100':case '123':case '124':case '130':case '131':weatherIcon = '晴'; break;
        case '101':case '132':weatherIcon = '晴時々曇'; break;
        case '102':case '103':case '106':case '107':case '108':case '120':case '140':weatherIcon = '晴時々雨'; break;
        case '104':case '105':case '160':case '170':weatherIcon = '晴一時雪'; break;
        case '110':case '111':weatherIcon = '晴後曇'; break;
        case '112':case '113':case '114':case '118':case '119':case '122':case '125':case '126':case '127':case '128':case '129':weatherIcon = '晴後雨'; break;
        case '115':case '116':case '117':case '181':weatherIcon = '晴後雪'; break;
        case '200':case '209':case '231':weatherIcon = '曇'; break;
        case '201':case '223':weatherIcon = '曇時々晴'; break;
        case '203':case '207':case '240':weatherIcon = '曇時々雨'; break;
        case '205':case '250':case '270':weatherIcon = '曇時々雪'; break;
        case '202':case '206':case '208':case '220':weatherIcon = '曇一時雨'; break;
        case '204':case '260':weatherIcon = '曇一時雪'; break;
        case '210':case '211':weatherIcon = '曇後晴'; break;
        case '212':case '213':case '214':case '218':case '219':case '222':case '224':case '225':case '226':case '227':weatherIcon = '曇後雨'; break;
        case '215':case '216':case '217':case '228':case '229':case '230':case '281':weatherIcon = '曇後雪'; break;
        case '300':case '306':case '307':case '308':case '328':case '350':weatherIcon = '雨'; break;
        case '301':weatherIcon = '雨時々晴'; break;
        case '303':case '304':case '309':case '322':case '329':weatherIcon = '雨時々雪'; break;
        case '302':weatherIcon = '雨一時曇'; break;
        case '311':case '316':case '320':case '323':case '324':case '325':weatherIcon = '雨後晴'; break;
        case '313':case '317':case '321':weatherIcon = '雨後曇'; break;
        case '314':case '315':case '326':case '327':weatherIcon = '雨後雪'; break;
        case '400':case '405':case '406':case '407':case '425':case '450':weatherIcon = '雪'; break;
        case '401':weatherIcon = '雪時々晴'; break;
        case '340':case '403':case '409':case '427':weatherIcon = '雪時々雨'; break;
        case '402':weatherIcon = '雪一時曇'; break;
        case '361':case '411':case '420':weatherIcon = '雪後晴'; break;
        case '371':case '413':case '421':weatherIcon = '雪後曇'; break;
        case '414':case '422':case '423':case '424':case '426':weatherIcon = '雪後雨'; break;        
        
        default:    weatherIcon = '不明'; break;
    }
    return weatherIcon;
}

function setMarqueeAnimationTime() {
    var marquee = document.querySelector('.animation');
    var marqueeWidth = marquee.offsetWidth;
    var time = marqueeWidth / 20; // Change 50 to adjust speed
    marquee.style.animationDuration = time + 's';
  }
  
  window.addEventListener('resize', setMarqueeAnimationTime);
  setMarqueeAnimationTime();
  