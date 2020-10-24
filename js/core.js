let dataCovid = []

let lastUpdated = 0
let lastLatLong = {}

function initDb(readyCallback) {
    fetch('https://news.files.bbci.co.uk/include/newsspec/codebuilddata/Weekly_cases_lookup_data.json')
        .then(y => y.json())
        .then(json => {
            dataCovid = json
            readyCallback()
        })
}

function fillCovidData() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(latLong, (err) => console.log(err))

    } else {
        alert("Geolocation is not supported by this browser.")
    }
}

function latLong(position) {
    lastUpdated = new Date()
    if (lastLatLong.longitude === position.coords.longitude &&
        lastLatLong.latitude === position.coords.latitude
    ) {
        return
    }
    lastLatLong.longitude = position.coords.longitude
    lastLatLong.latitude = position.coords.latitude

    let url = `https://api.postcodes.io/postcodes?lon=${position.coords.longitude}&lat=${position.coords.latitude}`;
    document.querySelector('.ripple').style.display = ''
    fetch(url)
        .then(x => x.json())
        .then(data => {
            document.querySelector('.ripple').style.display = 'none'
            document.getElementById('loading').style.display = "none"
            let codeAdminDistrict = {}
            data.result.forEach(row => {
                codeAdminDistrict[row.codes.admin_district] = 1
            })
            Object.keys(codeAdminDistrict).forEach(ad => {
                for (let i = 0; i < dataCovid.length; i++) {
                    if (dataCovid[i][0] == ad) {
                        let row = dataCovid[i]
                        let formatted = {
                            region: row[1],
                            casesTotal: row[2],
                            casesToDate: row[9],
                            casesNewThisWeekComparedToLast: row[11],
                            casesLatestWeek: row[10],
                            casesPer100k: row[12],
                            casesPer100kNationalAverage: row[13],
                        }

                        let destinationDiv = document.getElementById('stats')
                        let divRegion = document.createElement('div')

                        let sign = formatted.casesNewThisWeekComparedToLast > 0 ? '+' : ''
                        let redSign = formatted.casesNewThisWeekComparedToLast > 0 ? "color:red" : 'color:green'
                        let pipe = `<span style='color:#ccc'>|</span>`
                        divRegion.innerHTML = `Active cases per 100k in ${formatted.region}: ${formatted.casesPer100k} ${pipe} 
                        National avg. ${formatted.casesPer100kNationalAverage} <br><br>
                        Cases: ${formatted.casesTotal.toLocaleString()}                                
                         ${pipe} 
                        <span style='${redSign}'>${sign}${formatted.casesNewThisWeekComparedToLast}</span> from last week
                        <div class='updated'>Data updated on ${formatted.casesToDate}</div>
                        `
                        destinationDiv.childNodes.forEach(ele => {
                            destinationDiv.removeChild(ele)
                        })
                        destinationDiv.appendChild(divRegion)
                        break
                    }

                }

            })
        })
}

setInterval(ensureDataFresh, 1000)

function ensureDataFresh() {
    let led = document.querySelector('.led')
    if (new Date() - lastUpdated < 60 * 1000) {
        led.classList.add('ledgreen')
        led.classList.remove('ledred')
    } else {
        led.classList.add('ledred')
        led.classList.remove('ledgreen')
        console.log('eggg')
        navigator.geolocation.getCurrentPosition(latLong, (err) => console.log(err))
    }
}


initDb(fillCovidData)