import Route from 'route-parser';


export function cacheAll(name, urls) {
	return caches.open(name).then(cache => cache.addAll(urls));
}

export function createRouter() {
	const routes = [];

	return {
		get(path, handler) {
			const route = new Route(path);
			routes.push({route, handler});
		},
		dispatch(e) {
			for(const {route, handler} in routes) {
				const params = route.match(request.url);
				if(!params) continue;

				const response = handler(request);
				if(response instanceof Response) {
					e.respondWith(Promise.resolve(response));
					break;
				} else if(response instanceof Promise) {
					e.respondWith(response);
					break;
				} else {
					throw new Error('Invalid response. Must be instance of Response or Promise.');
				}
			}
		}
	};
}

export function on(eventName, handler, options) {
	return addEventListener(eventName, handler, options);
}
