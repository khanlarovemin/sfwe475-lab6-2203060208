# Next.js migration notes

Observed on Next.js 16.4.5 with `npm run dev`, `npm start` and curl. Browser checks (document requests, DOM, keyboard) were scripted with Playwright driving headless Chrome.

## Where this version differs from the worksheet

`create-next-app` now turns on `cacheComponents` and `partialPrefetching`. The defaults were kept, which changed four things:

- Uncached data outside `<Suspense>` is a dev error. `app/tasks/loading.tsx` clears it for `/tasks`, and `/tasks/[id]` needed its own `loading.tsx` too.
- `error.tsx` uses `retry`, not `reset`. See Strand 2, Challenge 12.
- `export const dynamic = "force-dynamic"` fails the build. See Strand 3, Stretch 6.
- The route table shows `◐` for `/tasks`, not `○`. See Strand 3, Core 1.

Two other changes from the worksheet code:

- `TaskCheckbox.tsx` was copied as well, because `TaskCard` imports it.
- The empty state keeps the form on screen. The worksheet's early return would hide the form that "Add your first one below" points to.

## Strand 1 — Routing and layouts

**Core 2.** Expected from the file-to-URL rule: `app/tasks/page.tsx` answers `/tasks`, and `/task` matches no folder, so it is a 404. Result: `/tasks` returned 200 and `/task` returned 404.

**Core 4.** The log was in the terminal running `npm run dev`: `id is a string and its value is 1`. `/tasks/abc` also logged a string and rendered, because at that stage nothing validated it. It appears there because the page runs on the server. In dev, Next.js also replays a copy into the browser console with a badge, but the code did not run there.

**Core 6.** The nav stayed on `/`, `/tasks` and `/tasks/1`, and the html tag has `lang="en"`. That attribute tells a screen reader which language's pronunciation rules to use.

**Core 7.** Document requests after clicking the nav:

| Link type | Document requests | Meaning |
| --- | --- | --- |
| `Link` | `["/"]` | No new document; client-side navigation |
| Plain `<a>` | `["/", "/tasks"]` | Full page load |

**Core 8.** URL rules for each route:

| Route | HTTPS | Short and readable | Lowercase | Hyphens, not underscores | Few query params |
| --- | --- | --- | --- | --- | --- |
| `/` | at deployment | yes | yes | n/a | none |
| `/tasks` | at deployment | yes | yes | n/a | none |
| `/tasks/[id]` | at deployment | yes | yes | n/a | none |

**Stretch 9.** `/nope` returned a real 404, so it is not a soft 404. However, `/tasks/abc` and `/tasks/999` show the same friendly page with **HTTP 200**, in production too. `loading.tsx` starts the stream before `notFound()` runs, and the status is fixed once streaming starts. Next.js adds `<meta name="robots" content="noindex">`, which keeps these pages out of search results, but strictly this is still a soft 404. Moving `loading.tsx` into a route group so it only wraps the list should avoid it. That was not tried, because it changes the file paths the worksheet uses.

**Challenge 10.** Two layouts wrap `/tasks/1`: the root layout and `app/tasks/layout.tsx`. Both stay in place going from `/tasks` to `/tasks/1`; the same DOM nodes for the nav and the section survived the navigation. Only the page inside them changes.

## Strand 2 — Server vs Client Components

**Core 2.** Expected: an error, because `TaskBoard` uses hooks and nothing marks it as client code. Result: `/tasks` returned 500 with:

```
./app/tasks/TaskBoard.tsx:1:10
Error: You're importing a module that depends on `useEffect` into a React Server Component module. This API is only available in Client Components. To fix, mark the file (or its parent) with the `"use client"` directive.
```

It means that everything is a Server Component by default, and hooks only exist in the browser. Adding `"use client"` to `TaskBoard` alone fixed it, including the same error reported for `NewTaskForm`.

**Core 6.** The log was in the terminal, and `typeof window` was `undefined`. There is no `window` because a Server Component runs in Node, not in a browser. So it can fetch data directly, but it cannot use browser APIs or state. In dev the browser console shows a replayed copy with a `Server` badge.

**Core 7.**

| App | View source | Title occurrences |
| --- | --- | --- |
| `/tasks` (Next.js) | Full HTML including the task titles | 3 |
| Lab 4 Vite app | Only `<div id="root"></div>` and a script tag | 0 |

Next.js renders on the server and sends the result, while Vite sends an empty shell and builds the page in the browser. On `/tasks` the titles come after the `Loading tasks...` fallback, inside a hidden streamed block that a script swaps in.

**Core 8.**

