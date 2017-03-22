import Route from 'route-parser';


export function on(eventName, handler, options) {
  return addEventListener(eventName, handler, options);
}

export function cacheAll(cacheName, urls) {
  return caches.open(cacheName).then(cache => cache.addAll(urls));
}

export function put(cacheName, req, res) {
  return caches.open(cacheName).then(cache => cache.put(req, res));
}

export function matchCache(cacheName, req) {
  return caches.open(cacheName)
    .then(cache => cache.match(req));
}

export function matchCaches(cacheNames, request) {
  const tryMatch = index => {
    return matchCache(cacheNames[index], request)
    .then(res => {
      if(res) return res;
      if(index + 1 >= cacheNames.length) return Promise.resolve(null);
      return tryMatch(index + 1);
    });
  };

  return tryMatch(0);
}

export function networkFirst(cacheName) {
  return (request, params) => {
    return fetchAndStore(request, cacheName)
      .catch(() => matchCache(cacheName, request));
  };
}

export function cacheFirst(cacheName) {
  return (request, params) => {
    return matchCache(cacheName, request)
    .then(res => {
      if(res) {
        fetchAndStore(request, cacheName);
        return res;
      } else {
        return fetchAndStore(request, cacheName);
      }
    });
  };
}

export function ensureCached(cacheName) {
  return (request, params) => {
    return matchCache(cacheName, request)
    .then(res => {
      if(res) {
        return res;
      } else {
        return fetchAndStore(request, cacheName);
      }
    });
  };
}

function fetchAndStore(request, cacheName) {
  request = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    mode: 'same-origin'
  });

  return fetch(request, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
    .then(res => {
      if(res.ok) {
        return put(cacheName, request, res.clone())
          .then(() => res);
      }
    });
}

function getHeaders(headers) {
  let r = '';
  for(const entry of headers.entries()) {
    r += entry.toString() + '\n';
  }
  return r;
}

class Router {
  constructor() {
    this.routes = [];

    this.dispatch = this.dispatch.bind(this);
  }

  get(path, handler) {
    const route = new Route(path);
    this.routes.push({route, handler});
  }

  dispatch(e) {
    const {request} = e;
    const url = new URL(request.url);

    if(url.origin === location.origin) {
      for(let i = 0; i < this.routes.length; i++) {
        const {route, handler} = this.routes[i];
        const params = route.match(url.pathname);
        if(!params) continue;

        const res = handler(request, params);
        if(res instanceof Response) {
          e.respondWith(Promise.resolve(res));
          return;
        } else if(res instanceof Promise) {
          e.respondWith(res);
          return;
        } else {
          console.error('Error handling ' + request.url);
          throw new Error('Invalid handler response. Must be instance of Response or Promise.');
        }
      }
    }
  }
}

export function createRouter() {
  return new Router();
}
