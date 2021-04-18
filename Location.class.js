class Location {
    constructor(input) {
        
        this.valid = false

        this.latitude = 0
        this.longitude = 0
        this.height = 0

        this.maidenhead = ''

        /* Work out what kind of location this is and validate it */
        if(typeof input == 'string') {
            
            input = input.trim().toLowerCase()

			let maidenheadPattern = /^[a-r][a-r][0-9][0-9][a-x][a-x]$/
            let match = input.match(maidenheadPattern)
            if(match && input === match[0]) {

                let characters = input.split('')
  
                this.longitude = 20 * (characters[0].charCodeAt(0)-97) + 2 * (characters[2].charCodeAt(0)-48) + (5/60) * (characters[4].charCodeAt(0)-97) - 180 
                this.latitude  = 10 * (characters[1].charCodeAt(0)-97) + 1 * (characters[3].charCodeAt(0)-48) + (2.5/60) * (characters[5].charCodeAt(0)-97) - 90 
                this.height    = 0

                this.maidenhead = input
                this.valid = true
            }
			
        }

    }
}