import { getEntityStoreHook } from 'web/js/helper/reducer';

import {
  GET_STRIPE_SESSION
} from 'web/js/reducer/useFetch';

function reducer(state, action) {
  switch (action.type) {
    case GET_STRIPE_SESSION: {
      return {
        ...state,
        [action.body.session.id]: action.body
      };
    }

    default:
      return state;
  }
}

export const useStripeSessions = getEntityStoreHook(
  [GET_STRIPE_SESSION],
  reducer
);
