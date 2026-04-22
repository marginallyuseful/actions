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

1. When `soll` is enabled (default), calls the GitHub compare API *before* checkout to determine the exact fetch depth needed
2. Checks out the repository via `actions/checkout@v6` with the computed depth, forwarding all other inputs
3. Fetches the minimum additional history soll needs:
   - **Pull requests:** fetches the PR base commit (the checkout already has enough HEAD history)
   - **Pushes to default branch:** checkout depth 2 already includes the parent — no extra fetch needed
4. Outputs `base-ref` -- the SHA to pass to `soll affected --base`

This avoids a separate `git fetch --deepen` round-trip after checkout.

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
