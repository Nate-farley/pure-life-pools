import siteMetadata from '@/config/meta.json';
import '@/styles/globals.css';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        titleTemplate={`%s | ${siteMetadata.businessName} | +1-321-831-3115`}
        defaultTitle={`${siteMetadata.businessName} | +1-321-831-3115`}
        description="Expert fiberglass pool installation in Palm Bay, Melbourne and Titusville Florida. Custom swimming pools with professional installation in Brevard County."
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