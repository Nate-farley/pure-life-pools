import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
 return (
   <Html lang="en">
     <Head>
       {/* Primary Meta Tags */}
       <meta charSet="utf-8" />
       
       {/* Favicon - Basic */}
       <link rel="icon" href="/assets/images/logo16x16.png" />
       
       {/* Multiple PNG Sizes for Modern Browsers */}
       <link
         rel="icon"
         type="image/png" 
         sizes="16x16"
         href="/assets/images/logo16x16.png"
       />
       <link
         rel="icon"
         type="image/png"
         sizes="32x32" 
         href="/assets/images/logo32x32.png"
       />
       <link
         rel="icon"
         type="image/png"
         sizes="96x96"
         href="/assets/images/logo96x96.png"
       />
       
       {/* For iOS/Apple */}
       <link
         rel="apple-touch-icon"
         href="/assets/images/logo96x96.png"
       />
       
       {/* PWA Support */}
       <link rel="manifest" href="/manifest.json" />
       <meta name="theme-color" content="#133240" />

       {/* Structured Data - Organization */}
       <script type="application/ld+json">
         {`{
           "@context": "https://schema.org",
           "@type": "Organization",
           "name": "Pure Life Pools | +1-321-831-3115",
           "url": "https://www.purelifepools.com",
           "logo": "https://purelifepools.com/assets/images/logo96x96.png",
           "image": "https://purelifepools.com/assets/images/logo96x96.png",
           "telephone": "+1-321-831-3115",
           "email": "info@purelifepools.com",
           "priceRange": "$$$",
           "address": {
             "@type": "PostalAddress",
             "streetAddress": "105 Ring Avenue NE",
             "addressLocality": "Palm Bay",
             "addressRegion": "FL",
             "postalCode": "32907",
             "addressCountry": "US"
           },
           "description": "Premium fiberglass pool installation in Palm Bay, Melbourne and Titusville Florida. Premium pool designs, professional installation, and financing options available for Brevard County."
         }`}
       </script>

       {/* Structured Data - LocalBusiness */}
       <script type="application/ld+json">
         {`{
           "@context": "https://schema.org",
           "@type": "LocalBusiness",
           "name": "Pure Life Pools | +1-321-831-3115",
           "image": "https://purelifepools.com/assets/images/logo96x96.png",
           "telephone": "+1-321-831-3115",
           "email": "info@purelifepools.com",
           "priceRange": "$$$",
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
           "areaServed": [
             {
               "@type": "City",
               "name": "Palm Bay",
               "sameAs": "https://en.wikipedia.org/wiki/Palm_Bay,_Florida"
             },
             {
               "@type": "City",
               "name": "Melbourne",
               "sameAs": "https://en.wikipedia.org/wiki/Melbourne,_Florida"
             },
             {
               "@type": "City",
               "name": "Titusville",
               "sameAs": "https://en.wikipedia.org/wiki/Titusville,_Florida"
             }
           ],
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
           "serviceType": [
             "Fiberglass Pool Installation",
             "Pool Construction",
             "Hardscaping",
             "Pond Installation"
           ],
           "description": "Premium fiberglass pool installation in Palm Bay, Melbourne and Titusville Florida. Premium pool designs, professional installation, and financing options available for Brevard County.",
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