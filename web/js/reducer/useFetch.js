import _ from 'lodash';
import { fetch } from 'whatwg-fetch';

import { useReducer, useEffect } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'CALL' : {
      return _.merge({}, state, {
        CALL: {
          [action.id] : action
        }
      });
    }

    case 'DELETE' : {
      const copy = { ...state };
      copy[action.key] = _.omit(copy[action.key], [action.id]);
      return copy;
    }

    case 'RESPONSE' : {
      return _.merge({}, state, {
        RESPONSE: {
          [action.id] : action
        }
      });
    }

    case 'RESPONSE_JSON' : {
      return _.merge({}, state, {
        RESPONSE_JSON: {
          [action.id] : action
        }
      });
    }

    case 'RESPONSE_JSON_READ' : {
      return _.merge({}, state, {
        RESPONSE_JSON_READ: {
          [action.id] : action
        }
      });
    }

    case 'ERROR' : {
      return _.merge({}, state, {
        ERROR: {
          [action.id] : action
        }
      });
    }

    default:
      return state;
  }
}

export function useFetch() {
  const [ state, dispatch ] = useReducer(reducer, { RESPONSE: {}, CALL: {}, RESPONSE_JSON: {}, RESPONSE_JSON_READ: {}, ERROR: {} });

  useEffect(() => {
    for (const key of Object.keys(state.CALL)) {
      const action = state.CALL[key];

      dispatch({
        id: action.id,
        key: 'CALL',
        type: 'DELETE'
      });

      fetch(action.url, action.options).then(response => {
        const contentType = response.headers.get('content-type');
        const type = contentType && contentType.includes('application/json') ? 'RESPONSE_JSON' : 'RESPONSE';

        dispatch({
          ...action,
          response,
          type
        });
      }, (error) => {
        dispatch({
          ...action,
          error,
          type: 'ERROR'
        });
      });
    }
  }, [state.CALL]);

  useEffect(() => {
    for (const key of Object.keys(state.RESPONSE_JSON)) {
      const action = state.RESPONSE_JSON[key];

      dispatch({
        id: action.id,
        key: 'RESPONSE_JSON',
        type: 'DELETE'
      });

      action.response.json().then(json => {
        dispatch({
          ...action,
          json,
          type: 'RESPONSE_JSON_READ'
        });
      }, (error) => {
        dispatch({
          ...action,
          error,
          type: 'ERROR'
        });
      });
    }
  }, [state.RESPONSE_JSON]);

  const resultDispatch = (url, options = {}, id = url) => {
    return dispatch({
      url,
      options,
      id,
      type: 'CALL'
    });
  };

  return [ state, resultDispatch ];
}
