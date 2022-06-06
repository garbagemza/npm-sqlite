const runInTransaction = function(db, statements, logger) {
    logger(`npm-sqlite.lib.transaction.prepare.statements`)
    const preparedStatements = prepareStatements(db, statements)

    logger(`npm-sqlite.lib.transaction.execute`)
    const transaction = db.transaction((stmts) => {
        for (const stmt of stmts) stmt.run()
    })
    transaction(preparedStatements)
}

const prepareStatements = function(db, statements) {
    return statements.map(function(stmt) {
        return db.prepare(stmt)
    })
}

module.exports = runInTransaction
