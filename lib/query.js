
const getOne = function(db, statement, logger) {
    logger(`npm-sqlite.lib.query.getone`)
    return db.prepare(statement).get();
}

const getAll = function(db, statement, logger) {
    logger(`npm-sqlite.lib.query.getall`)
    return db.prepare(statement).all()
}
module.exports = {
    getOne,
    getAll
}
