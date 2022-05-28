const configure = function(options) {
    const v = options.verbose
    v(`npm-sqlite.configure ${JSON.stringify(options)}`)
}

module.exports = {
    configure: configure
}