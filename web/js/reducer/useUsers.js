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
    case 'UPDATE' : {
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
  const getUserFetchState = fetchState[GET_USER];
  const updateUserFetchState = fetchState[UPDATE_USER];

  useEffect(() => {
    if (safe(() => getUserFetchState.response.ok)) {
      dispatch({
        type: 'UPDATE',
        data: getUserFetchState.body
      });
    }
  }, [getUserFetchState]);

  useEffect(() => {
    if (safe(() => updateUserFetchState.response.ok)) {
      dispatch({
        type: 'UPDATE',
        data: updateUserFetchState.body
      });
    }
  }, [updateUserFetchState]);

  return [ state, dispatch ];
}
