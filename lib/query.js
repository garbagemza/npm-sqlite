
const query = function(db, statement, logger) {
    logger(`npm-sqlite.lib.query`)
    return db.prepare(statement).get();
}

module.exports = query
