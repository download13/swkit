# swkit

Helpers that make working with service workers a little easier.

## Examples

```javascript
import {
	on,
	cacheAll,
	createRouter
} from 'swkit';


const router = createRouter();

router.get('/randomnumber', request => {
	return new Response(Math.random().toString().substr(2));
});

router.get('/asyncrandomnumber', request => {
	return new Promise((resolve, reject) => {
		return new Response(Math.random().toString().substr(2));
	});
});

router.serveCache('precache');

on('install', e => {
	return e.waitUntil(cacheAll('precache', ['/', '/main.js', '/style.css']));
});

on('fetch', router.dispatch);
```
