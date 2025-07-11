# z-watcher

[![z-watcher Image](.github/P-Stream.png)](https://docs.pstream.org)

**I _do not_ endorse piracy of any kind I simply enjoy programming and large user counts.**

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fp-stream%2Fp-stream)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/p-stream/p-stream)

**NOTE: To self-host, more setup is required. Check the [docs](https://docs.pstream.org) to properly set up!!!!**

## Links And Resources

| Service        | Link                                            | Source Code                                            |
| -------------- | ----------------------------------------------- | ------------------------------------------------------ |
| z-watcher Docs | [docs](https://docs.pstream.org)                | [source code](https://github.com/p-stream/docs)        |
| Extension      | [extension](https://docs.pstream.org/extension) | [source code](https://github.com/p-stream/browser-ext) |
| Proxy          | [simple-proxy](https://docs.pstream.org/proxy)  | [source code](https://github.com/p-stream/sudo-proxy)  |
| Backend        | [backend](https://server.fifthwit.net)          | [source code](https://github.com/p-stream/backend)     |
| Frontend       | [z-watcher](https://docs.pstream.org/instances) | [source code](https://github.com/p-stream/p-stream)    |
| Weblate        | [weblate](https://weblate.pstream.org)          |                                                        |

## Referrers

- [FMHY (Voted as #1 multi-server streaming site of 2024)](https://fmhy.net)
- [Piracy Subreddit Megathread](https://www.reddit.com/r/Piracy/s/iymSloEpXn)
- [Toon's Instances](https://erynith.github.io/movie-web-instances)
- [Entertainment Empire](https://discord.gg/8NSDNEMfja)
- Search Engines: DuckDuckGo, Bing, Google
- Rentry.co

## Running Locally

Type the following commands into your terminal / command line to run z-watcher locally

```bash
git clone https://github.com/p-stream/p-stream.git
cd smov
git pull
pnpm install
pnpm run dev
```

Then you can visit the local z-watcher instance at [http://localhost:5173](http://localhost:5173) or, at local host on port 5173.

## Updating a z-watcher Instance

To update a z-watcher instance you can type the below commands into a terminal at the root of your project.

```bash
git remote add upstream https://github.com/p-stream/p-stream.git
git fetch upstream # Grab the contents of the new remote source
git checkout <YOUR_MAIN_BRANCH>  # Most likely this would be `origin/production`
git merge upstream/production
# * Fix any conflicts present during merge *
git add .  # Add all changes made during merge and conflict fixing
git commit -m "Update z-watcher instance (merge upstream/production)"
git push  # Push to YOUR repository
```

## Contact Me / Discord

[Discord](https://discord.gg/7z6znYgrTG)
#   z - w a t c h e r 
 
 
