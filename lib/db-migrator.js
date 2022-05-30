const fs = require('fs')
const runInTransaction = require('./transaction')

const dbMigrator = function(options) {
    const db = options.database
    const logger = options.logger
    const targetVersion = options.targetVersion
    const migrationDir = options.migrationDir

    const currentVersion = currentDBVersion(db)

    logger(`npm-sqlite.migrator.current.db.version:  ${currentVersion}`)
    logger(`npm-sqlite.migrator.required.db.version: ${targetVersion}`)

    // get required files
    logger(`npm-sqlite.migrator.required.files`)
    const requiredFiles = getRequiredFiles(migrationDir, currentVersion, targetVersion)
    requiredFiles.forEach(element => {
        logger(` ${element}`)
    });

    // make sure the required files in workdir/migration/* exist
    logger(`npm-sqlite.migrator.inspect.files`)
    inspectFiles(requiredFiles)

    // load all migration files into memory
    logger(`npm-sqlite.migrator.load.files`)
    const files = loadFiles(requiredFiles)
    files.forEach(file => {
        logger(`npm-sqlite.migrator.file.begin`)
        logger(`  ${file}`)
        logger(`npm-sqlite.migrator.file.end`)
    })

    // split files into statements
    logger(`npm-sqlite.migrator.make.statements`)
    const statements = makeStatements(files)
    statements.forEach(statement => {
        logger(`-  ${statement}`)
    })

    if (statements.length > 0) {
        // add target version statement
        logger(`npm-sqlite.migrator.add.target.version`)
        statements.push(`PRAGMA user_version = ${targetVersion}`)            
    }
    logger(`npm-sqlite.lib.migrator.transaction`)
    runInTransaction(db, statements, logger)
}

const currentDBVersion = function(db) {
    const row = db.prepare('PRAGMA user_version;').get()
    return row.user_version
}

const getRequiredFiles = function(migrationDir, currentVersion, targetVersion) {
    const files = []
    for (let index = currentVersion; index < targetVersion; index++) {
        files.push(`${migrationDir}/${index}.sqlite`)
    }
    return files
}

const inspectFiles = function(files) {
    files.forEach(function(file) {
        if (!fs.existsSync(file))
            throw Error(`file not found: ${file}`)
    })
}

const loadFiles = function(filenames) {
    const files = []
    filenames.forEach(function(filename) {
        const data = fs.readFileSync(filename, 'utf8');
        files.push(data)
    })
    return files
}

const makeStatements = function(files) {
    const statements = []
    files.forEach(function(file) {
        const sanitized = file.replace(/(\r\n|\n|\r)/gm, "")
        const stmts = sanitized.split(`;`)
        statements.push.apply(statements, stmts)

    })

    const filtered = statements.filter(function (stmt) {
        return stmt !== undefined && stmt != null && stmt != '';
    })
    return filtered
}

module.exports = dbMigrator
