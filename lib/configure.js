const dbMigrator = require('./db-migrator')

const configure = function(options) {
    const logger = options.verbose || function() {}
    logger(`npm-sqlite.lib.configure`)
    logger(`-  workdir:         ${options.workdir}`)
    logger(`-  migrationDir:    ${options.migrationDir}`)
    logger(`-  databaseName:    ${options.databaseName}`)
    logger(`-  databaseVersion: ${options.databaseVersion}`)

    const database = require('better-sqlite3')(`${options.workdir}/${options.databaseName}`, { verbose: logger })
    
    const migrationOptions = {
        targetVersion: options.databaseVersion,
        database: database,
        logger: logger,
        workdir: options.workdir,
        migrationDir: options.migrationDir
    }
    dbMigrator(migrationOptions)
    return database
}

module.exports = configure
