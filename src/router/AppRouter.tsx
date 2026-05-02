import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type RouteParams = Record<string, string>;

type RouteMatch = { path: string; params: RouteParams };

interface RouterContextValue {
  pathname: string;
  params: RouteParams;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function normalize(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

function matchPath(pattern: string, pathname: string): RouteMatch | null {
  const patternParts = normalize(pattern).split('/');
  const pathParts = normalize(pathname).split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params: RouteParams = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i];
    const current = pathParts[i];
    if (part.startsWith(':')) {
      params[part.slice(1)] = decodeURIComponent(current);
      continue;
    }
    if (part !== current) return null;
  }
  return { path: pattern, params };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const value = useMemo(
    () => ({
      pathname,
      params: {},
      navigate: (to: string) => {
        window.history.pushState({}, '', to);
        setPathname(to);
      },
    }),
    [pathname],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('Router context missing');
  return ctx;
}

export function Route({ path, children }: { path: string; children: (params: RouteParams) => React.ReactNode }) {
  const { pathname } = useRouter();
  const match = matchPath(path, pathname);
  if (!match) return null;
  return <>{children(match.params)}</>;
}

export function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  const { navigate } = useRouter();
  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
