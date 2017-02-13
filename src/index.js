import Route from 'route-parser';
import parseRange from 'range-parser';


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
  .then(cache => cache.match(req))
  .then(res => {
    if(res) return rangeResponse(req, res);
    return res;
  });
}

function rangeResponse(req, res) {
  return res.clone().blob()
  .then(body => {
    const range = parseRange(body.size, req.headers.get('range') || '');

    if(Array.isArray(range)) {
      const {start, end} = range[0];
      const partialBody = body.slice(start, end + 1);

      return new Response(partialBody, {
        status: 206,
        headers: {
          'content-type': res.headers.get('content-type'),
          'content-length': partialBody.size,
          'content-range': `bytes ${start}-${end}/${body.size}`
        }
      });
    }

    return res;
  });
}

export function matchCaches(cacheNames, req) {
  const tryMatch = index => {
    return matchCache(cacheNames[index], req)
    .then(res => {
      if(res) return res;
      if(index + 1 >= cacheNames.length) return Promise.resolve(null);
      return tryMatch(index + 1);
    });
  };

  return tryMatch(0);
}

export function networkFirst(cacheName) {
  return (req, params) => {
    return fetch(req)
    .then(res => {
      return put(cacheName, req, res.clone())
      .then(() => res);
    })
    .catch(() => matchCache(cacheName, req));
  };
}

export function cacheFirst(cacheName) {
  return (req, params) => {
    return matchCache(cacheName, req)
    .then(res => {
      if(res) {
        fetchAndStore(req, cacheName);
        return res;
      } else {
        return fetchAndStore(req, cacheName);
      }
    });
  };
}

function fetchAndStore(request, cacheName) {
  return fetch(request)
    .then(res => {
      return put(cacheName, request, res.clone())
        .then(() => res);
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
