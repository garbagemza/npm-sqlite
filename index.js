
var database = {}
var logger = function() {}

const configure = function(options) {
    logger = options.verbose || function() {}
    logger(`npm-sqlite.configure ${JSON.stringify(options)}`)
    database = require('better-sqlite3')(`${options.workdir}/${options.databaseName}`, { verbose: logger })

}

module.exports = {
    configure: configure
}