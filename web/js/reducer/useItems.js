import { useReducer, useEffect, useContext } from 'react';
import _ from 'lodash';
import { safe } from 'js/helper';

import { FetchStateContext } from 'js/context';
import {
  GET_ITEM,
  GET_EVENT_ITEMS
} from 'js/reducer/useFetch';

function reducer(state, action) {
  switch (action.type) {
    case GET_ITEM: {
      return _.merge({}, state, {
        [action.body._id]: action.body
      });
    }

    case GET_EVENT_ITEMS: {
      const entities = _.keyBy(action.body.entity, '_id');
      return _.merge({}, state, entities);
    }

    default:
      return state;
  }
}

export function useItems() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);

  for (const type of [GET_ITEM, GET_EVENT_ITEMS]) {
    const data = fetchState[type];

    useEffect(() => {
      if (safe(() => data.response.ok)) {
        dispatch(data);
      }
    }, [ data ]);
  }

  return [ state, dispatch ];
}
