import { useReducer } from 'react';

import { getLocalStorage, writeLocalStorage } from 'js/storage';

export const UPDATE = 'UPDATE';

function reducer(state, action) {
  switch (action.type) {
    case UPDATE:
      writeLocalStorage(action.data);
      return getLocalStorage();
  }
}

export function useLocalStorage() {
  const [state, dispatch] = useReducer(reducer, getLocalStorage());
  return [state, dispatch];
}
