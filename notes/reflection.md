# Reflection — Next.js migration

## 4. Why is app/tasks/page.tsx a Server Component but TaskBoard a Client Component? (Strand 2)

`app/tasks/page.tsx` only fetches data and passes it down, so it can stay on the server, where `typeof window` is `undefined`. `TaskBoard` holds `useState` and responds to clicks and form submits, and those only work in the browser, so it needs `"use client"`. Keeping the boundary at `TaskBoard` means data loading stays on the server and only the interactive part ships as client JavaScript.

## 5. What did view source show on /tasks in this lab compared with your Lab 4 Vite app, and why? (Strands 2 and 3)

View source on `/tasks` contains the task titles, while the Vite app's source has only an empty `<div id="root"></div>` and a script tag. Next.js runs the page on the server and sends the rendered result, while Vite sends a shell and builds everything in the browser after the JavaScript loads. On this version the titles come in a streamed block after the `Loading tasks...` fallback, but they are still in the HTML response.

## 6. A teammate creates a page at /Tasks/Project_Plan. Which two URL rules does it break, and what would you rename it to? (Strand 1)

It breaks the lowercase rule (`Tasks`, `Project`, `Plan`) and the hyphens-not-underscores rule (`Project_Plan`). I would rename it to `/tasks/project-plan`, which means creating the folder as `app/tasks/project-plan/page.tsx`.
