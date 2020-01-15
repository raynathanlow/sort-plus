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

    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg)$/,
      new workbox.strategies.CacheFirst({
        cacheName: "images"
      })
    );

    workbox.routing.registerRoute(
      /api\/library.+/,
      new workbox.strategies.CacheFirst({
        cacheName: "data"
      })
    );

    // Not sure if this is necessary? Might be redundant...
    // workbox.routing.registerRoute(
    //   /https:\/\/i.scdn.co\/image\/.+/,
    //   new workbox.strategies.CacheFirst({
    //     cacheName: "data"
    //   })
    // );
  } else {
    console.log("Workbox could not be loaded. No Offline support");
  }
}
