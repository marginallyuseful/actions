# soll-checkout

Minimal GitHub Actions checkout for [soll](https://soll.dev) -- fetches only the commits needed for import-graph-aware change detection.

## Canonical source

This is the canonical copy. It syncs to [marginallyuseful/actions/soll-checkout](https://github.com/marginallyuseful/actions/tree/main/soll-checkout) on pushes to main.

## Usage

```yaml
steps:
  - uses: ./.github/actions/soll-checkout
    id: checkout

  - run: soll affected --base ${{ steps.checkout.outputs.base-ref }}
```

## What it does

1. Checks out the repository with `fetch-depth: 1` (shallow clone)
2. Fetches the minimum additional history soll needs:
   - **Pull requests:** fetches the PR base commit, then deepens until the base is reachable from HEAD (so `git log`, `git diff`, `git merge-base`, etc. all work)
   - **Pushes to default branch:** fetches the parent commit (for HEAD~1)
3. Outputs `base-ref` -- the SHA to pass to `soll affected --base`

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `ref` | no | -- | Branch, tag, or SHA to check out |
| `token` | no | `github.token` | PAT for checkout |

## Outputs

| Output | Description |
|--------|-------------|
| `base-ref` | Resolved base SHA for `soll affected --base` |
