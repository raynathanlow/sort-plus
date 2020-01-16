if ("function" === typeof importScripts) {
  importScripts(
    "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
  );
  /* global workbox */
  if (workbox) {
    console.log("Workbox is loaded");

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([]);

    /* custom cache rules*/
    workbox.routing.registerNavigationRoute(
      workbox.precaching.getCacheKeyForURL("/index.html")
    );

    // /api/library/album
    workbox.routing.registerRoute(
      /api\/library\/\album\b\?\balbumId=\b.+/,
      new workbox.strategies.CacheFirst({
        cacheName: "albums"
      })
    );

    // /api/library
    workbox.routing.registerRoute(
      /api\/library\?sortMode\b.+/,
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: "album-lists"
      })
    );

    // /api/library/options
    workbox.routing.registerRoute(
      /api\/library\/\options\b/,
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: "options"
      })
    );

    // Not sure if this is necessary? Might be redundant...
    workbox.routing.registerRoute(
      /https:\/\/i.scdn.co\/image\/.+/,
      new workbox.strategies.CacheFirst({
        cacheName: "albums"
      })
    );
  } else {
    console.log("Workbox could not be loaded. No Offline support");
  }
}
