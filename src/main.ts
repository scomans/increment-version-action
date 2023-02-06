import * as core from '@actions/core'
import * as github from '@actions/github'
import {inc} from 'semver'


async function run(): Promise<void> {
  const repo = (core.getInput('repo') ?? process.env.GITHUB_REPOSITORY).split('/')
  const releaseType = core.getInput('releaseType').toLowerCase()
  const token = core.getInput('github_token')
  const tagPrefix = core.getInput('tagPrefix')

  if (repo.length !== 2) {
    core.setFailed(`Invalid repo "${(core.getInput('repo') ?? process.env.GITHUB_REPOSITORY)}". Must be in the format: <owner>/<repo>`)
    return
  }

  switch (releaseType) {
    case 'major':
    case 'minor':
    case 'patch':
      break
    default:
      core.setFailed(`Invalid release type "${releaseType}". Must be one of: MAJOR, MINOR, PATCH`)
      return
  }

  const octokit = github.getOctokit(token)
  const res = await octokit.rest.repos.listReleases({repo: repo[1], owner: repo[0]})

  let latestVersion = res.data.filter(release => !release.prerelease)[0].tag_name ?? '0.0.0'
  core.info(`ℹ️ Current latest version ${latestVersion}`)
  if (tagPrefix && latestVersion.startsWith(tagPrefix)) {
    latestVersion = latestVersion.substring(tagPrefix.length)
  }
  core.info(`ℹ️ Current latest version (without prefix) ${latestVersion}`)
  let newVersion = inc(latestVersion, releaseType)

  core.setOutput('newVersion', newVersion)
  core.info(`ℹ️ Setting new version to ${newVersion}`)
}

void run()
