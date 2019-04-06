import { useReducer, useEffect, useContext } from 'react';

import { safe } from 'js/helper';

import { FetchStateContext } from 'js/context';
import {
  GET_EVENT
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

export function useEvents() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);
  const getEventState = fetchState[GET_EVENT];

  useEffect(() => {
    if (safe(() => getEventState.response.ok)) {
      dispatch({
        type: 'UPDATE',
        data: getEventState.body
      });
    }
  }, [getEventState]);

  return [ state, dispatch ];
}
