const configure = require('./configure')
const runInTransaction = require('./transaction')
const {getOne, getAll } = require('./query')

module.exports = {
    configure,
    runInTransaction,
    getOne,
    getAll
}
