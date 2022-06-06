//
// query.test (06/05/2022)
//
// MIT License
// Copyright (c) 2022 garbagemza

const fs = require('fs')
const { configure, query } = require('../lib')

beforeAll(() => {
    fs.mkdirSync('./query')
    fs.mkdirSync('./query/upgrade1')
})

afterAll(() => {
    fs.rmSync('./query', {recursive: true, force: true})
})

test('should query', () => {
    const options = {
        workdir: './query',
        databaseName: 'basic'
    }
    const db = configure(options)
    const t = () => query(db, 'SELECT 1;', () => {})
    expect(t).not.toThrow()
})
