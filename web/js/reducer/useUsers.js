import { useReducer, useEffect } from 'react';

import {
  CREATE_ACCOUNT
} from 'js/reducer/useFetch';

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE' : {
      return {
        ...state,
        [action.body._id]: action.body
      };
    }

    default:
      return state;
  }
}

export function useUsers(fetchState) {
  const [ state, dispatch ] = useReducer(reducer, {});

  useEffect(() => {
    const createAccountState = fetchState[CREATE_ACCOUNT] || {};

    if (createAccountState.body) {
      dispatch({
        type: 'UPDATE',
        body: createAccountState.body
      });
    }
  }, [fetchState[CREATE_ACCOUNT]]);

  return [ state, dispatch ];
}
