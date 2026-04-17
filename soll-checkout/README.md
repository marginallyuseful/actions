# soll-checkout

Minimal GitHub Actions checkout for [soll](https://soll.dev) — fetches only the commits needed for import-graph-aware change detection.

## Usage

```yaml
steps:
  - uses: marginallyuseful/actions/soll-checkout@v1
    id: checkout

  - run: soll affected --base ${{ steps.checkout.outputs.base-ref }}
```

## What it does

1. Checks out the repository with `fetch-depth: 1` (shallow clone)
2. Fetches the minimum additional history soll needs:
   - **Pull requests:** fetches the PR base commit
   - **Pushes to default branch:** fetches the parent commit (for HEAD~1)
3. Outputs `base-ref` — the SHA to pass to `soll affected --base`

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `ref` | no | — | Branch, tag, or SHA to check out |
| `token` | no | `github.token` | PAT for checkout |

## Outputs

| Output | Description |
|--------|-------------|
| `base-ref` | Resolved base SHA for `soll affected --base` |
