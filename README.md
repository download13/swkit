# swkit

Helpers that make working with service workers a little easier.

## Example

```javascript
import {
	on,
	cacheAll,
	createRouter,
	networkFirst
} from 'swkit';


const router = createRouter();
const precacheNetworkFirst = networkFirst('precache');

router.get('/', precacheNetworkFirst);

router.get('/style.css', precacheNetworkFirst);

router.get('/randomnumber', request => {
	return new Response(Math.random().toString().substr(2));
});

router.get('/asyncrandomnumber', request => {
	return new Promise((resolve, reject) => {
		return new Response(Math.random().toString().substr(2));
	});
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
