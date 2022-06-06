//
// configure.test (06/05/2022)
//
// MIT License
// Copyright (c) 2022 garbagemza

const { configure } = require('../lib')
const fs = require('fs')
const { hasUncaughtExceptionCaptureCallback } = require('process')

beforeAll(() => {
    fs.mkdirSync('./tmp')
})
  
afterAll(() => {
    fs.rmSync('./tmp', {recursive: true, force: true})
})

test('should create basic database', () => {
    const options = {
        workdir: './tmp',
        databaseName: 'basic'
    }
    const t = () => configure(options)
    expect(t).not.toThrow()
})
