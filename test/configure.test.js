//
// configure.test (06/05/2022)
//
// MIT License
// Copyright (c) 2022 garbagemza

const { configure } = require('../lib')
const fs = require('fs')

beforeAll(() => {
    fs.mkdirSync('./tmp')
    fs.mkdirSync('./tmp/upgrade1')
    fs.mkdirSync('./tmp/upgrade2')
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

test('should trigger db upgrade from 0', () => {
    fs.writeFileSync('./tmp/upgrade1/0.sqlite', 'CREATE TABLE hello (id INTEGER PRIMARY KEY);')

    const options = {
        workdir: './tmp',
        migrationDir: './tmp/upgrade1',
        databaseName: 'upgrade',
        databaseVersion: 1,
    }
    const t = () => configure(options)
    expect(t).not.toThrow()
})

test('should not find upgrade files', () => {
    const options = {
        workdir: './tmp',
        migrationDir: './tmp/upgrade2',
        databaseName: 'lostmigration',
        databaseVersion: 1,
        verbose: console.log
    }
    const t = () => configure(options)
    expect(t).toThrow()
})