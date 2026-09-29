'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const SiteContext = createContext<{ siteName: string; announcement?: string }>({
  // 默认值
  siteName: 'MoonTV',
  announcement:
    '本网站仅提供影视信息搜索服务，所有内容均来自第三方网站。本站不存储任何视频资源，不对任何内容的准确性、合法性、完整性负责。',
});

export const useSite = () => useContext(SiteContext);

interface ServerConfigResponse {
  SiteName: string;
  Announcement?: string;
  RuntimeConfig?: Record<string, unknown>;
}

declare global {
  interface Window {
    RUNTIME_CONFIG?: Record<string, unknown>;
  }
}

export function SiteProvider({
  children,
  siteName,
  announcement,
}: {
  children: ReactNode;
  siteName: string;
  announcement?: string;
}) {
  const [site, setSite] = useState({ siteName, announcement });

  useEffect(() => {
    const storageType = window.RUNTIME_CONFIG?.STORAGE_TYPE;
    if (storageType === 'localstorage') {
      return;
    }

    let canceled = false;

    void fetch('/api/server-config', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load site config: ${response.status}`);
        }
        return (await response.json()) as ServerConfigResponse;
      })
      .then((config) => {
        if (canceled) {
          return;
        }

        window.RUNTIME_CONFIG = {
          ...window.RUNTIME_CONFIG,
          ...config.RuntimeConfig,
        };
        setSite({
          siteName: config.SiteName || siteName,
          announcement: config.Announcement,
        });
        document.title = config.SiteName || siteName;
        window.dispatchEvent(new Event('runtimeConfigUpdated'));
      })
      .catch(() => undefined);

    return () => {
      canceled = true;
    };
  }, [siteName]);

  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}
