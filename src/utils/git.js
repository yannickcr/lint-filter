import _ from 'lodash'

import spawn from './spawn'

export function parseDiffRanges(diff) {
  const matches = diff.match(/^@@ -\d+,\d+ \+(\d+),(\d+) @@/gm)
  if (!_.isEmpty(matches)) {
    return matches.map(match => {
      const [start, end] = /^@@ -\d+,\d+ \+(\d+),(\d+) @@/.exec(match).slice(1, 3)
      return [parseInt(start, 10), parseInt(start, 10) + parseInt(end, 10)]
    })
  }
  return []
}

const filenameRegex = /^a\/([^\n]+) b\/[^\n]+/
export function parseDiffForFile(diff) {
  const matches = filenameRegex.exec(diff)
  if (matches === null) {
    return null
  }
  const filename = matches[1]
  return { filename, ranges: parseDiffRanges(diff) }
}

export function parseFullDiff(diff) {
  return _(`\n${diff}`.split('\ndiff --git '))
    .map(parseDiffForFile)
    .filter(_.isObject)
    .reduce((lastValue, { filename, ranges }) => _.assign(
      {},
      lastValue,
      { [filename]: lastValue[filename] ? _.concat(lastValue[filename], ranges) : ranges })
    , {})
}

export async function getDiffInformation({ branch = 'origin/master', hash } = {}) {
  const diffAgainst = hash || await spawn('git', ['merge-base', branch, 'HEAD'])
  return parseFullDiff(await spawn('git', ['diff', diffAgainst.trim()]))
}
