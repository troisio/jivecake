import { fetch } from 'whatwg-fetch';

import settings from 'settings';

import { useReducer } from 'react';

export const SEARCH_EMAIL = 'SEARCH_USER_EMAIL';
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT';
export const TOKEN_FROM_PASSWORD = 'TOKEN_FROM_PASSWORD';

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE' : {
      return {
        ...state,
        [action.id]: action
      };
    }

    default:
      return state;
  }
}

export function useFetch(token) {
  const [ state, dispatch ] = useReducer(reducer, {});

  const resultDispatch = (url, options = {}, id = url) => {
    const action = {
      url,
      options: { ...options, headers: { ...options.headers } },
      id,
      type: 'UPDATE'
    };

    if (!(action.options.body instanceof File) && typeof action.options.body === 'object' && action.options.body !== null) {
      action.originalBody = options.body;
      action.options.body = JSON.stringify(action.options.body);
      action.options.headers['Content-Type'] = 'application/json';
    }

    if (token) {
      action.options.headers.Authorization = `Bearer ${token}`;
    }

    dispatch({
      ...action,
      fetching: true
    });

    fetch(settings.api.url + action.url, action.options).then(response => {
      const contentType = response.headers.get('content-type');
      const dispatchJson = {
        ...action,
        type: 'UPDATE',
        response
      };

      if (contentType.includes('application/json')) {
        response.json().then(body => {
          dispatch({ ...dispatchJson, body });
        }, (error) => {
          dispatch({ ...dispatchJson, error });
        });
      } else {
        dispatch(dispatchJson);
      }
    }, (error) => {
      dispatch({
        ...action,
        error,
        type: 'RESPONSE'
      });
    });
  };

  return [ state, resultDispatch ];
}
