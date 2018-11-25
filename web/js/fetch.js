import { getLocalStorage } from 'js/storage';
import settings from 'settings';

export const fetch = (url, options = {}, transform = true) => {
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

  if (stringify && transform) {
    derivedOptions.body = JSON.stringify(derivedOptions.body);
  }

  const derivedUrl = settings.api.url + url;

  return window.fetch(derivedUrl, derivedOptions).then((response) => {
    const isJson = response.headers['Content-Type'] === 'application/json';
    return isJson && transform ? response.json() : response;
  });
};
