/* sat.js is a simple satellite tracking tool written to track and predict amateur radio satellites
   written by Kevin Poulton M0VXY. The orbital elements code borrows heavily (and I do mean heavily) 
   from the classic book Amateur Radio Software by John Morris GM4ANB. 
   
   If you have any question feel free to contact me at kevin@secondinternet.com
   
   */

/* This array defines the satellites that are in scope for the application. It links the tle designation
   used to index the elements file with the different designations used by the AMSAT status API. It 
   also includes the different frequencies used by the satellite */


let satellites = []             // all of the satellite objects we will create
let passes = []                 // the passes that we have successfully found
let analysisStep = 0            // What step of the loading process we are in
let filesToLoad = 1             // How many files remain to be loaded (1 for the elements file)
let filesLoaded = 0             // Number of files actually loaded
let attempts = 0                // How many attempts we've made to wait for the files to load
let elementsReader = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP')   // the reader for the elements file
var stationLocation  = ''       // The station location 
var distances = {}              // Stores the distances for purposes of calculating the velocity and doppler

const MINIMUM_PASS_ELEVATION = 10   // The minimum elevation for which we want to show a pass

/* Load the elements file, and all the individual AMSAT status files required for the in-scope satellites 
   because this is done asynchronously we simply kick everything off, then keep checking every second to 
   see if we have successfully loaded everything */

/* The only 'hidden' code here is that the source APIs have been wrapped on an external server to make them
   available via a cross site request via javascript */


function load_data() {
    
  if(analysisStep == 0) {
      
    /* Kick off the loading of the analysis file */
    let elements_url = 'https://api.secondinternet.com/satellites/elements/'

    elementsReader.open('get',elements_url , true); 
    elementsReader.send()

    /* Work through each of the in scope satellites, creating the objects for them
       which also triggers the loading of the AMSAT status file */

    satellite_data.forEach(satellite_in_scope => {
      
      if(!satellite_in_scope.in_scope) {
        return
      }

      if(!(satellite_in_scope.tle_designation in satellites)) {
        satellites[satellite_in_scope.tle_designation] = new Satellite(satellite_in_scope)
        filesToLoad += satellite_in_scope.amsat_status_designations.length
      } 
      
    })
    
    analysisStep = 1

    setTimeout(load_data, 1000)
    return
  }

  /* Step 1 checks to see if the files we have kicked off loading have completed yet */
  if(analysisStep == 1) {

    attempts++;

    let all_loaded = true
    filesLoaded = 0

    /* Start witht the satellite amsat status files */
    Object.keys(satellites).forEach(key => {
      satellite = satellites[key]
        Object.keys(satellite.readers).forEach(key => {
          if(satellite.readers[key].readyState != 4) {
            all_loaded = false
          } else {
            filesLoaded++
          }
        })
      }
    )

    /* And check the elements file also */
    if(elementsReader.readyState != 4) {
      all_loaded = false
    } else {
      filesLoaded++
    }
      
    if(all_loaded == false) {
      if(attempts < 6) {
        setTimeout(load_data, 1000)
      } else {
        return "Timed out loading satellite files."
      }
      return
    }

    analysisStep = 2
    console.log("...All satellite files loaded (", filesLoaded, ")")
  }


  /* At this point all files are loaded so we proceed normally */
  /* First order of business is to process the elements file and 
     append it to each of the satellites */
  
  lines = elementsReader.responseText.split('\n')
  
  let satellite_elements_loaded = 0;

  for(let i = 0; i < lines.length; i+=3) {
    l1 = lines[i]
    l2 = lines[i+1]
    l3 = lines[i+2]

    if(!(l1 in satellites)) {
      continue
    }

    satellites[l1].satellite_number = l2.slice(2,7)
    satellites[l1].international_designator_year = l2.slice(9,11)
    satellites[l1].international_designator_number = l2.slice(11,14)
    satellites[l1].international_designator_piece = l2.slice(14,17)
    satellites[l1].y0_epoch_year = parseInt(l2.slice(18,20))
    satellites[l1].d0_epoch_day = parseFloat(l2.slice(20,32))
    satellites[l1].ftd_mean_motion = l2.slice(33,43)
    satellites[l1].std_mean_motion = l2.slice(44,52)
    satellites[l1].bstar_drag = l2.slice(53,61)
    satellites[l1].ephemeris_type = l2.slice(62,63)
    satellites[l1].element_number = l2.slice(64,68)
    satellites[l1].i0_inclination = parseFloat(l3.slice(8,16))
    satellites[l1].o0_ra_ascending = parseFloat(l3.slice(17,25))
    satellites[l1].e0_eccentricity = parseFloat(l3.slice(26,33)) / 10000000
    satellites[l1].w0_perigree = parseFloat(l3.slice(34,42))
    satellites[l1].m0_mean_anomoly = parseFloat(l3.slice(43,51))
    satellites[l1].n0_mean_motion = parseFloat(l3.slice(52,63))
    satellites[l1].k0 = parseInt(l3.slice(63,68))
    satellites[l1].a0_semi_major_axis = 0

    satellite_elements_loaded++


  }

  if(satellite_elements_loaded == 0) {
    console.log("No satellites succesfully loaded from elements file.")
    return
  }

  /* Now sort the amsat status logic out */
  Object.keys(satellites).forEach(key => {
    
    let report_text  = ""  

    satellites[key].amsat_status_designations.forEach(amsat_status_designation => {
      let observations = JSON.parse(satellites[key].readers[amsat_status_designation].responseText)
      let report_stats = {'Heard': 0, 'Not Heard' : 0, 'Telemetry Only': 0}
      let report_style = 'neutral'
      observations.forEach(observation => {
        report_stats[observation['report']]++
      })

      if(report_stats['Heard'] - report_stats['Not Heard'] > 0) {
        report_style = 'positive'
      }
      
      if(report_stats['Heard'] - report_stats['Not Heard'] < 0) {
        report_style = 'negative'
      }

      report_text = report_text + amsat_status_designation + ": "
        + "<span class=\"" + report_style + "\">" 
        + (report_stats['Heard'] - report_stats['Not Heard']).toString() 
        + " of " + observations.length.toString() + "</span>   "
      

    })
    
    satellites[key].amsat_status_report_text = report_text
  }
  )

  /* Ok, at this point all data is loaded and made ready for analysis */
  analysisStep = 3 
}

