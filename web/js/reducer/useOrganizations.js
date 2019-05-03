import { useReducer, useEffect, useContext } from 'react';
import _ from 'lodash';

import { safe } from 'js/helper';

import {
  GET_USER_ORGANIZATIONS
} from 'js/reducer/useFetch';

import {
  FetchStateContext,
} from 'js/context';

function reducer(state, action) {
  switch (action.type) {
    case 'INSERT_MANY' : {
      const map = _.keyBy(action.data, '_id');

      return _.merge({}, state, map);
    }
    default:
      return state;
  }
}

export function useOrganizations() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);
  const getUserOrganizationState = fetchState[GET_USER_ORGANIZATIONS];

  useEffect(() => {
    const entities = safe(() => getUserOrganizationState.body.entity);

    if (entities) {
      dispatch({
        type: 'INSERT_MANY',
        data: entities
      });
    }
  }, [getUserOrganizationState]);

  return [ state, dispatch ];
}
