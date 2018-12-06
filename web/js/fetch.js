import { getLocalStorage } from 'js/storage';
import settings from 'settings';

export const getFetch = (fetchStoreInterceptor) => {
  return (url, options = {}, transform = true) => {
    const storage = getLocalStorage();

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return window.fetch(url, options);
    }

    const headers = options.hasOwnProperty('headers') ? options.headers : {};

    if (!headers.hasOwnProperty('Authorization') && storage.token !== null) {
      headers.Authorization = `Bearer ${storage.token}`;
    }

    const derivedOptions = {
      ...options,
      headers
    };

    const stringify = derivedOptions.hasOwnProperty('body') &&
      derivedOptions.body !== null &&
      typeof derivedOptions.body === 'object';

    if (derivedOptions.body instanceof File) {
      derivedOptions.headers['Content-Type'] = derivedOptions.body.type;
    } else if (stringify && transform) {
      derivedOptions.body = JSON.stringify(derivedOptions.body);
      derivedOptions.headers['Content-Type'] = 'application/json';
    }

    let query = '';

    if (options.hasOwnProperty('query')) {
      const params = new URLSearchParams();

      for (const key of Object.keys(options.query)) {
        const value = options.query[key];
        params.append(key, value);
      }

      query += `?${params.toString()}`;
    }

    const derivedUrl = settings.api.url + url + query;
    const future = window.fetch(derivedUrl, derivedOptions);

    return future.then((response) => {
      const isJson = response.headers.has('Content-Type') &&
        response.headers.get('Content-Type').includes('application/json');

      if (isJson) {
        return response.json().then(body => {
          fetchStoreInterceptor(url, options, response, body);
          return { response, body };
        });
      }

      return { response };
    });
  };
};
