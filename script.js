var MAX_STOCKS = 3

class Entrant {
    /**
     * 
     * @param {String} name 
     */
    constructor(name) {
        this.name = name ?? "Unknown Player"
        this.stocks = MAX_STOCKS
    }

    kill() {
        this.stocks = 0
    }

    /**
     * 
     * @param {Number} amount 
     * @returns {Number} The number of stocks that were not removed
     */
    subtractStocks(amount) {
        if (amount === 0) return 0
        if (this.stocks > 0) {
            this.stocks--
            return this.subtractStocks(amount - 1)
        }
        return amount
    }

    addStocks(amount) {
        if (amount === 0) return 0
        if (this.stocks < MAX_STOCKS) {
            this.stocks++;
            return this.addStocks(amount - 1)
        }
        return amount
    }
}

class Crew {
    /**
     * 
     * @param {String} name 
     * @param {Array<Entrant>} players 
     */
    constructor(name, players) {
        this.name = name ?? "Unnamed Crew"
        this.entrants = players ?? [new Entrant("No Players")]
        this.ready = false
    }

    /**
     * 
     * @param {1|2} id 
     */
    updatePreview(id) {
        let rawPlayers
        switch (id) {
            case 1:
                rawPlayers = (document.getElementById("crew-one-members").value || "No Players").split("\n")
                this.name = (document.getElementById("crew-one-name").value || "No Name")
                this.entrants = rawPlayers.map(p => new Entrant(p))

                document.getElementById("setup-preview-crew-one").innerHTML = this.generatePreview()
                break
            case 2:
                rawPlayers = (document.getElementById("crew-two-members").value || "No Players").split("\n")
                this.name = (document.getElementById("crew-two-name").value || "No Name")
                this.entrants = rawPlayers.map(p => new Entrant(p))

                document.getElementById("setup-preview-crew-two").innerHTML = this.generatePreview()
                break
            default:
                throw RangeError(`Invalid crew id (expected 1 or 2, got ${id})`)
        }
    }

    /**
     * 
     * @param {1|2} id 
     * @returns {void}
     */
    updateBattle(id) {
        if (!this.ready) return false
        
        switch (id) {
            case 1:
                document.getElementById(`battle-crew-one-members`).innerHTML = `${this.entrants.map(p=>`<div class="battle-entry">${p.name} - ${p.stocks}</div>`).join("")}`
                break
            case 2:
                document.getElementById(`battle-crew-two-members`).innerHTML = `${this.entrants.map(p=>`<div class="battle-entry">${p.name} - ${p.stocks}</div>`).join("")}`
                break
            default:
                throw RangeError(`Invalid crew id (expected 1 or 2, got ${id})`)
        }
    }

    updateMiniHud(id) {
        if (!this.ready) return false

        switch (id) {
            case 1:
                document.getElementById('mini-player-one').innerHTML = `${(this.entrants.find(e => e.stocks > 0) || {name: ""}).name}`
                document.getElementById('mini-player-one').dataset.value = (this.entrants.find(e => e.stocks > 0) || {stocks: ""}).stocks
                document.getElementById('mini-name-one').dataset.value = this.stocks
                break
            case 2:
                document.getElementById('mini-player-two').innerHTML = `${(this.entrants.find(e => e.stocks > 0) || {name: ""}).name}`
                document.getElementById('mini-player-two').dataset.value = (this.entrants.find(e => e.stocks > 0) || {stocks: ""}).stocks
                document.getElementById('mini-name-two').dataset.value = this.stocks
                break
            default:
                throw RangeError(`Invalid crew id (expected 1 or 2, got ${id})`)
        }
    }

    /**
     * 
     * @param {1|2} id 
     */
    setup(id) {
        this.ready = true
        this.updateBattle(id)
        switch (id) {
            case 1:
                document.getElementById('mini-name-one').innerHTML = this.name
                break
            case 2:
                document.getElementById('mini-name-two').innerHTML = this.name
                break
            default: 
                throw RangeError(`Invalid crew id (expected 1 or 2, got ${id})`)
        }
        //console.log(document.getElementById('battle-crew-one-members').innerHTML)
    }

    /**
     * 
     * @param {Number} count 
     * @returns {Number} Amount of stocks not removed (0 if all of them were removed)
     */
    subtractStocks(count) {
        count ??= 1
        let did
        entrants: for (let e in this.entrants) if (this.entrants[e].stocks > 0) {
            this.entrants[e].stocks--
            did = true
            break entrants
        }
        if (!did) return count
        if (count > 1) return this.subtractStocks(count - 1)
        return 0
    }

    killActivePlayer() {
        // this is kinda weird looking but it tries to find the current player, and kills them, or does nothing if there is no current player
        (this.entrants.find(e => e.stocks > 0) || {kill: ()=>{}}).kill()
    }

    /**
     * 
     * @param {Number} count 
     * @returns 
     */
    addStocks(count) {
        count ??= 1
        let did
        entrants: for (let e = this.entrants.length; e > 0; e--) if (this.entrants[e-1].stocks < MAX_STOCKS) {
            this.entrants[e-1].stocks++
            did = true
            break entrants
        }
        if (!did) return count
        if (count > 1) return this.addStocks(count - 1)
        return 0
    }
    
    get stocks() {
        let total = 0
        this.entrants.forEach(e => {
            total += e.stocks
        })
        return total
    }

    generatePreview() {
        return `<div class="preview-team">${this.name}</div><hr>${this.entrants.map(p=>`<div class="preview-entry">${p.name}</div>`).join("")}`
    }

    static team1 = new Crew()
    static team2 = new Crew()
}

function updatePreviews() {
    Crew.team1.updatePreview(1)
    Crew.team2.updatePreview(2)
}

function u() {
    Crew.team1.updateBattle(1)
    Crew.team2.updateBattle(2)

    if (Crew.team1.stocks <= 0) {
        // team 2 wins
        return
    }
    if (Crew.team2.stocks <= 0) {
        // team 1 wins
        return
    }
}

function startCrewBattle() {
    // TODO: verify teams
    document.getElementById('crew-setup').classList.remove('active')
    document.getElementById('battle').classList.add('active')

    Crew.team1.setup(1)
    Crew.team2.setup(2)
}

function resetCrewBattle() {
    document.getElementById("crew-one-name").value = null
    document.getElementById("crew-one-members").value = null
    document.getElementById("crew-two-name").value = null
    document.getElementById("crew-two-members").value = null
    updatePreviews()
}

if (window.location.hash === "#battle") startCrewBattle()