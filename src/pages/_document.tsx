import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* PNG icons for different sizes - using same logo */}
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

        {/* Apple Touch Icons - using same logo */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
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

        {/* Android/Chrome */}
        <meta name="application-name" content="Pure Life Pools" />

        {/* Safari */}
        <link
          rel="mask-icon"
          href="/assets/images/plpLogo.png"
          color="#5bbad5"
        />

        {/* Microsoft */}
        <meta
          name="msapplication-TileImage"
          content="/assets/images/plpLogo.png"
        />
        <meta name="msapplication-TileColor" content="#ffffff" />

        {/* Theme Colors */}
        <meta name="theme-color" content="#ffffff" />

        {/* App name */}
        <meta name="apple-mobile-web-app-title" content="Pure Life Pools" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Color */}
        <meta name="theme-color" content="#133240" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Pure Life Pools",
            "image": "https://www.purelifepools.com/assets/images/plpLogo.png,
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
            "description": "Premier fiberglass pool installation in Palm Bay and Melbourne Florida and Brevard County. Custom pool designs, professional installation, and financing options available.",
            "priceRange": "$$",
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
