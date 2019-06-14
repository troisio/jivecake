import { useReducer, useEffect, useContext } from 'react';
import _ from 'lodash';

import { safe } from 'js/helper';

import {
  GET_USER_ORGANIZATIONS,
  GET_ORGANIZATION
} from 'js/reducer/useFetch';

import {
  FetchStateContext,
} from 'js/context';

function reducer(state, action) {
  switch (action.type) {
    case GET_USER_ORGANIZATIONS: {
      const map = _.keyBy(action.body.entity, '_id');
      return _.merge({}, state, map);
    }

    case GET_ORGANIZATION: {
      return {
        ...state,
        [action.body._id]: action.body
      };
    }

    default:
      return state;
  }
}

export function useOrganizations() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);

  for (const type of [GET_USER_ORGANIZATIONS, GET_ORGANIZATION]) {
    const data = fetchState[type];

    useEffect(() => {
      if (safe(() => data.response.ok)) {
        dispatch(data);
      }
    }, [ data ]);
  }

  return [ state, dispatch ];
}
