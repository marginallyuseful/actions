# soll-checkout

Composite GitHub Action that wraps [actions/checkout@v6](https://github.com/actions/checkout) with optional shallow-fetch deepening for [soll](https://soll.dev).

## Canonical source

This is the canonical copy. It syncs to [marginallyuseful/actions/soll-checkout](https://github.com/marginallyuseful/actions/tree/main/soll-checkout) on pushes to main.

## Usage

With soll deepening (default):

```yaml
steps:
  - uses: ./.github/actions/soll-checkout
    id: checkout

  - run: soll affected --base ${{ steps.checkout.outputs.base-ref }}
```

Plain checkout (soll disabled):

```yaml
steps:
  - uses: ./.github/actions/soll-checkout
    with:
      soll: "false"
      fetch-depth: 0
```

Soll deepening only (bring your own checkout):

```yaml
steps:
  - uses: actions/checkout@v6
    with:
      fetch-depth: 1

  - uses: ./.github/actions/soll-checkout
    id: checkout
    with:
      checkout: "false"
```

## What it does

1. Checks out the repository via `actions/checkout@v6`, forwarding all inputs
2. When `soll` is enabled (default), fetches the minimum additional history soll needs:
   - **Pull requests:** fetches the PR base commit, then deepens until the base is reachable from HEAD
   - **Pushes to default branch:** fetches the parent commit (for HEAD~1)
3. Outputs `base-ref` -- the SHA to pass to `soll affected --base`

All [actions/checkout inputs](https://github.com/actions/checkout#usage) are accepted as pass-through.

## Inputs

| Input | Required | Default | Description |
| ----- | -------- | ------- | ----------- |
| `checkout` | no | `"true"` | Run actions/checkout. Set to `"false"` to skip (bring your own checkout). |
| `soll` | no | `"true"` | Enable soll deepening. Set to `"false"` for a plain checkout. |
| `repository` | no | `github.repository` | Repository name with owner |
| `ref` | no | -- | Branch, tag, or SHA to check out |
| `token` | no | `github.token` | PAT for checkout and API calls |
| `fetch-depth` | no | `1` | Number of commits to fetch (0 = all) |
| `path` | no | -- | Relative path under $GITHUB_WORKSPACE |
| `sparse-checkout` | no | -- | Sparse checkout patterns |
| ... | | | All other `actions/checkout@v6` inputs are accepted |

## Outputs

| Output | Description |
| ------ | ----------- |
| `base-ref` | Resolved base SHA for `soll affected --base` (empty when soll is disabled) |
