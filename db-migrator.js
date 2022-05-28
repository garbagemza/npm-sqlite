const fs = require('fs')

const dbMigrator = function(options) {
    const db = options.database
    const logger = options.logger
    const targetVersion = options.targetVersion
    const workdir = options.workdir

    const currentVersion = currentDBVersion(db)

    logger(`npm-sqlite.dbmigrator.current.db.version:  ${currentVersion}`)
    logger(`npm-sqlite.dbmigrator.required.db.version: ${targetVersion}`)

    // get required files
    logger(`npm-sqlite.dbmigrator.required.files`)
    const requiredFiles = getRequiredFiles(workdir, currentVersion, targetVersion)
    requiredFiles.forEach(element => {
        logger(` ${element}`)
    });

    // make sure the required files in workdir/migration/* exist
    logger(`npm-sqlite.dbmigrator.inspect.files`)
    inspectFiles(requiredFiles)

    // load all migration files into memory
    logger(`npm-sqlite.dbmigrator.load.files`)
    const files = loadFiles(requiredFiles)
    files.forEach(file => {
        logger(`npm-sqlite.dbmigrator.file.begin`)
        logger(`  ${file}`)
        logger(`npm-sqlite.dbmigrator.file.end`)
    })

    // split files into statements
    logger(`npm-sqlite.dbmigrator.make.statements`)
    const statements = makeStatements(files)
    statements.forEach(statement => {
        logger(`  ${statement}`)
    })

    // add target version statement
    logger(`npm-sqlite.dbmigrator.add.target.version`)
    statements.push(`PRAGMA user_version = ${targetVersion}`)

    // execute transaction

    logger(`npm-sqlite.dbmigrator.execute.transactions`)
    const transaction = db.transaction((stmts) => {
        for (const stmt of stmts) stmt.run()
    })
    transaction(statements)
}

const currentDBVersion = function(db) {
    const row = db.prepare('PRAGMA user_version;').get()
    return row.user_version
}

const getRequiredFiles = function(workdir, currentVersion, targetVersion) {
    const files = []
    for (let index = currentVersion; index < targetVersion; index++) {
        files.push(`${workdir}/migration/${index}.sqlite`)
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
    return statements
}

module.exports = dbMigrator