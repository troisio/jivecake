import { useReducer, useEffect, useContext } from 'react';

import {
  GET_USER_ORGANIZATIONS
} from 'js/reducer/useFetch';

import {
  FetchStateContext,
} from 'js/context';

function reducer(state, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function useOrganizations() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);
  const getUserOrganizationState = fetchState[GET_USER_ORGANIZATIONS];

  useEffect(() => {
    console.log('getUserOrganizationState', getUserOrganizationState);
  }, [getUserOrganizationState]);

  return [ state, dispatch ];
}
