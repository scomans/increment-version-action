import * as core from '@actions/core'
import * as github from '@actions/github'
import {inc, ReleaseType} from 'semver'


async function run(): Promise<void> {
  const repo = core.getInput('repo').toUpperCase().split('/')
  const releaseType = core.getInput('releaseType').toUpperCase()
  const token = core.getInput('github_token')

  if (repo.length !== 2) {
    core.setFailed(`Invalid repo "${releaseType}". Must be in the format: <owner>/<repo>`)
    return
  }

  switch (releaseType) {
    case 'MAJOR':
    case 'MINOR':
    case 'PATCH':
      break
    default:
      core.setFailed(`Invalid release type "${releaseType}". Must be one of: MAJOR, MINOR, PATCH`)
      return
  }

  const octokit = github.getOctokit(token)
  const res = await octokit.rest.repos.listReleases({repo: repo[1], owner: repo[0]})

  const latestVersion = res.data.filter(release => !release.prerelease)[0].tag_name ?? '0.0.0'
  let newVersion = inc(latestVersion, releaseType as ReleaseType)

  core.setOutput('newVersion', newVersion)
  core.info(`ℹ️ Setting new version to ${newVersion}`)
}

void run()
