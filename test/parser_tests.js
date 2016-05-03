import test from 'ava'
import sinon from 'sinon'

import * as parser from '../src/parser' // eslint-disable-line

test.serial('parseFile(path) should read file and call parseString', async t => {
  sinon.stub(parser, 'readFile').returns(Promise.resolve('content'))
  sinon.stub(parser, 'parseString').returns(Promise.resolve('parsed'))

  const parsed = await parser.parseFile('path')
  t.is(parsed, 'parsed')
  t.is(parser.parseString.args[0][0], 'content')

  parser.readFile.restore()
  parser.parseString.restore()
})

const parseStringResult = [
  { line: '7', column: '23', severity: 'error', message: 'Extra semicolon. (semi)',
    source: 'eslint.rules.semi', file: '/Users/rolf/dev/lint-filter/README.md' },
  { line: '7', column: '23', severity: 'error', message: 'Extra semicolon. (semi)',
    source: 'eslint.rules.semi', file: '/Users/rolf/dev/lint-filter/src/index.js' },
  { line: '7', column: '23', severity: 'error', message: 'Extra semicolon. (semi)',
    source: 'eslint.rules.semi', file: '/Users/rolf/dev/lint-filter/src/index.js' },
]

test.serial('parseString(str) should parse xml', async t => {
  const xml = await parser.readFile('./fixtures/eslint/extra-semi.xml')
  const parsed = await parser.parseString(xml.toString())
  t.deepEqual(parsed, parseStringResult, JSON.stringify(parsed))
})

test.serial('parseFiles(files) should call parseFile and flatten out the result ', async t => {
  sinon.stub(parser, 'parseFile').returns(Promise.resolve(parseStringResult))
  const result = await parser.parseFiles([
    './fixtures/eslint/extra-semi.xml',
    './fixtures/eslint/extra-semi.xml',
  ])

  t.deepEqual(result, [...parseStringResult, ...parseStringResult])
})
