// ==UserScript==
// @name         checkMiningStats
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Add a chart to your crypto mining stats
// @author       midnitecoder
// @match        http://midniteminer:22333/
// @match        http://midniteminer:42010/
// @match        http://midniteminer2:42010/
// @match        http://midniteminer2:22333/
// @match        http://midniteminer3:42010/
// @match        http://midniteminer3:22333/
// @match        http://localhost:42010/
// @match        http://localhost:22333/
// @match        http://midnitecoder:42010/
// @match        http://midnitecoder:22333/
// @require      http://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js
// @require      https://unpkg.com/dayjs@1.8.21/dayjs.min.js
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    window.chartColors = {
        purple:         '#120f26',
        brightRed:      '#cd1b04',
        bringPink:      '#d911d3',
        armyGreen:      '#90a076',
        navyBlue:       '#353e5d',
        burntOragne:    '#a56b05',
        darkGreen:      '#ddd4a8',
        lightGray:      '#8e836e',
        limeGreen:      '#9cd985',
        cyan:           '#48a2be',
        darkPurple:     '#270e16',
        lightPink:      '#cc649b',
        neonGreen:      '#aff15c',
        orange:         '#e49406',
        purpleBlue:     '#2201f6',
        oliveGreen:     '#c2ba86',
        maroon:         '#7c100e',
        lavendar:       '#8252e1',
        salmon:         '#dca592'
    };
})();

var hashRateChart = null;
var sharesPerMinChart = null;
var powerPerMinChart = null;
var urlToLoad = 'goFish';
var currentMiner = null;

window.onload = async function() {
    await setUrlToLoad();
    logToConsole('onload', 'urlToLoad=' + urlToLoad + ' currentMiner=' + currentMiner);
//    if( currentMiner === 'lolMiner' || currentMiner === 'nbminer' ){
        $('body').prepend('<div style = "text-align:center;"><canvas id="sharesPerMinChart" width="1000" height="250"></canvas></div>');
        $('body').prepend('<div style = "text-align:center;"><canvas id="powerPerMinChart" width="1000" height="250"></canvas></div>');
        $('body').prepend('<div style = "text-align:center;"><canvas id="hashRateChart" width="1000" height="250"></canvas></div>');

//    } else {
//        $('body').append('<div style = "text-align:center;"><canvas id="hashRateChart" width="1000" height="250"></canvas></div>');
//        $('body').append('<div style = "text-align:center;"><canvas id="powerPerMinChart" width="1000" height="250"></canvas></div>');
//        $('body').append('<div style = "text-align:center;"><canvas id="sharesPerMinChart" width="1000" height="250"></canvas></div>');
//    }
    var ctx = document.getElementById('hashRateChart').getContext('2d');
    var ctxShares = document.getElementById('sharesPerMinChart').getContext('2d');
    var power = document.getElementById('powerPerMinChart').getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctxShares.canvas.width = window.innerWidth;
    power.canvas.width = window.innerWidth;

    hashRateChart = new Chart(ctx, hashRateConfig);
    sharesPerMinChart = new Chart(ctxShares, sharesPerMinConfig);
    powerPerMinChart = new Chart(power, powerPerMinConfig);

    makeHashrateDatasets();
    updateData();
    updateData();
    setInterval(updateData, 30000); // Update every N Minutes * 60 * 1000
};

function logToConsole(functionName, textToWrite) {
    const currTime = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
    console.log(currTime + ' [' + window.location + '] functionName=' + functionName + ' ' + textToWrite +'.');
}

async function setUrlToLoad() {
//  I'm sure there is a better way, but stopped trying to focus on life.
    await checkForMiner('stat');
    if( urlToLoad === 'goFish' ) {
        await checkForMiner('api/v1/status');
        if( urlToLoad === 'goFish'){
            await checkForMiner('summary')
        }
    }
}


