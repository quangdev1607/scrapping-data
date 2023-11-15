const startBrowser = require('./browser')
const scraperController = require('./scraperController')

let browser = startBrowser()
scraperController(browser)