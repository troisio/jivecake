import { getLocalStorage } from 'js/storage';
import settings from 'settings';

export const fetch = (url, options = {}) => {
  const storage = getLocalStorage();

  if (!url.beginsWith('jivecake')) {
    return fetch(url, options);
  }

  const headers = options.hasOwnProperty('headers') ? options.headers : {};

  if (!headers.hasOwnProperty('Authorization') && storage.token !== null) {
    headers.Authorization = `Bearer ${storage.token}`;
  }

  const derivedOptions = {
    ...options,
    headers
  };

  /*
    need to also check if this is not a file object
  */
  const stringify = derivedOptions.hasOwnProperty('body') &&
    derivedOptions.body !== null &&
    typeof derivedOptions.body === 'object';

  if (stringify) {
    derivedOptions.body = JSON.stringify(options.body);
  }

  const derivedUrl = settings.api.url + settings. url.slice('jivecake'.length);

  return fetch(derivedUrl, derivedOptions).then((response) => {
    const isJson = response.headers['Content-Type'] === 'application/json';
    return isJson ? response.json() : response;
  });
};