async function checkForMiner(urlToCheck) {
    logToConsole('checkForMiner', 'urlToCheck='+urlToCheck);
    if( urlToLoad !== 'goFish' ){
        return;
    } else {
        var fullUrl = window.location + urlToCheck;
        var data = null;
        await GM.xmlHttpRequest( {
            method: 'GET',
            url: fullUrl,
            responseType: "json",
            onload: function(response) {
                try{
                    data = window.JSON.parse(response.responseText);
                } catch(err){
                    urlToLoad = 'goFish';
                    return;
                }
                if( data.hasOwnProperty('reboot_times') ){
                    urlToLoad = 'api/v1/status';
                    currentMiner = 'nbminer';
                    return;
                }
                if( data.hasOwnProperty('devices') ){
                    urlToLoad = 'stat'
                    currentMiner = 'gminer';
                    return;
                }
                if( data.hasOwnProperty('Session') ){
                    urlToLoad = 'summary';
                    currentMiner = 'lolMiner';
                    return;
                } else {
                    urlToLoad = 'goFish';
                }
            },
            onerror: function(response) {
                urlToLoad = 'goFish';
                logToConsole('checkForMiner', 'Something went wrong in the onError catch urlToCheck=' + urlToCheck + ' at ' + window.location)
            }
        });
    }
}

var hashRateConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        showLine: true,
        title: {
            display: true,
            text: 'Hash Rates'
        },
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero: false,
                    precision: "2"
                },
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: false
                },
                suggestedMin: 20,
                suggestedMax: 220,
                display: true,
                //pe: 'logarithmic',
                scaleLabel: {
                    display: true,
                    labelString: 'Hash Rate (MH/s)'

                }
            }]
        }
    }
};

var sharesPerMinConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        showLine: true,
        title: {
            display: true,
            text: 'Shares per minute'
        },
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero: false,
                    precision: "2"
                },
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: false
                },
                display: true,
                suggestedMin: 0.3,
                suggestedMax: 1.5,
                beginAtZero: false,
                //type: 'logarithmic',
                scaleLabel: {
                    display: true,
                    labelString: 'Shares per minute'

                }
            }]
        }
    }
};

var powerPerMinConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        showLine: true,
        title: {
            display: true,
            text: 'Power'
        },
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero: false,
                    precision: "2"
                },
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: false
                },
                display: true,
                suggestedMin: 50,
                //type: 'logarithmic',
                scaleLabel: {
                    display: true,
                    labelString: 'Power'

                }
            }]
        }
    }
};

function roundUp(num, precision) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}

function makeHashrateDatasets() {
    var fullUrl = window.location + urlToLoad;
    GM.xmlHttpRequest( {
        method: 'GET',
        url: fullUrl,
        responseType: "json",
        onload: function(response) {
            var data = window.JSON.parse(response.responseText);
            var devices = new Array();
            var translatedMinerData = mapMinerData(data);
            devices = translatedMinerData.rigDevices;
            devices.forEach(function(device) {
                var colorNames = Object.keys(window.chartColors);
                var colorName = colorNames[hashRateConfig.data.datasets.length % colorNames.length];
                var newColor = window.chartColors[colorName];
                var newDataset = {
                    label: device.name,
                    backgroundColor: newColor,
                    borderColor: newColor,
                    data: [],
                    fill: false
                };
                var sharesDataset = {
                    label: device.name,
                    backgroundColor: newColor,
                    borderColor: newColor,
                    data: [],
                    fill: false
                }
                var powerDataset = {
                    lable: device.name,
                    backgroundColor: newColor,
                    borderColor: newColor,
                    data: [],
                    fill: false
                }
                hashRateConfig.data.datasets.push(newDataset);
                sharesPerMinConfig.data.datasets.push(sharesDataset);
                powerPerMinConfig.data.datasets.push(powerDataset);
                hashRateChart.update();
                sharesPerMinChart.update();
                powerPerMinChart.update();
            });
            var newDataset = {
                label: 'PoolHash',
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgb(75, 192, 192)',
                data: [],
                fill: false
            };
            hashRateConfig.data.datasets.push(newDataset);
            hashRateChart.update();
        }
    });
}

