import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
       <Head>
        {/* Standard favicon */}
        <link rel="icon" href="/assets/images/plpLogo.png" />
        
        {/* PNG icons for different sizes - using same logo */}
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/plpLogo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/plpLogo.png" />
        
        {/* Apple Touch Icons - using same logo */}
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/plpLogo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/plpLogo.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/assets/images/plpLogo.png" />
        
        {/* Android/Chrome */}
        <meta name="application-name" content="Pure Life Pools" />
        
        {/* Safari */}
        <link rel="mask-icon" href="/assets/images/plpLogo.png" color="#5bbad5" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileImage" content="/assets/images/plpLogo.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#ffffff" />
        
        {/* App name */}
        <meta name="apple-mobile-web-app-title" content="Pure Life Pools" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
