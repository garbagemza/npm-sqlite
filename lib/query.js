
const query = function(db, statement, logger) {
    logger(`npm-sqlite.lib.query.query`)
    return db.prepare(statement).all()
}

module.exports = query
