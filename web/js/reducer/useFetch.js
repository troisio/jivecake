import { useReducer, useEffect } from 'react';

import { useLocalStorage } from 'js/reducer/useLocalStorage';
import settings from 'settings';

export const REQUEST = 'REQUEST';
export const AFTER = 'AFTER';

function reducer(state, action) {
  switch (action.type) {
    case AFTER :
    case REQUEST : {
      return { ...state, [action.id]: { ...action } };
    }

    default:
      return state;
  }
}

export function useFetch(id) {
  const [ state, dispatch ] = useReducer(reducer, {});
  const [ storage ] = useLocalStorage();

  useEffect(() => {
    if (!state.hasOwnProperty(id)) {
      return;
    }

    const { type } = state[id];
    let doNext = true;

    if (type === REQUEST) {
      const { url, options } = state[id];
      const headers = options.hasOwnProperty('headers') ? options.headers : {};

      if (options.hasOwnProperty('headers') && !headers.hasOwnProperty('Authorization') && storage.token !== null) {
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
      } else if (stringify) {
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

      future.then((response) => {
        if (doNext) {
          const isJson = response.headers.has('Content-Type') &&
            response.headers.get('Content-Type').includes('application/json');

          if (isJson) {
            return response.json().then(body => {
              if (doNext) {
                dispatch({ type: AFTER, id, response, body });
              }
            }, (error) => {
              dispatch({ type: AFTER, id, error });
            });
          }
        }
      }, (error) => {
        if (doNext) {
          dispatch({ type: AFTER, id, error });
        }
      });
    }

    return () => {
      doNext = false;
    };
  });

  const resultState = state.hasOwnProperty(id) ? state[id] : null;
  const resultDispatch = (url, options = {}) => {
    const object = {
      url,
      options,
      id,
      type: REQUEST
    };
    return dispatch(object);
  };

  return [ resultState, resultDispatch ];
}
