import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import appMetaJson from "../app-meta.json";

const DEFAULT_TITLE = "Provenance Intelligence System";
const DEFAULT_DESCRIPTION = "Code lineage tracking, deployment provenance, and origin certificates.";
const appMeta = appMetaJson as any;
const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value;
  try { const u = new URL(value); const isAppHost = APP_HOST_ZONES.some((z) => u.hostname === z || u.hostname.endsWith(`.${z}`)); if (isAppHost) return u.pathname + u.search; return value; } catch { return value; }
}

function buildHead(meta: any) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  return {
    meta: [
      { charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...(ogImage ? [{ property: "og:image", content: ogImage }, { name: "twitter:image", content: ogImage }] : []),
    ],
    links: [{ rel: "stylesheet", href: appCss }, ...(favicon ? [{ rel: "icon", href: favicon }] : [])],
  };
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0f] px-4">
      <div className="text-center"><h1 className="text-6xl font-bold gradient-text">404</h1><p className="mt-4 text-lg text-[#98989d]">Page not found</p><Link to="/" className="mt-6 inline-block rounded-lg bg-[#0071E3] px-6 py-2.5 font-medium text-white transition hover:bg-[#0082ff]">Go home</Link></div>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    console.error(error);
    const router = useRouter();
    useEffect(() => { reportHiggsfieldError(error, { boundary: "root_error" }); }, [error]);
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0f] px-4">
        <div className="text-center"><h1 className="text-2xl font-bold text-[#f5f5f7]">Something went wrong</h1><p className="mt-2 text-[#98989d]">Unexpected error occurred.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => { router.invalidate(); reset(); }} className="rounded-lg bg-[#0071E3] px-6 py-2.5 font-medium text-white transition hover:bg-[#0082ff]">Try again</button>
            <a href="/" className="rounded-lg border border-[rgba(255,255,255,0.1)] px-6 py-2.5 font-medium text-[#f5f5f7] transition hover:bg-[rgba(255,255,255,0.05)]">Go home</a>
          </div>
        </div>
      </div>
    );
  },
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <head><HeadContent /></head>
      <body className="bg-[#0a0a0f] text-[#f5f5f7]">{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Outlet />
    </QueryClientProvider>
  );
}