| File | Server or Client? | Reason |
| --- | --- | --- |
| `app/layout.tsx` | Server | Only renders static structure, and no directive makes it client code |
| `app/tasks/page.tsx` | Server | Awaits data on the server and passes it down as a prop |
| `TaskBoard.tsx` | Client | Holds `useState` and the add and toggle handlers |
| `TaskList.tsx` and `TaskCard.tsx` | Client | Imported by `TaskBoard`, so they are in the client bundle |
| `FilterBar.tsx` and `NewTaskForm.tsx` | Client | Same, and they use event handlers and state |

Only `TaskBoard.tsx` needed `"use client"` written in it, plus `error.tsx` when it was added. The others are client code only because a parent imports them.

**Stretch 11.** With `delayMs: 1500`, `Loading tasks...` appeared after about 90 ms and the first card after about 1.9 s. In Lab 4 the same message came from `status` state and needed client JavaScript and `useEffect`. Here the server sends it from `loading.tsx` first and streams the content in afterwards, with no client state.

**Challenge 12.** An error file must be a Client Component because it is a React error boundary with a click handler for the button, and those only work in the browser. Measured with a mock that fails and then recovers:

| Prop | After clicking Try again |
| --- | --- |
| `reset` (worksheet code) | Stayed on the error screen, 0 tasks |
| `retry` (docs for this version) | Recovered, 2 tasks |

The docs explain why: `reset` re-renders without re-fetching.

## Strand 3 — SSR / CSR decisions

**Core 1.** Route table from `npm run build`:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ◐ /tasks
└   /tasks/[id]
  └ ◐ /tasks/[id]

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

`/tasks` is not static here: the shell is prerendered, and repeated requests in production kept running `TasksPage`. With `cacheComponents` temporarily off it was `○` static, and that would be a problem if tasks changed every minute. The list would be frozen at build time, and every visitor would see stale tasks until the next build.

**Core 2.**

| Page | Render | Must search engines see it? | Private and highly interactive? |
| --- | --- | --- | --- |
| (a) Public page for one shared task | Server | Yes | No |
| (b) Drag-and-drop planning board | Browser | No | Yes |
| (c) About page | Ahead of time | Yes | No, and it rarely changes |

**Core 3.** All three were found in the `<head>` of `/tasks`:

```html
<title>All tasks | Task Board</title>
<meta name="description" content="Every task on your board, in one place."/>
<link rel="canonical" href="https://taskboard.example/tasks"/>
```

**Core 4.** Both attributes are in the footer HTML.

- `rel="sponsored"` tells a search engine the link is paid or sponsored placement.
- `rel="ugc"` tells it the link was written by a user, not vouched for by the site.

**Core 5.** `npm run lint` and `npm run build` both finish with no errors.

**Stretch 6.** With this project's config, the build fails:

```
Error: Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`. Please remove it.
```

The docs say to remove it, because uncached data already runs at request time. So the line is not in the code. To see the intended comparison, two temporary builds were run with `cacheComponents` off:

| Config | `/tasks` in the route table |
| --- | --- |
| `cacheComponents` on (this project) | `◐` Partial Prerender |
| `cacheComponents` off | `○` Static |
| `cacheComponents` off, `force-dynamic` | `ƒ` Dynamic |

**Stretch 7.** `generateMetadata` gives `/tasks/1` the title `Read Chapter 4 | Task Board`, and a missing task gets `Task not found | Task Board`. On this route the title was not in `<head>` when requested with a Googlebot user agent; it arrives later in the streamed HTML.

**Challenge 8.** Run on `npm start`, Lighthouse default settings, then the experiment was deleted.

| | `/tasks` | `/tasks-csr` |
| --- | --- | --- |
| Titles in view source | 3 | 0 |
| `<title>` | All tasks \| Task Board | Task Board |
| Performance | 100 | 100 |
| Accessibility | 96 (`target-size`) | 98 (`landmark-one-main`) |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP / LCP | 0.8 s / 0.8 s | 0.8 s / 0.8 s |

For a public page I would choose `/tasks`. Lighthouse did not separate them on localhost, with a tiny mock API and no network delay, so its scores are not the deciding evidence here. The difference is in the source: the server page sends its titles in the HTML, while the CSR page sends only `Loading tasks...` and depends on JavaScript running first. A Client Component also cannot export `metadata`, so the CSR page fell back to the generic title. Lighthouse's SEO score does not capture either difference, so a 100 on both does not mean they are equal for search.

The `target-size` issue on `/tasks` was left unfixed, because this lab did not ask for it.

## Known limits

- Tasks added in the form exist only in browser state. A full reload loses them, and their title link goes to "Page not found" because the mock API does not know them. There is no real backend yet.
- `CreateTaskSchema` uses `min(1)`, which accepts a title of only spaces. The disabled button blocks this in normal use, but removing `disabled` in DevTools did create a blank task. The worksheet says the schemas stay unchanged, so it was left; `.trim()` before `.min(1)` would fix it.