function getNewTime() {
    var time = new Date();
    var hours = time.getHours();
    var minutes = time.getMinutes();
    var roundedHours = "";
    var roundedMinutes = "";

    if (hours < 10) {
        roundedHours = "0" + hours;
    } else roundedHours = hours;
    if (minutes < 10) {
        roundedMinutes = "0" + minutes;
    } else roundedMinutes = minutes;

    var currentTime = roundedHours + ":" + roundedMinutes;
    hashRateConfig.data.labels.push(currentTime);
    sharesPerMinConfig.data.labels.push(currentTime);
    powerPerMinConfig.data.labels.push(currentTime);
    if (hashRateConfig.data.labels.length > 144) {
        hashRateConfig.data.labels.shift()
        sharesPerMinConfig.data.labels.shift()
        powerPerMinConfig.data.labels.shift()
    }
    hashRateChart.update();
    sharesPerMinChart.update();
    powerPerMinChart.update();

};

function updateHashRate(data, device, dataset, sumDeviceHashRate) {
    var hashRate = 0;
    if( dataset.label !== 'PoolHash' ){
        hashRate = device.hashRate / device.deviceHashShareDivisor;
    } else {
        hashRate = (data.poolSpeed / data.rigDevices.length);
        if( data.poolSpeed < sumDeviceHashRate ) {
            dataset.backgroundColor = ('rgb(51, 0, 0)');
            dataset.borderColor = ('rgb(51, 0, 0)');
        } else {
            dataset.backgroundColor = 'rgb(0, 51, 0)';
            dataset.borderColor = 'rgb(0, 51, 0)';
        }
    }

    dataset.data.push(roundUp(hashRate, 2));
    hashRateChart.update();
}

function updateShares(data, device, dataset) {
    dataset.data.push( Number.parseFloat( (device.deviceValidShares / data.uptimeMinutes) / device.deviceHashShareDivisor ).toPrecision(2));
    sharesPerMinChart.update();
}

function updatePower(data, device, dataset){
   dataset.data.push( device.devicePower / device.deviceHashShareDivisor ).toPrecision(2);
   powerPerMinChart.update();
}

function getHashShareDivisor(rigDeviceName) {
    logToConsole('getHash', 'rigDeviceName='+rigDeviceName);
    if( rigDeviceName.includes('3090') ){
        return 3.0;
    } else if( rigDeviceName.includes('6800') ){
        return 2.0;
    } else {
        return 1.0;
    }
}

