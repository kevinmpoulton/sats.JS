let satellite_data = [

    {'tle_designation' : 'ISS', 'in_scope': true,  'amsat_status_designations': ['ISS-DATA', 'ISS-DATV', 'ISS-FM'], 'url': 'https://www.ariss.org/current-status-of-iss-stations.html',
    'frequencies' : 
      {
          'Packet': {'description': 'Packet', 'type': 'Packet', 'direction': 'down', 'frequency_mid': 145.800, }
      }
    },

    {'tle_designation' : 'AO-91', 'in_scope': true,  'amsat_status_designations': ['AO-91'], 'url': 'https://www.amsat.org/ao-91-commissioned-declared-open-for-amateur-use/',
    'frequencies' : 
      {
          'Uplink' : {'description' : 'FM uplink 67Hz Tone', 'type': 'FM', 'direction' : 'up', 'frequency_mid' : 435.250},
          'Downlink' : {'description' : 'FM downlink', 'type' : 'FM', 'direction' : 'down', 'frequency_mid' : 145.960}
      }
    },
    
    {'tle_designation' : 'AO-27', 'in_scope': true,  'amsat_status_designations': ['AO-27'], 'url': 'https://www.pe0sat.vgnet.nl/satellite/amateur-radio-satellites/ao-27/',
    'frequencies' : 
      {
          'Uplink' : {'description' : 'FM uplink', 'type': 'FM', 'direction' : 'up', 'frequency_mid' : 145.850},
          'Downlink' : {'description' : 'FM downlink', 'type' : 'FM', 'direction' : 'down', 'frequency_mid' : 436.795}
      }
    },

    {'tle_designation' : 'SO-50', 'in_scope': true, 'amsat_status_designations': ['SO-50'], 'url': 'https://www.amsat.org/two-way-satellites/so-50-satellite-information/',
    'frequencies' : 
        {
            'Uplink' : {'description': 'FM uplink 67Hz Tone + 2s PL Tone 74.4', 'type' : 'FM', 'direction' : 'up', 'frequency_mid': 145.850},
            'Downlink' : {'description' : 'FM downlink', 'type': 'FM', 'direction':'down', 'frequency_mid': 436.795}
        }
    },

    {'tle_designation' : 'CAS-4A', 'in_scope': true, 'amsat_status_designations': ['CAS-4A'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.220},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.870}
        }
    },
    
    {'tle_designation' : 'CAS-4B', 'in_scope': true, 'amsat_status_designations': ['CAS-4B'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.280},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.925}
        }
    },
    
    {'tle_designation' : 'XW-2A', 'in_scope': true, 'amsat_status_designations': ['XW-2A'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.040},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.675}
        }
    },
    
    {'tle_designation' : 'XW-2B', 'in_scope': true, 'amsat_status_designations': ['XW-2B'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.100},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.740}
        }
    },
    
    {'tle_designation' : 'XW-2C', 'in_scope': true, 'amsat_status_designations': ['XW-2C'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.160},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.805}
        }
    },
    
    {'tle_designation' : 'XW-2D', 'in_scope': true, 'amsat_status_designations': ['XW-2D'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.220},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.870}
        }
    },
    
    {'tle_designation' : 'XW-2E', 'in_scope': true, 'amsat_status_designations': ['XW-2E'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.280},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.925}
        }
    },
    
    {'tle_designation' : 'XW-2F', 'in_scope': true, 'amsat_status_designations': ['XW-2F'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.340},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.990}
        }
    },
    
    {'tle_designation' : 'AO-07', 'in_scope': true, 'amsat_status_designations': ['[A]_AO-7', '[B]_AO-7'], 'url': 'https://ukamsat.files.wordpress.com/2017/03/camsat-cas-4a-and-cas-4b-news-release.pdf',
    'frequencies' : 
        {
            'Uplink' : {'description': 'B Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.150},
            'Downlink' : {'description' : 'B Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.950}
        }
    },
    
    {'tle_designation' : 'RS-44', 'in_scope': true, 'amsat_status_designations': ['RS-44'], 'url': 'https://amsat-uk.org/2020/04/30/dosaaf-85-rs-44-amateur-radio-transponder-activated/',
    'frequencies' : 
        {
            'Beacon' : {'description': 'Beacon', 'type' : 'beacon', 'direction' : 'down', 'frequency_mid': 435.605},
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 145.965},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 435.640}
        }
    },
    
    {'tle_designation' : 'PO-101', 'in_scope': true, 'amsat_status_designations': ['PO-101[FM]'], 'url': 'http://www.amsatuk.me.uk/iaru/formal_detail.php?serialnum=593',
    'frequencies' : 
        {
            'Beacon' : {'description': 'Beacon', 'type' : 'beacon', 'direction' : 'down', 'frequency_mid': 435.605},
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 145.965},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 435.640}
        }
    },
    
    {'tle_designation' : 'IO-86', 'in_scope': true, 'amsat_status_designations': ['IO-86'], 'url': 'https://amsat-uk.org/tag/io-86/',
    'frequencies' : 
        {
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 145.880},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 435.880}
        }
    },
    
    {'tle_designation' : 'TO-108', 'in_scope': true, 'amsat_status_designations': ['TO-108'], 'url': 'https://www.amsat.se/2020/06/28/cas-6-to-108/',
    'frequencies' : 
        {
            'Beacon' : {'description': 'Beacon', 'type' : 'beacon', 'direction' : 'down', 'frequency_mid': 145.925},
            'Uplink' : {'description': 'Linear Uplink', 'type' : 'linear', 'direction' : 'up', 'frequency_mid': 435.280},
            'Downlink' : {'description' : 'Linear Downlink', 'type': 'linear', 'direction':'down', 'frequency_mid': 145.925}
        }
    }

]