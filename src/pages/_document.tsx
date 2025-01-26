import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        {/* PNG Icons for modern browsers */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/assets/images/plpLogo.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/assets/images/plpLogo.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/assets/images/plpLogo.png"
        />

        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/assets/images/plpLogo.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/assets/images/plpLogo.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/assets/images/plpLogo.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/assets/images/plpLogo.png"
        />

        {/* Safari Pinned Tab */}
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#133240"
        />

        <link
          rel="icon"
          type="image/png"
          href="/assets/images/favicon-96x96.png"
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/assets/images/favicon.svg"
        />
        <link rel="shortcut icon" href="/assets/images/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/images/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#133240" />
        <meta
          name="msapplication-TileImage"
          content="/assets/images/plpLogo.png"
        />
        <meta
          name="msapplication-square70x70logo"
          content="/assets/images/plpLogo.png"
        />
        <meta
          name="msapplication-square150x150logo"
          content="/assets/images/plpLogo.png"
        />
        <meta
          name="msapplication-wide310x150logo"
          content="/assets/images/plpLogo.png"
        />
        <meta
          name="msapplication-square310x310logo"
          content="/assets/images/plpLogo.png"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Colors */}
        <meta name="theme-color" content="#133240" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Structured Data */}
        <script type="application/ld+json">
          {`{
        "@context": "https://schema.org",
        "@type": "Organization",
            "name": "Pure Life Pools | +1-321-831-3115",
      "url": "https://www.purelifepools.com",
      "logo": "https://www.purelifepools.com/assets/images/web-app-manifest-512x512.png",
           "image": "https://www.purelifepools.com/assets/images/web-app-manifest-512x512.png",
            "telephone": "+1-321-831-3115",
            "email": "info@purelifepools.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "105 Ring Avenue NE",
              "addressLocality": "Palm Bay",
              "addressRegion": "FL",
              "postalCode": "32907",
              "addressCountry": "US"
            },
             "description": "Premier fiberglass pool installation in Palm Bay, Melbourne and Titusville Florida. Custom pool designs, professional installation, and financing options available for Brevard County.",
    }`}
        </script>

        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Pure Life Pools | +1-321-831-3115",
            "image": "https://www.purelifepools.com/assets/images/web-app-manifest-512x512.png",
            "telephone": "+1-321-831-3115",
            "email": "info@purelifepools.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "105 Ring Avenue NE",
              "addressLocality": "Palm Bay",
              "addressRegion": "FL",
              "postalCode": "32907",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "28.0345",
              "longitude": "-80.5887"
            },
            "areaServed": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "28.0345",
                "longitude": "-80.5887"
              },
              "geoRadius": "50000"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
              ],
              "opens": "10:00",
              "closes": "17:00"
            },
            "description": "Premier fiberglass pool installation in Palm Bay, Melbourne and Titusville Florida. Custom pool designs, professional installation, and financing options available for Brevard County.",
            "sameAs": [
              "https://www.facebook.com/people/Pure-Life-Pools/61568311550769/"
            ]
          }`}
        </script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
