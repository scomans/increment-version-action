# Increment version based on latest release action

This action gets the apps affected by the changes since the last successful build and sets them as outputs.

## Inputs

### `repo`

**Required** The report to check for releases. Example: `scomans/increment-version-action`

### `tagPrefix`

The prefix that might be in front of the version. Example: `v`

### `releaseType`

**Required** The release type. Possible values: `MAJOR`, `MINOR`, `PATCH`

### `github_token`

**Required if repo is private** Your GitHub access token (see Usage below).

## Outputs

### `newVersion`

The version after the increment

## Example usage

```yaml
on:
  workflow_dispatch:
    inputs:
      type:
        description: 'Release type'
        required: true
        default: 'MINOR'
        type: choice
        options:
          - MAJOR
          - MINOR
          - PATCH

jobs:
  increment-version:
    runs-on: ubuntu-latest
    name: Get affected apps
    outputs:
      newVersion: ${{ steps.version_increment.outputs.newVersion }}
    steps:
      - uses: actions/checkout@v1
        with:
          fetch-depth: 0

      - uses: scomans/increment-version-action@v1
        id: version_increment
        with:
          branch: ${{ github.event.inputs.type }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
  app-a:
    runs-on: ubuntu-latest
    name: build app a
    needs: increment-version
    steps:
      - name: Update version in source
        run: <DO THE UPDATE HERE> ${{ needs.increment-version.output.newVersion }}
```