function mapMinerData(minerData) {
    var translatedMinerData = {
        miner: null,
        uptimeMinutes: null,
        poolSpeed: null,
        totalValidShares: null,
        totalRejectShares: null,
        totalStaleShares: null,
        totalInvalidShares: null,
        rigDevices: []
    };
    if( currentMiner === 'gminer' ){
        translatedMinerData.miner              = 'gminer';
        translatedMinerData.uptimeMinutes      = minerData.uptime / 60.0;
        translatedMinerData.poolSpeed          = minerData.pool_speed / 1000000.0;
        translatedMinerData.totalValidShares   = minerData.total_total_accepted_shares;
        translatedMinerData.totalRejectShares  = minerData.total_rejected_shares;
        translatedMinerData.totalStaleShares   = minerData.total_stale_shares;
        translatedMinerData.totalInvalidShares = minerData.total_invalid_shares;
        minerData.devices.forEach(function(device) {
            const currDivisor = getHashShareDivisor(device.name);
            var rigDeviceData = {
                deviceID:               device.gpu_id,
                deviceHashShareDivisor: currDivisor,
                name:                   device.name,
                hashRate:               device.speed.toFixed(0) / 1000000.0,
                deviceValidShares:      device.accepted_shares,
                deviceRejectShares:     device.rejected_shares,
                deviceStaleShares:      device.stale_shares,
                deviceInvalidShares:    device.rejected_shares,
                devicePower :           device.power_usage
            };
            translatedMinerData.rigDevices.push(rigDeviceData);
        });
    } else if ( currentMiner === 'lolMiner' ) {
        translatedMinerData.miner               = 'lolMiner';
        translatedMinerData.uptimeMinutes       = minerData.Session.Uptime / 60.0;
        translatedMinerData.poolSpeed           = (minerData.Session.Accepted * 4000.48) / minerData.Session.Uptime;
        translatedMinerData.totalValidShares    = minerData.Session.Accepted;
        translatedMinerData.totalRejectShares   = minerData.Session.Submitted - minerData.Session.Accepted;
        translatedMinerData.totalStaleShares    = minerData.Session.Stale;
        translatedMinerData.totalInvalidShares  = 0;
        minerData.GPUs.forEach(function(device) {
            const currDivisor = getHashShareDivisor(device.name);
            var rigDeviceData = {
                deviceID:               device.Index,
                deviceHashShareDivisor: currDivisor,
                name:                   device.Name,
                hashRate:               device.Performance,
                deviceValidShares:      device.Session_Accepted,
                deviceRejectShares:     device.Submitted - device.Accepted,
                deviceStaleShares:      device.Stale,
                deviceInvalidShares:    0,
                devicePower:            device.power
            }
            translatedMinerData.rigDevices.push(rigDeviceData);
        });
    } else if ( currentMiner === 'nbminer' ) {
        translatedMinerData.miner               = 'nbminer';
        translatedMinerData.uptimeMinutes       = (Date.now() - (minerData.start_time * 1000))/ 1000.0 / 60.0;
        translatedMinerData.poolSpeed           = minerData.stratum.pool_hashrate_10m;
        translatedMinerData.poolSpeed           = translatedMinerData.poolSpeed.substring(0, translatedMinerData.poolSpeed.length -2);
        translatedMinerData.totalValidShares    = minerData.stratum.accepted_shares;
        translatedMinerData.totalRejectShares   = minerData.stratum.rejected_shares;
        translatedMinerData.totalStaleShares    = 0;
        translatedMinerData.totalInvalidShares  = minerData.stratum.invlaid_shares;
        minerData.miner.devices.forEach(function(device) {
            const currDivisor = getHashShareDivisor(device.info);
            var rigDeviceData = {
                deviceID:               device.id,
                deviceHashShareDivisor: currDivisor,
                name:                   device.info,
                hashRate:               device.hashrate_raw.toFixed(0) / 1000000.0,
                deviceValidShares:      device.accepted_shares,
                deviceRejectShares:     device.rejected_shares,
                deviceStaleShares:      0,
                deviceInvalidShares:    device.invlaid_shares,
                devicePower:            device.power
            }
            translatedMinerData.rigDevices.push(rigDeviceData);
        });
    }
    return translatedMinerData;
}

function updateData() {
    getNewTime();
    var data = null
    var devices = new Array();
    var fullUrl = window.location + urlToLoad;
    GM.xmlHttpRequest( {
        method: 'GET',
        url: fullUrl,
        responseType: "json",
        onload: function(response) {
            data = window.JSON.parse(response.responseText);
            var translatedMinerData = mapMinerData(data);
            devices = translatedMinerData.rigDevices;
            var datasets = hashRateConfig.data.datasets;
            var sharesDataset = sharesPerMinConfig.data.datasets;
            var powerDataset = powerPerMinConfig.data.datasets;
            var index = 0
            var sumDeviceHashRate = 0;
            datasets.forEach(function(dataset) {
                if( dataset.label !== 'PoolHash' ){
                    var deviceHashRate = parseInt(devices[index].hashRate);
                    sumDeviceHashRate += deviceHashRate;
               }
                updateHashRate(translatedMinerData, devices[index], dataset, sumDeviceHashRate);
                index += 1;
            });
            index = 0;
            sharesDataset.forEach(function(dataset) {
                updateShares(translatedMinerData, devices[index], dataset);
                index += 1;
            });
            index = 0;
            powerDataset.forEach(function(dataset) {
                updatePower(translatedMinerData, devices[index], dataset);
                index += 1;
            });
        }
    });
};