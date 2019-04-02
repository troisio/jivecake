import { useReducer } from 'react';

import { getLocalStorage, writeLocalStorage } from 'js/storage';

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE': {
      const copy = { ...action.data };
      delete copy.type;
      writeLocalStorage(copy);
      return getLocalStorage();
    }

    case 'RESET': {
      writeLocalStorage();
      return getLocalStorage();
    }
  }
}

export function useLocalStorage() {
  return useReducer(reducer, getLocalStorage());
}
