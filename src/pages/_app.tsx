import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

export default function App({ Component, pageProps }: AppProps) {
return ( 
<Component {...pageProps} />
)
}
