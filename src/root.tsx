// @refresh reload
import { Suspense } from "solid-js";
import Common from "./components/Common";
import Tool from "./components/Tool";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  Link
} from "solid-start";
import "./root.css";
import { createLocalMusicList, getIsMobile } from '~/utils/index'
import { onMount } from "solid-js";


export default function Root() {
  onMount(() => {
    getIsMobile()
    createLocalMusicList('musicList', [])
  })
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <Meta name="theme-color" content="#f6f8fa" />
        <Link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="192x192" />
        <script src="https://cdn.gitmirror.com/gh/afarkas/lazysizes/master/lazysizes.min.js"></script>
        {/* <script type="module" src="/src/utils/pwa.ts"></script> */}
      </Head>
      <Body>


        <ErrorBoundary>
          <Suspense fallback={<div>Loading</div>}>
            <Tool></Tool>
            <Common></Common>
            <Routes>
              <FileRoutes />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Scripts />
      </Body>
    </Html>
  );
}
