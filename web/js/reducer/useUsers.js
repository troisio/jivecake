import { useReducer, useEffect, useContext } from 'react';


import { safe } from 'js/helper';

import { FetchStateContext } from 'js/context';
import {
  GET_USER
} from 'js/reducer/useFetch';

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE' : {
      return {
        ...state,
        [action.data._id]: action.data
      };
    }

    default:
      return state;
  }
}

export function useUsers() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);
  const getUserFetchState = fetchState[GET_USER];

  useEffect(() => {
    if (safe(() => getUserFetchState.response.ok)) {
      dispatch({
        type: 'UPDATE',
        data: getUserFetchState.body
      });
    }
  }, [getUserFetchState]);

  return [ state, dispatch ];
}
