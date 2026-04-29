# Release Process

This package publishes automatically to npm from GitHub Actions when a version tag is pushed.

## One-time setup

1. Create the GitHub repository and push this project.
2. Confirm `package.json` has the final repository URL.
3. Publish the first version manually or configure npm trusted publishing before the first CI publish.

Recommended npm setup:

1. Open the package on npmjs.com.
2. Go to package settings.
3. Configure Trusted Publisher:
   - Provider: GitHub Actions
   - Owner: `mikiguillamon`
   - Repository: `n8n-nodes-mobilia`
   - Workflow filename: `publish.yml`

Trusted publishing uses GitHub OIDC, so no long-lived `NPM_TOKEN` secret is needed.

## Publishing a new version

From the local repository:

```bash
npm ci
npm run lint
npm run build
npm version patch
git push
git push --tags
```

Use `npm version minor` or `npm version major` when appropriate.

The pushed `v*` tag triggers `.github/workflows/publish.yml`, validates that the tag matches `package.json`, builds the package, and runs `npm publish`.

## First publish fallback

If trusted publishing is not configured yet, publish manually once:

```bash
npm login
npm run lint
npm run build
npm publish --access public
```

Then configure trusted publishing on npm for future releases.
