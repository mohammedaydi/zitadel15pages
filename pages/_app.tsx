import SessionContextWrapper from "@/context/session-context-wrapper";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <SessionContextWrapper><Component {...pageProps} /></SessionContextWrapper> 
}
