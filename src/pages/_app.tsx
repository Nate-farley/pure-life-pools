import siteMetadata from '@/config/meta.json';
import createEmotionCache from '@/createEmotionCache';
import '@/styles/globals.css';
import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const router = useRouter();

  // Set scroll to 0,0 to prevent starting at the bottom of the page
  // after navigating
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [router.pathname]);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

        <CssBaseline />
        <DefaultSeo
          titleTemplate={`Pure Life Pools | +1-321-831-3115 | %s`}
          defaultTitle={`Pure Life Pools | +1-321-831-3115`}
          description="Pure Life Pools is your premier provider of custom fiberglass pools, ponds, and hardscaping in Palm Bay, Melbourne, and Titusville, Florida. Transform your backyard into a stunning outdoor oasis with our expert design and installation services."
          canonical={siteMetadata.siteUrl}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: siteMetadata.siteUrl,
            siteName: siteMetadata.businessName,
            images: [{
              url: `${siteMetadata.siteUrl}/assets/images/plpLogo.png`,
              width: 1200,
              height: 630,
              alt: 'Pure Life Pools Logo',
            }],
          }}
          additionalMetaTags={[
            {
              name: 'keywords',
              content: 'fiberglass pools, swimming pools, pool installation, Melbourne, Palm Bay, Florida, Brevard Country'
            },
            {
              name: 'viewport',
              content: 'width=device-width, initial-scale=1'
            }
          ]}
        />
        <Component {...pageProps} />

    </CacheProvider>
  );
}
