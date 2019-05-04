import { useReducer, useEffect, useContext } from 'react';
import _ from 'lodash';

import { safe } from 'js/helper';

import { FetchStateContext } from 'js/context';
import {
  GET_EVENT
} from 'js/reducer/useFetch';

function reducer(state, action) {
  switch (action.id) {
    case GET_EVENT: {
      return _.merge(state, {}, {
        [action.body._id]: action.body
      });
    }

    default:
      return state;
  }
}

export function useEvents() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);
  for (const type of [GET_EVENT]) {
    const data = fetchState[type];

    useEffect(() => {
      if (safe(() => data.response.ok)) {
        dispatch(data);
      }
    }, [ data ]);
  }

  return [ state, dispatch ];
}
