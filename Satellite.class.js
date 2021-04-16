/*  Calculate the day number. Note this isn't quite the Julian day number, but it 
    serves the same purpose - allows a day number to be provided to create 
    accurate time deltas between two times to be calculated. 
    
    Note month is assumed to be 1=Jan, 2=Feb etc, unlike the UTCMonth() function of datetime 

    */ 

function get_day_number(day, month, year, hour = 0, minute = 0, second = 0) {
    
    let day_number = 0

    if(month < 3) {
        year -= 1
        month += 12
    }

    day_number = Math.floor(365.25 * (year)) - Math.floor(19 + year/100) + Math.floor(4.75+year/400) - 16
    day_number = day_number + day + 30 * month + Math.floor(0.6 * month - 0.3)
    day_number = day_number + hour / 24
    day_number = day_number + minute / (24*60)
    day_number = day_number + second / (24*60*60)

    return day_number
}

/* Main satellite class. To work it needs to have it's properties manually set which is done in the 
   instantiation section (not in the constructor) */

class Satellite {
  constructor(metadata) {
      this.tle_designation = metadata.tle_designation
      this.amsat_status_designations = metadata.amsat_status_designations
      this.frequencies = metadata.frequencies

      this.readers = []

      for(let i = 0; i < this.amsat_status_designations.length; ++i) {
        this.readers[this.amsat_status_designations[i]] = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP')
        var xr = this.readers[this.amsat_status_designations[i]]
        xr.id = this.amsat_status_designations[i]
        let amsat_status_url = 'https://api.secondinternet.com/satellites/statuses/' +  this.amsat_status_designations[i] 
        xr.open('get',amsat_status_url , true); 
        xr.send()
        
      }
      
  }
 
  /* Prediction method. For a particular latitude, longitude, height and prediction time it returns the 
     time, azimuth and elevation for the satellite at that time */

