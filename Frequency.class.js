class Frequency {
    constructor(initialisation) {
        /* To do - validation on this object */

        this.description = initialisation.description       
        this.type = initialisation.type
        this.direction = initialisation.direction
        this.frequency_mid = initialisation.frequency_mid
        this.access_details  = initialisation.access_details
        this.url = initialisation.url
        
        this.frequency_mid_up = initialisation.frequency_mid_up
        this.frequency_mid_down = initialisation.frequency_mid_down
        this.bandwidth = initialisation.bandwidth
    }

    static formatAsString(frequency) {
        return (Math.floor(frequency * 1000000)).toLocaleString("en-US")
    }

    static adjustForDoppler(frequency, direction, velocity) {
        let dopplerCorrection = velocity / 3e5  
        let frequencyCorrectedDoppler = 5
        
        if(direction == 'down') {
            frequencyCorrectedDoppler = frequency + dopplerCorrection * frequency
        }
        
        if(direction == 'up') {
            frequencyCorrectedDoppler= frequency - dopplerCorrection * frequency
        } 

        return frequencyCorrectedDoppler

    }

    getFormattedLinear(velocity) {
        let table = []
        for(let sampleFrequency = -this.bandwidth / 2 + 0.0025; sampleFrequency <= this.bandwidth / 2; sampleFrequency += 0.0025) {
            let freq_up = this.frequency_mid_up + sampleFrequency
            let freq_down = this.frequency_mid_down  - sampleFrequency
            table.push([
                    Frequency.formatAsString(Frequency.adjustForDoppler(freq_up, 'up', velocity)),
                    Frequency.formatAsString(freq_up), 
                    Frequency.formatAsString(freq_down),
                    Frequency.formatAsString(Frequency.adjustForDoppler(freq_down, 'down', velocity))
                ])
        }

        return table
    }

}
