import siteMetadata from '@/config/meta.json';
import '@/styles/globals.css';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {

  const router = useRouter();

  // Set scroll to 0,0 to prevent starting at the bottom of the page
  // after navigating
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [router.pathname]);
  
  return (
    <>
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
    </>
  );
}