  predict(station_latitude, station_longitude, station_height, prediction_time) {
  
    /* Calculate the epoch day count that this relates to */
    let dn = get_day_number(0, 1, 2000 + this.y0_epoch_year)
    this.t0_epoch_day = dn + this.d0_epoch_day

    dn = get_day_number(
        prediction_time.getUTCDate(), 
        prediction_time.getUTCMonth() + 1, 
        prediction_time.getUTCFullYear(),
        prediction_time.getUTCHours(), 
        prediction_time.getUTCMinutes(),
        prediction_time.getUTCSeconds())
        

    let t1_start_of_year =prediction_time.getUTCFullYear() - 2000 - 1


    // 160-190 Calculate Greenwich siderial correction
    let de = Math.floor(365.25 * (t1_start_of_year-80)) - Math.floor(t1_start_of_year/100) + Math.floor(t1_start_of_year/400 + 0.75) + 366
    t1_start_of_year = (de + 29218.5) / 36525
    t1_start_of_year = 6.6460656 + t1_start_of_year * (2400.051262 + t1_start_of_year * 2.581e-5)
    let se_siderial_correction = t1_start_of_year / 24 - prediction_time.getUTCFullYear()


    // 200-210 define constants
    const g0_earth_mass = 7.5369793e13                // Earth mass constant (I think this is equivilant to GM/4pi^2 * (86400*86400))
    const g1_siderial_correction = 1.0027379093       // Siderial time correction
    const pi = 3.14159265                             // Pi
    const tau = 2 * pi                                // Tau
    const p0 = pi / 180                               // ratio of radians to degrees

    // 220-250 - sort out day number of start time
    let t_analysis = dn
    
    // 260 - define more constants
    const r0_earth_radius = 6378.16            // Mean earth radius
    const f_oblateness = 1 / 298.25          // Earth oblateness correction

    // 270-280 - interchangably of mean motion and semi-major axis
    // This is a implementation of Kepler's third law that states the ratio of the square
    // of an objects orbital period with the cube of the semi-major axis of its orbit is the
    // same for all objectes orbiting the same primary i.e. (1/n0)^2 / a0^3 = k
    // or alternatively  a0^3 / (1/n0)^2 = (g0 * 9.81) / (4*pi*pi)
    // n0 is quoted in orbits per day!
    
    if(this.n0_mean_motion > 0.1) {
        this.a0_semi_major_axis = ((g0_earth_mass/(this.n0_mean_motion*this.n0_mean_motion)) ** (1/3))
    } else {
        this.n0_mean_motion = Math.sqrt(g0_earth_mass / (this.a0_semi_major_axis ** 3))
    }
    
    
    // 290-300 - dimensions of the ellipse and total orbital phase
    let e2 = 1 - this.e0_eccentricity * this.e0_eccentricity
    let e1 = Math.sqrt(e2)
    let q0_total_orbits = this.m0_mean_anomoly / 360 + this.k0


    // 320 - nodal effects for non-uniform gravity field
    // See https://en.wikipedia.org/wiki/Nodal_precession
    // probably rad/sec?

    let k2_precession_rate = 9.95 * ((r0_earth_radius/this.a0_semi_major_axis) ** 3.5) / (e2 * e2)


    // 330 get sine and cosine of inclination
    let s1_sine_inclination = Math.sin(this.i0_inclination * p0)
    let c1_cos_inclination  = Math.cos(this.i0_inclination * p0)
    let l8_latitude_rads = station_latitude * p0

    // 340 - get the station earth centred co-ordinates

    let s9_sine_latitude = Math.sin(l8_latitude_rads)
    let c9_cos_latitude = Math.cos(l8_latitude_rads)
    let s8_sine_longitude = Math.sin(-station_longitude * p0)
    let c8_cos_longitude = Math.cos(station_longitude * p0)

    // 350 - correct earth radius for oblateness
    // This actually seems pretty straight forwrad - pro-rata the oblateness accross the 90° of latitude 
    // and add on height. 
    let r9_station_height = r0_earth_radius * (1-(f_oblateness/2) * (Math.cos(2*station_latitude*p0)-1)) + station_height/1000


    // 360-390 get station co-ordinates in matrix (x,y,z) format
    l8_latitude_rads = Math.atan((1-f_oblateness)**2*s9_sine_latitude/c9_cos_latitude)
    let z9 = r9_station_height * Math.sin(l8_latitude_rads)
    let x9 = r9_station_height * Math.cos(l8_latitude_rads) * c8_cos_longitude
    let y9 = r9_station_height * Math.cos(l8_latitude_rads) * s8_sine_longitude

    // 400-410 prepare keplarian paramters for positional matrix. Also update RA and Perigree from epoch to calculation time
    let o = p0 * (this.o0_ra_ascending-(t_analysis-this.t0_epoch_day)*k2_precession_rate*c1_cos_inclination)
    let s0 = Math.sin(o)
    let c0 = Math.cos(o)
    let w = p0 * (this.w0_perigree+(t_analysis-this.t0_epoch_day)*k2_precession_rate*(2.5*c1_cos_inclination*c1_cos_inclination-0.5))
    let s2 = Math.sin(w)
    let c2 = Math.cos(w)
      

    // 420-470 co-ordinate rotational matrix for current time to help define satellite position relative to fixed stars
    let c = [[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
        
    c[1][1] = c2 * c0 - s2 * s0 * c1_cos_inclination
    c[1][2] = -s2 * c0 - c2 * s0 * c1_cos_inclination
    c[2][1] = c2 * s0 + s2 * c0 * c1_cos_inclination
    c[2][2] = -s2 * s0 + c2 * c0 * c1_cos_inclination
    c[3][1] = s2 * s1_sine_inclination
    c[3][2] = c2 * s1_sine_inclination


    // 480 update orbital base data
    let q = this.n0_mean_motion * (t_analysis-this.t0_epoch_day) + q0_total_orbits
    q = q - Math.floor(q)
    let m9 = Math.floor(q * 256)
    let m_mean_anomoly_adjusted = q * tau

    // 490-510 solve elliptical orbit equation using iteration
    let e_eccentric_anomoly = m_mean_anomoly_adjusted + this.e0_eccentricity * (Math.sin(m_mean_anomoly_adjusted) + 0.5 * this.e0_eccentricity * Math.sin(m_mean_anomoly_adjusted*2))

    while(true) {
        var s3 = Math.sin(e_eccentric_anomoly)
        var c3 = Math.cos(e_eccentric_anomoly)
        var r3 = 1 - this.e0_eccentricity * c3
        let m1 = e_eccentric_anomoly - this.e0_eccentricity * s3
        let m5 = m1 - m_mean_anomoly_adjusted

        if(Math.abs(m5) < 1e-6) {
            break
        }

        e_eccentric_anomoly = e_eccentric_anomoly - m5 / r3
    }

    // At this point s3, c3 should have the sin/cosine satellite eccentric anomaly

    // 530 transform sat co-ordinates relative to the orbit
    let x0 = this.a0_semi_major_axis * (c3 - this.e0_eccentricity)
    let y0 = this.a0_semi_major_axis  * e1 * s3
    let r = this.a0_semi_major_axis * r3

    // 540-560 transform sat co-ordinates relative to the stars
    let x1 = x0 * c[1][1] + y0 * c[1][2]
    let y1 = x0 * c[2][1] + y0 * c[2][2]
    let z1 = x0 * c[3][1] + y0 * c[3][2]

    // 570-580 transform sat co-ordinates relative to the earth
    
    let g7 = (t_analysis-de) * g1_siderial_correction + se_siderial_correction
    g7 = tau*(g7-Math.floor(g7))
    
    let  s7 = -Math.sin(g7)

    let c7 = Math.cos(g7) 
    let x = x1 * c7 - y1 * s7
    let y = x1 * s7 + y1 * c7
    let z  = z1

    // 590-740 transform sat co-ordinates relative to the station


    let x5 = x - x9
    let y5 = y - y9
    let z5 = z - z9


    let r5 = x5 * x5 + y5 * y5 + z5 * z5
                                                                    
    
    let z8 = x5 * c8_cos_longitude * c9_cos_latitude + y5 * s8_sine_longitude * c9_cos_latitude + z5 * s9_sine_latitude
    let x8 = -x5 * c8_cos_longitude * s9_sine_latitude - y5 * s8_sine_longitude * s9_sine_latitude + z5 * c9_cos_latitude
    let y8 = y5 * c8_cos_longitude - x5 * s8_sine_longitude

    let e9 = Math.atan(z8 / Math.sqrt(r5 - z8 * z8)) / p0           // elevation
    let a9 = Math.atan(y8/x8) / p0                                  // azimuth
    let l5 = Math.atan(z/Math.sqrt(r*r-z*z)) / p0
    let w5 = -Math.atan(y/x) / p0
    
    if(x < 0) {
        w5 = 180 + w5
    }
    if(w5 < 0) { 
        w5 = 360 + w5
    }
    if(x8 < 0) {
        a9 = 180 + a9
    }
    if(a9 < 0) {
        a9 = 360 + a9
    }
    
    let t4 = Math.floor((t_analysis-Math.floor(t_analysis))*2400+0.5)/100
    t4 = 100*((t4-Math.floor(t4))*0.6+Math.floor(t4))

    return {'utc': t4, 'az': (a9 + 0.5), 'el': (e9+0.5)}
  }

}