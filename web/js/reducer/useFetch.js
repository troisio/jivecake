import { fetch } from 'whatwg-fetch';
import _ from 'lodash';

import settings from 'settings';

import { useReducer } from 'react';
import { safe } from 'js/helper';

export const UPDATE_USER = 'UPDATE_USER';
export const GET_USER = 'GET_USER';
export const GET_USER_ORGANIZATIONS = 'GET_USER_ORGANIZATIONS';

export const SEARCH_EMAIL = 'SEARCH_USER_EMAIL';
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT';
export const TOKEN_FROM_PASSWORD = 'TOKEN_FROM_PASSWORD';
export const GET_ITEM = 'GET_ITEM';

export const GET_EVENT = 'GET_EVENT';
export const CREATE_EVENT = 'CREATE_EVENT';
export const UPDATE_EVENT = 'UPDATE_EVENT';
export const UPDATE_EVENT_AVATAR = 'UPDATE_EVENT_AVATAR';

export const GET_ORGANIZATION_EVENTS = 'GET_ORGANIZATION_EVENTS';
export const GET_ORGANIZATION = 'GET_ORGANIZATION';
export const CREATE_ORGANIZATION = 'CREATE_ORGANIZATION';
export const UPDATE_ORGANIZATION_AVATAR = 'UPDATE_ORGANIZATION_AVATAR';
export const UPDATE_ORGANIZATION = 'UPDATE_ORGANIZATION';

const paramMatcher = new RegExp('/:[a-zA-Z]+', 'ig');

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE' : {
      return {
        ...state,
        [action.data.type]: action.data
      };
    }

    case 'DELETE' : {
      return _.omit(state, action.data.ids);
    }

    default:
      return state;
  }
}

export function useFetch(token) {
  const [ state, dispatch ] = useReducer(reducer, {});
  const resultDispatch = (url, options = {}, type = url) => {
    const data = {
      url,
      options: { ...options, headers: { ...options.headers } },
      type
    };

    const isJson = !(data.options.body instanceof File) &&
      typeof data.options.body === 'object' &&
      data.options.body !== null;

    if (isJson) {
      data.originalBody = options.body;
      data.options.body = JSON.stringify(data.options.body);
      data.options.headers['Content-Type'] = 'application/json';
    }

    if (token) {
      data.options.headers.Authorization = `Bearer ${token}`;
    }

    const query = safe(() => data.options.query, {});
    const searchParams = new URLSearchParams();

    for (const key of Object.keys(query)) {
      const value = query[key];

      if (Array.isArray(value)) {
        for (const element of value) {
          searchParams.append(key, element);
        }
      } else {
        searchParams.append(key, value);
      }
    }

    let derivedUrl;

    if (Array.isArray(data.url)) {
      const derivedURLArray = data.url[0].split('/');
      const params = {};
      let index = 1;

      for (const [ param ] of data.url[0].matchAll(paramMatcher)) {
        const name = param.substring(2);
        params[name] = data.url[index];
        derivedURLArray[index] = data.url[index];
        index++;
      }

      derivedUrl = '/' + derivedURLArray.join('/');
      data.params = params;
    } else {
      derivedUrl = '/' + data.url;
    }

    if (searchParams.toString() !== '') {
      derivedUrl += '?' + searchParams.toString();
    }

    dispatch({
      type: 'UPDATE',
      data: { ...data, fetching: true },
    });

    return fetch(settings.api.url + derivedUrl, data.options).then(response => {
      const contentType = response.headers.get('content-type');
      const nextData = {
        ...data,
        response,
        fetching: false,
      };

      if (contentType.includes('application/json')) {
        return response.json().then(body => {
          dispatch({ type: 'UPDATE', data: { ...nextData, body } });
        }, (error) => {
          dispatch({ type: 'UPDATE', data: { ...nextData, error } });
        });
      } else {
        dispatch({ type: 'UPDATE', data: nextData });
      }
    }, (error) => {
      dispatch({ type: 'UPDATE', data: { ...data, error } });
    });
  };

  const deleteDispatch = (ids) => {
    dispatch({
      type: 'DELETE',
      data: { ids }
    });
  };

  return [ state, resultDispatch, deleteDispatch ];
}
