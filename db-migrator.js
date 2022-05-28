const fs = require('fs')

const dbMigrator = function(options) {
    const db = options.database
    const logger = options.logger
    const targetVersion = options.targetVersion
    const workdir = options.workdir

    const currentVersion = currentDBVersion(db)

    logger(`npm-sqlite.migrator.current.db.version:  ${currentVersion}`)
    logger(`npm-sqlite.migrator.required.db.version: ${targetVersion}`)

    // get required files
    logger(`npm-sqlite.migrator.required.files`)
    const requiredFiles = getRequiredFiles(workdir, currentVersion, targetVersion)
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

    // prepare statements
    logger(`npm-sqlite.migrator.prepare.statements`)
    const preparedStatements = prepareStatements(db, statements)

    if (preparedStatements.length > 0) {
        // execute transaction
        logger(`npm-sqlite.migrator.execute.transactions`)
        const transaction = db.transaction((stmts) => {
            for (const stmt of stmts) stmt.run()
        })
        transaction(preparedStatements)        
    }
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

    const filtered = statements.filter(function (stmt) {
        return stmt !== undefined && stmt != null && stmt != '';
    })
    return filtered
}

const prepareStatements = function(db, statements) {
    return statements.map(function(stmt) {
        return db.prepare(stmt)
    })
}

module.exports = dbMigrator