function predict_passes(station_location) {

  //let station_latitude  = 51.50853
  //let station_longitude = -0.12574

  /* We need to take the maidenhead square and convert it into longitude or latitude 
     Firstly, split i into different characters */

  if(station_location.valid !== true) {
    return "Error: This is not a valid location"
  }
  
  let station_longitude = station_location.longitude
  let station_latitude =  station_location.latitude
  let station_height    =  station_location.height
  
  console.log("Predicting for Longitude: ", station_longitude, " Latitude: ", station_latitude)

  if(analysisStep != 3) {
    return 'Satellites not yet loaded correctly...give it a second.'
  }

  console.log("It appears all data is loaded, going to try and predict passes.")

  passes = []  

  /* Display elements stores a reference for all the divs we create 
     so we can update 'live' with current position information */

  elements_to_update = []
  
  let pass_ID = 0

  /* Iterate through each of our satellites */
  Object.keys(satellites).forEach(key => {

    let empty_pass = {
        'start': 0, 
        'end' : 0, 
        'max_el' : 0, 
        'path': '', 
        'satellite_key': key,
        'satellite': satellites[key]
    }

    let this_pass = {...empty_pass}
    let pass_open = false
    let minimum_pass_elevation = MINIMUM_PASS_ELEVATION
    let pass_count = 0
    let az1 = 0
    let az2 = 0 
    let az3 = 0 

    /* Current set to per second accuracy that means one estimation calculation is made for every second */

    for(t=-600; t < 60 * 60 * 24; ++t) {

        let analysis_time = new Date((Date.now()+t*1000))
        r = satellites[key].predict(station_latitude, station_longitude, station_height, analysis_time)

        if(r.el >= minimum_pass_elevation && pass_open == false) {
            pass_open = true
            this_pass.start = analysis_time
            az1 = r.az
        }

        if(r.el >= this_pass.max_el) {
                this_pass['max_el'] = r['el']
                az2 = r['az']
        }

        if(r.el < minimum_pass_elevation && pass_open == true) {
            pass_open = false
            this_pass.end = analysis_time
            az3 = r.az
            this_pass.path = az1.toFixed(0) + '-'+  az2.toFixed(0) + '-' +  az3.toFixed(0)

            if(this_pass.end > Date.now()) {
              passes.push(this_pass)
            }
            
            this_pass = {...empty_pass}
            pass_count = pass_count + 1
            
            pass_ID = pass_ID + 1

            if(pass_count == 3) {
                break
            }
        }
    }
    
  
  })

  /* Sort the passes by the start time of the pass */
  passes.sort((a, b) => (a.start > b.start) ? 1 : -1)
  console.log("Completed calculating passes.")
  
  return refresh_display()
}

