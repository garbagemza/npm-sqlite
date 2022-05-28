
const dbMigrator = function(requiredVersion, db, logger) {
    const currentVersion = currentDBVersion(db)

    logger(`npm-sqlite.dbmigrator.current.db.version:  ${currentVersion}`)
    logger(`npm-sqlite.dbmigrator.required.db.version: ${requiredVersion}`)

    for (let index = currentVersion; index < requiredVersion; index++) {
        logger(`npm-sqlite.dbmigrator.migrating.db from ${index} to ${index + 1}`)
        const transaction = db.transaction((stmts) => {
            for (const stmt of stmts) stmt.run()
        })
        const statements = prepareStatements(index + 1, db)
        transaction(statements)
    }
}
const prepareStatements = function(desiredVersion, db) {
    return [
        db.prepare('CREATE TABLE deploys (id INTEGER PRIMARY KEY, uuid STRING NOT NULL, issuedAt STRING NOT NULL);'),
        db.prepare(`PRAGMA user_version = ${desiredVersion}`)
    ]
}

const currentDBVersion = function(db) {
    const row = db.prepare('PRAGMA user_version;').get()
    return row.user_version
}

module.exports = dbMigrator