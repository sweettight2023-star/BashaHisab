// বাসা হিসাব — ন্যূনতম সার্ভিস ওয়ার্কার (ইনস্টলযোগ্যতার জন্য)
const CACHE = "basha-hisab-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// নেটওয়ার্ক-ফার্স্ট: সবসময় সবচেয়ে নতুন ডেটা দেখাবে, নেট না থাকলে ক্যাশ থেকে চেষ্টা করবে
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});
