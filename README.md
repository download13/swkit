# swkit

Helpers that make working with service workers a little easier.

## install

`npm install swkit` or `yarn add swkit`

## Example

```javascript
import {
	on,
	cacheAll,
	createRouter,
	networkFirst
} from 'swkit';


const router = createRouter();

// Create middleware that updates `precache` and falls back to only cache
// in the absence of a network connection.
const precacheNetworkFirst = networkFirst('precache');

router.get('/', precacheNetworkFirst);

router.get('/style.css', precacheNetworkFirst);

router.get('/randomnumber', request => {
	return new Response(Math.random().toString().substr(2));
});

router.get('/asyncrandomnumber', request => {
	return new Promise((resolve, reject) => {
		resolve(new Response(Math.random().toString().substr(2)));
	});
});

// Middleware takes a Request object, and a parameters object.
// params holds the values of the replaced url tokens (in this case, `id`).
router.get('/items/:id', (req, params) => {
	// Router expects the middleware to return a Promise or a Response
	return new Response('This is item ' + params.id);
});

on('fetch', router.dispatch);

on('install', e => {
  e.waitUntil(
    cacheAll('precache', ['/', '/style.css'])
    .then(skipWaiting())
  );
});

on('activate', e => {
  e.waitUntil(clients.claim());
});

```

`dist/index.js` is in [UMD](https://github.com/umdjs/umd) format so it can be imported by a build process, or simply used via [importScripts](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts). If imported with `importScripts`, the contents of the library will be found under the global object `swkit`.
