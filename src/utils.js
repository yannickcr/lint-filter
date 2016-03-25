import _ from 'lodash'
import cp from 'child_process'
import Promise from 'bluebird'
import inRange from 'in-range'

const exec = Promise.promisify(cp.exec)

export function parseDiffRanges(diff) {
  const matches = diff.match(/\@\@ -\d+,\d+ \+(\d+),(\d+) \@\@/g)
  if (!_.isEmpty(matches)) {
    return matches.map(match => /\@\@ -\d+,\d+ \+(\d+),(\d+) \@\@/.exec(match).slice(1, 3))
  }
  return null
}

export function isLineInDiff({ file, line }) {
  return new Promise((resolve, reject) => {
    exec(`git diff origin/master... ${file}`, (error, stdout) => {
      if (error) {
        return reject(error)
      }
      return resolve(stdout)
    })
  })
  .then(parseDiffRanges)
  .then(ranges => {
    if (ranges) {
      return ranges.map(([addStart, addEnd]) =>
        inRange(parseInt(line, 10), parseInt(addStart, 10), parseInt(addEnd, 10))
      )
    }
    return []
  })
}