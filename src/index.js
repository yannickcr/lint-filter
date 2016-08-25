// @flow
/* eslint-disable no-console */
import _ from 'lodash'
import program from 'commander'
import stdin from 'stdin'
import Promise from 'bluebird'

import info from '../package.json'
import { checkFiles, checkString } from './checks'
import { formatOutput } from './formatters'
import { hasError } from './utils'
import { getDiffInformation } from './utils/git'
import { setSeverityToWarning } from './utils/checkstyle'
import setup from './setup'

function handleResult(result, options) {
  const output = options.warning ? _.map(result, setSeverityToWarning) : result
  console.log(formatOutput(options.format, output))
  process.exit(hasError(output) ? 1 : 0)
}

export default async function main(): Promise<> {
  program
    .version(info.version)
    .usage('[options] <subcommand|file ...>')
    .option('-f, --format [format]', 'The output format.', 'text')
    .option('-b, --branch [branch]', 'The branch to diff against.')
    .option('-l, --linter [linter]', 'The linter that is used in the project.', 'eslint')
    .option('-w, --warning', 'Make all errors that make it through the filter a warning')
    .parse(process.argv)

  if (program.args[0] === 'generate-config') {
    return setup(program)
  }

  const diff = await getDiffInformation(program)

  if (program.args.length === 0) {
    const input = await new Promise(resolve => stdin(resolve))
    const result = await checkString(diff, input, program)
    return handleResult(result, program)
  }

  if (program.args[0] === 'list-files') {
    return console.log(_.keys(diff).join(' '))
  }

  const result = await checkFiles(diff, program.args, program)
  return handleResult(result, program)
}

if (!module.parent) {
  exports.default()
}
