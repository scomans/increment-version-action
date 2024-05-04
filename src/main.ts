import * as core from '@actions/core';
import * as github from '@actions/github';
import { inc, major } from 'semver';

async function run(): Promise<void> {
  const releaseType = core.getInput('releaseType').toLowerCase();
  const token = core.getInput('github_token');
  const tagPrefix = core.getInput('tagPrefix') || undefined;
  const yearUpdate = core.getBooleanInput('year');
  let repo = (core.getInput('repo') || undefined)?.split('/');
  repo ||= [github.context.repo.owner, github.context.repo.repo];

  if (repo.length !== 2) {
    core.setFailed(`Invalid repo "${repo.join('/')}". Must be in the format: <owner>/<repo>`);
    return;
  }

  switch (releaseType) {
    case 'major':
    case 'minor':
    case 'patch':
      break;
    default:
      core.setFailed(`Invalid release type "${releaseType}". Must be one of: MAJOR, MINOR, PATCH`);
      return;
  }

  const octokit = github.getOctokit(token);
  const res = await octokit.rest.repos.listReleases({
    repo: repo[1],
    owner: repo[0]
  });

  let latestVersion = res.data.filter(release => !release.prerelease)[0].tag_name ?? '0.0.0';
  core.info(`ℹ️ Current latest version ${latestVersion}`);
  if (tagPrefix && latestVersion.startsWith(tagPrefix)) {
    latestVersion = latestVersion.substring(tagPrefix.length);
  }
  core.info(`ℹ️ Current latest version (without prefix) ${latestVersion}`);
  let newVersion: string;
  if (yearUpdate && releaseType === 'minor' && major(latestVersion) !== new Date().getFullYear()) {
    newVersion = `${new Date().getFullYear()}.0.0`;
  } else if (yearUpdate && releaseType === 'major') {
    core.setFailed(`ℹ️ Cannot update to a new major version with year update enabled.`);
    return;
  } else {
    newVersion = inc(latestVersion, releaseType);
  }

  core.setOutput('newVersion', newVersion);
  core.setOutput('currentVersion', latestVersion);
  core.info(`ℹ️ Setting new version to ${newVersion}`);
}

void run();
