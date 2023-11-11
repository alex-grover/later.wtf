# later.wtf

Schedule Farcaster posts

## Getting started

With Node.js, pnpm, and postgres installed:

```sh
gh repo clone alex-grover/later.wtf
pnpm install
pnpm vercel env pull .env
createdb laterwtf
pnpm migrate
pnpm generate
pnpm dev
```
