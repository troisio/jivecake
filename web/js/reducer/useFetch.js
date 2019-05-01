import { fetch } from 'whatwg-fetch';
import _ from 'lodash';

import settings from 'settings';

import { useReducer } from 'react';

export const GET_USER = 'GET_USER';
export const GET_USER_ORGANIZATIONS = 'GET_USER_ORGANIZATIONS';
export const SEARCH_EMAIL = 'SEARCH_USER_EMAIL';
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT';
export const TOKEN_FROM_PASSWORD = 'TOKEN_FROM_PASSWORD';
export const GET_ITEM = 'GET_ITEM';
export const GET_EVENT = 'GET_EVENT';
export const CREATE_ORGANIZATION = 'CREATE_ORGANIZATION';
export const UPDATE_ORGANIZATION_AVATAR = 'UPDATE_ORGANIZATION_AVATAR';
export const UPDATE_ORGANIZATION = 'UPDATE_ORGANIZATION';

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE' : {
      return {
        ...state,
        [action.data.id]: action.data
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
  const resultDispatch = (url, options = {}, id = url) => {
    const data = {
      url,
      options: { ...options, headers: { ...options.headers } },
      id
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

    dispatch({
      type: 'UPDATE',
      data: { ...data, fetching: true },
    });

    let derivedUrl = data.url;

    if (Array.isArray(data.url)) {
      derivedUrl = '/' + data.join('/');
    }

    fetch(settings.api.url + derivedUrl, data.options).then(response => {
      const contentType = response.headers.get('content-type');
      const nextData = {
        ...data,
        response,
        fetching: false,
      };

      if (contentType.includes('application/json')) {
        response.json().then(body => {
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
