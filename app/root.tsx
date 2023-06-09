import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStylesheet from "~/tailwind.css";
import { getUser } from "./session.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheet },
    {
      rel: "apple-touch-icon",
      sizes: "152x152",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    { rel: "manifest", href: "/site.webmanifest" },
    { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#262626" },
  ];
};

export const meta: V2_MetaFunction = () => [
  {
    charset: "utf-8",
  },
  { title: "Utilities Calculator" },
  { viewport: "width=device-width,initial-scale=1" },
  { "msapplication-tilecolor": "#262626" },
  { "theme-color": "#262626" },
];

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  return (
    <html lang="en" className="min-h-full dark:bg-neutral-800">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="mx-auto mb-8 min-h-full max-w-6xl px-4 dark:text-white">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
