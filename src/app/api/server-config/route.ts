/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getConfig } from '@/lib/config';
import { CURRENT_VERSION } from '@/lib/version';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  console.log('server-config called: ', request.url);

  const config = await getConfig();
  const result = {
    SiteName: config.SiteConfig.SiteName,
    Announcement: config.SiteConfig.Announcement,
    StorageType: process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage',
    Version: CURRENT_VERSION,
    RuntimeConfig: {
      STORAGE_TYPE: process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage',
      DOUBAN_PROXY_TYPE: config.SiteConfig.DoubanProxyType,
      DOUBAN_PROXY: config.SiteConfig.DoubanProxy,
      DOUBAN_IMAGE_PROXY_TYPE: config.SiteConfig.DoubanImageProxyType,
      DOUBAN_IMAGE_PROXY: config.SiteConfig.DoubanImageProxy,
      DISABLE_YELLOW_FILTER: config.SiteConfig.DisableYellowFilter,
      CUSTOM_CATEGORIES: config.CustomCategories.filter(
        (category) => !category.disabled
      ).map((category) => ({
        name: category.name || '',
        type: category.type,
        query: category.query,
      })),
      FLUID_SEARCH: config.SiteConfig.FluidSearch,
      ENABLE_WEB_LIVE: config.SiteConfig.EnableWebLive ?? false,
    },
  };
  return NextResponse.json(result);
}