function refresh_display() {
  

  /* First of all work through all the satellites getting current position and doppler */
  Object.keys(satellites).forEach(key => {
    
    let predicationDate = Date.now()

    let satellite = satellites[key]
    satellite.current_position = satellite.predict(stationLocation.latitude,stationLocation.longitude, stationLocation.height, new Date(predicationDate) )
    /*  Calculate the delta in the distance and thus the velocity and te doppler 
        and store this distance info for the next iteration of doppler measurement */
    let distanceDelta = distances[satellite.tle_designation] - satellite.current_position.distance
    let distanceDeltaTime = Date.now() - satellites[key].current_distance_time

    satellites[key].current_distance = satellite.current_position.distance
    satellites[key].current_distance_time = predicationDate
    distances[satellite.tle_designation] = satellite.current_position.distance

    satellites[key].current_velocity = distanceDelta / (distanceDeltaTime / 1000)
  })
    
  let inner_HTML_all = ''
  
  /* Now go through each of the passes and display them */
  passes.forEach(pass => {
    
    if (pass.end < Date.now()) {
      return
    }
    
    let pass_HTML = ''

    let startFormatted = Intl.DateTimeFormat('en', { timeZone: 'utc', weekday: 'long', month: 'short', day: 'numeric', hour12: 'false', hour: '2-digit', minute: 'numeric', second: 'numeric' }).format(pass.start)
    let endFormatted = Intl.DateTimeFormat('en', { timeZone: 'utc', weekday: 'long', month: 'short', day: 'numeric', hour12: 'false', hour: '2-digit', minute: 'numeric', second: 'numeric' }).format(pass.end)

    let timeToAcquisition = Math.floor((pass.start - Date.now()) / 1000 / 60);

    let currentPointingFormatted = "Azimuth: " + pass.satellite.current_position.az.toFixed(0) + "° Elevation: " + pass.satellite.current_position.el.toFixed(0) + "° "
    let timeToAcquisitionFormatted = `<span class="negative">In Progress</span><h5 class="card-title"><span class="positive">${currentPointingFormatted}</span></h5>`
    if(timeToAcquisition > 0) {
      timeToAcquisitionFormatted = timeToAcquisition.toString() + " minutes to acquisition."
    } 

    let frequencyFormatted = ''
    let urlFormatted = ''
    
    if(pass.satellite.url) {
      urlFormatted = `<p class="card-text"><a target="_blank" href="${pass.satellite.url}">Click for more info</a></p>`
    }

    /* Iterate through the frequencies */
    Object.keys(pass.satellite.frequencies).forEach(key => {

      let thisFrequency = pass.satellite.frequencies[key]
      
      /* Linear inverting are more elaborate */
      if(thisFrequency.type == 'linear_inverting') {
        let table = thisFrequency.getFormattedLinear(pass.satellite.current_velocity);
        
        frequencyFormatted += `<p class="card-text"><b>Linear inverting</b> 
          - Up is ${Frequency.formatAsString(thisFrequency.frequency_mid_up)} 
          - Down is ${Frequency.formatAsString(thisFrequency.frequency_mid_down)} 
          - Bandwidth is ${Frequency.formatAsString(thisFrequency.bandwidth)} 
        </p>`
        frequencyFormatted += `<table class="table">`
        frequencyFormatted += `<thead><tr><th scope="col">Transmit on (LSB)</th><th scope="col">Satellite in </th><th scope="col">Satellite out</th><th scope="col">Heard on (USB)</th></tr></thead>`
        frequencyFormatted += `<tbody>`
        table.forEach(row => {
          frequencyFormatted += `<tr><td>${row[0]} MHz</td><td>${row[1]} MHz</td><td>${row[2]} MHz</td><td>${row[3]} MHz</td></tr>`
        })
        frequencyFormatted += `</tbody>`
        frequencyFormatted += `</table>`

      } 
      
    /* Rest we just display the code */  
    else {

        frequencyFormatted += `<p class="card-text"><b>${thisFrequency.description}</b>: ${Frequency.formatAsString(thisFrequency.frequency_mid)} MHz `
        
        if(thisFrequency.access_details) {
          frequencyFormatted += `${thisFrequency.access_details}</b> `
        }

        /* Work out doppler frequency */
        let dopplerFrequencyFormatted = Frequency.formatAsString(Frequency.adjustForDoppler(thisFrequency.frequency_mid, thisFrequency.direction,  pass.satellite.current_velocity))

        frequencyFormatted += `<b>Corrected for Doppler</b>: <span>${dopplerFrequencyFormatted} MHz</span> </p>`        
      }
    })


    /* Assemble the refreshed HTML*/
    pass_HTML += `
    <div class="row mt-2">
      <div class="col-12">
        <div class="card m-6">
          <div class="card-body">
            <h5 class="card-title"><b>${pass.satellite.tle_designation} ${timeToAcquisitionFormatted}</b></h5> 
            <p class="card-text"><b>Start</b>: ${startFormatted} UTC</p>
            <p class="card-text"><b>End</b>: ${endFormatted} UTC</p>
            <p class="card-text"><b>Path</b>: ${pass.path} <b>Max El</b>: ${pass.max_el.toFixed(1)} deg.</p></p>
            <p class="card-text">
              <b>Current Dist</b>: <span name="${pass.satellite.tle_designation}_current_dist">${pass.satellite.current_distance.toFixed(1)}</span>
              <b>Current Az</b>: <span name="${pass.satellite.tle_designation}_current_az">${pass.satellite.current_position.az.toFixed(0)}</span>
              <b>Current El</b>: <span name="${pass.satellite.tle_designation}_current_el">${pass.satellite.current_position.el.toFixed(0)}</span>
              <b>Current Velocity</b>: <span name="${pass.satellite.tle_designation}_current_vel">${pass.satellite.current_velocity.toFixed(1)} km/s</span>
            </p>
            <p class="card-text"><b>AMSAT net +ve reports / 2 hours</b>: ${pass.satellite.amsat_status_report_text}</p>
             ${frequencyFormatted}
             ${urlFormatted}
          </div>
        </div>
      </div>
    </div>`
    
    
    inner_HTML_all += pass_HTML
  })

  document.getElementById('div_passes').innerHTML = inner_HTML_all
  
  setTimeout(refresh_display, 1000)
  return true
}







