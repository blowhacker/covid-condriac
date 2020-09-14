let dataCovid = []

function initDb(readyCallback) {
    fetch('https://www.bbc.co.uk/indepthtoolkit/data-sets/covid_lookup_ltla_surveillance/json')
        .then(y => y.json())
        .then(json => {
            dataCovid = json
            readyCallback()
        })
}

function fillCovidData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(latLong)

        function latLong(position) {
            let url = `https://api.postcodes.io/postcodes?lon=${position.coords.longitude}&lat=${position.coords.latitude}`;
            fetch(url)
                .then(x => x.json())
                .then(data => {
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
                                destinationDiv.appendChild(divRegion)

                            }

                        }

                    })
                })
        }
    } else {
        alert("Geolocation is not supported by this browser.")
    }
}

initDb(fillCovidData)