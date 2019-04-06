import { useReducer, useEffect, useContext } from 'react';

import { safe } from 'js/helper';

import { FetchStateContext } from 'js/context';
import {
  GET_ITEM
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

export function useItems() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);
  const getItemState = fetchState[GET_ITEM];

  useEffect(() => {
    if (safe(() => getItemState.response.ok)) {
      dispatch({
        type: 'UPDATE',
        data: getItemState.body
      });
    }
  }, [getItemState]);

  return [ state, dispatch ];
}
