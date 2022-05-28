const dbMigrator = require('./db-migrator')

var database = {}
var logger = function() {}

const configure = function(options) {
    logger = options.verbose || function() {}
    logger(`npm-sqlite.configure ${JSON.stringify(options)}`)
    database = require('better-sqlite3')(`${options.workdir}/${options.databaseName}`, { verbose: logger })
    
    const migrationOptions = {
        targetVersion: options.databaseVersion,
        database: database,
        logger: logger,
        workdir: options.workdir
    }
    dbMigrator(migrationOptions)

}

module.exports = {
    configure: configure
}