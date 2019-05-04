import { useReducer, useEffect, useContext } from 'react';
import _ from 'lodash';

import { safe } from 'js/helper';

import { FetchStateContext } from 'js/context';
import {
  GET_USER,
  UPDATE_USER
} from 'js/reducer/useFetch';

function reducer(state, action) {
  switch (action.type) {
    case GET_USER: {
      return _.merge({}, state, {
        [action.data._id]: action.data
      });
    }

    default:
      return state;
  }
}

export function useUsers() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);

  for (const type of [GET_USER, UPDATE_USER]) {
    const state = fetchState[type];

    useEffect(() => {
      if (safe(() => state.response.ok)) {
        dispatch({type, data: state.body });
      }
    }, [state]);
  }

  return [ state, dispatch ];
}
