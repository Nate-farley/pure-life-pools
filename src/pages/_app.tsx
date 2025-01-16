import siteMetadata from '@/config/meta.json';
import '@/styles/globals.css';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        titleTemplate={`%s | ${siteMetadata.businessName}`}
        defaultTitle={`${siteMetadata.businessName} - Premium Pool Installation in ${siteMetadata.location}`}
        description="Expert fiberglass pool installation in Palm Bay, Florida and Brevard County. Custom swimming pools with professional installation."
        canonical={siteMetadata.siteUrl}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: siteMetadata.siteUrl,
          siteName: siteMetadata.businessName,
          images: [{
            url: '/assets/images/plpLogo.png', 
            width: 1200,
            height: 630,
            alt: 'pure life pools logo',
          }],
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'fiberglass pools, swimming pools, pool installation, Melbourne Palm Bay, Florida, Brevard Country'
          }
        ]}
      />
      <Component {...pageProps} />
    </>
  );
}