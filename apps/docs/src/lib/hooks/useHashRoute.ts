import { useEffect, useState } from 'react';

const read = () => window.location.hash.replace(/^#\/?/, '') || '';

/** 基于 hash 的极简路由，返回当前路径，例如 "components/fade-in" */
export function useHashRoute() {
  const [path, setPath] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setPath(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export const navigate = (path: string) => {
  window.location.hash = `/${path}`;
};
