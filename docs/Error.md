Console Error

A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


  ...
    <HotReload assetPrefix="" globalError={[...]}>
      <AppDevOverlayErrorBoundary globalError={[...]}>
        <ReplaySsrOnlyErrors>
        <DevRootHTTPAccessFallbackBoundary>
          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
            <HTTPAccessFallbackErrorBoundary pathname="/dashboard" notFound={<NotAllowedRootHTTPFallbackError>} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <Head>
                  <__next_root_layout_boundary__>
                    <SegmentViewNode type="layout" pagePath="layout.tsx">
                      <SegmentTrieNode>
                      <link>
                      <RootLayout>
                        <html lang="en" suppressHydrationWarning={true}>
                          <body
                            className="antialiased"
-                           data-new-gr-c-s-check-loaded="14.1307.0"
-                           data-gr-ext-installed=""
                          >
                  ...
src\app\layout.tsx (12:7) @ RootLayout


  10 |   return (
  11 |     <html lang="en" suppressHydrationWarning>
> 12 |       <body className="antialiased">{children}</body>
     |       ^
  13 |     </html>
  14 |   );
  15 | }
Call Stack
18

Show 16 ignore-listed frame(s)
body
<anonymous>
RootLayout
src\app\layout.tsx (12:7)