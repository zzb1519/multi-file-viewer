# Publish Guide

This guide records the Git and npm release flow for `multi-file-viewer`.

## Preflight

Run checks before every release:

```bash
npm run typecheck
npm run build
npm pack --dry-run
```

Confirm the package name and version:

```bash
npm pkg get name version
```

## Version

Update the release version in:

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `CHANGELOG.zh-CN.md`

Example for `0.1.4`:

```json
{
  "version": "0.1.4"
}
```

## Git Release Flow

Commit the release changes:

```bash
git status
git add .
git commit -m "feat: prepare 0.1.4 release"
```

Create and push the tag:

```bash
git tag v0.1.4
git push origin main
git push origin v0.1.4
```

If the default branch is not `main`, replace `main` with the actual branch name.

## npm Publish Flow

Use the official npm registry for login and publish:

```bash
npm whoami --registry=https://registry.npmjs.org/
npm publish --registry=https://registry.npmjs.org/
```

If the npm account has two-factor authentication enabled:

```bash
npm publish --registry=https://registry.npmjs.org/ --otp=123456
```

After publishing, verify the version:

```bash
npm view multi-file-viewer version --registry=https://registry.npmjs.org/
```

## npm Login Timeout or Unauthorized

If `npm publish` reports `E401`, `Unauthorized`, login timeout, expired token, or `whoami` fails, log out and log in again on the official registry:

```bash
npm logout --registry=https://registry.npmjs.org/
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
```

Publish again after `whoami` prints your npm username:

```bash
npm publish --registry=https://registry.npmjs.org/
```

For accounts with 2FA:

```bash
npm publish --registry=https://registry.npmjs.org/ --otp=123456
```

## Registry Notes

It is okay to install dependencies from a mirror such as `npmmirror`, but publishing must use the official npm registry:

```bash
npm config get registry
npm publish --registry=https://registry.npmjs.org/
```

If needed, temporarily switch the registry:

```bash
npm config set registry https://registry.npmjs.org/
npm publish
```

Then switch back to your preferred install registry:

```bash
npm config set registry https://registry.npmmirror.com/
```

## Permission or Cache Errors

On Windows, `npm pack` or `npm publish` may fail with `EPERM` in the npm cache directory. Try:

```bash
npm cache verify
npm pack --dry-run --registry=https://registry.npmjs.org/
```

If it still fails, close editors or terminals that may be using npm cache files, disable antivirus locking temporarily if applicable, or run the terminal as Administrator.
