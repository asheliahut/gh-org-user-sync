# gh-org-user-sync

![Banner](./banner/gh-org-user-sync.png)

![GitHub release (latest by date)](https://img.shields.io/github/v/release/asheliahut/gh-org-user-sync?style=for-the-badge&logo=github)
![npm](https://img.shields.io/npm/dt/gh-org-user-sync?style=for-the-badge&logo=npm)

Syncs the members of a GitHub organization to a new GitHub organization. This application supports both `github.com` along with `GitHub Enterprise Servers`.

## Mandatory Environment Variable

    - GH_USER_SYNC_TOKEN - GitHub API token with org admin in both orgs & user access privileges.

## Usage

```shell
npm install -g gh-org-user-sync
```

After installing it, run `gh-org-user-sync --help` without arguments to see list of options:

```console
GitHub Oranization Member Sync

Syncs the members of a GitHub organization to a new GitHub organization
Make sure to include environment variables for the GitHub API
Token(GH_USER_SYNC_TOKEN) with org admin & user access privileges.

Options

-h, --help
-s, --source <org_name>   Source GitHub organization name (pulls users from this org)
-t, --target <org_name>   Target GitHub organization name (pushes users to this org)
-u, --url string          GitHub API url (defaults to https://api.github.com)
-v, --verbose number      Verbosity level (0-2)

Project home: https://github.com/asheliahut/gh-org-user-sync
```

## Exaplining Verbose

The `verbose` option is a number to determine the verbosity level. All levels add additional details. Further details:

    - 0: displays only the progress bar and data is visable only as syncing occurs
    - 1: displays lengths of data pulled from getting users & permenant list of synced users
    - 2: displays full response objects
