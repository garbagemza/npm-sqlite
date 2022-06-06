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
    fs.mkdirSync('./tmp/upgrade3')
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
    }
    const t = () => configure(options)
    expect(t).toThrow()
})

test('should upgrade by 1 step at once', () => {
    fs.writeFileSync('./tmp/upgrade3/0.sqlite', 'CREATE TABLE hello (id INTEGER PRIMARY KEY);')
    fs.writeFileSync('./tmp/upgrade3/1.sqlite', 'ALTER TABLE hello ADD COLUMN text TEXT NOT NULL;')

    const options = {
        workdir: './tmp',
        migrationDir: './tmp/upgrade3',
        databaseName: 'doublejump',
        databaseVersion: 2,
    }
    const t = () => configure(options)
    expect(t).not.toThrow()
})
