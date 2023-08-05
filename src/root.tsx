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

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link rel="manifest" href="/manifest.webmanifest" />
        <script src="https://cdn.gitmirror.com/gh/afarkas/lazysizes/master/lazysizes.min.js"></script>
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
