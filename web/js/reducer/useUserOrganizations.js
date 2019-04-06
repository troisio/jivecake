import { useReducer, useEffect, useContext } from 'react';

import { FetchStateContext } from 'js/context';
import {
  GET_USER_ORGANIZATIONS
} from 'js/reducer/useFetch';

function reducer(state, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function useUserOrganizations() {
  const [ state, dispatch ] = useReducer(reducer, {});
  const fetchState = useContext(FetchStateContext);
  const getUserOrganizationState = fetchState[GET_USER_ORGANIZATIONS];

  useEffect(() => {
    console.log('getUserOrganizationState', getUserOrganizationState);
  }, [getUserOrganizationState]);

  return [ state, dispatch ];
}
