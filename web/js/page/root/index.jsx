import React from 'react';

import {
  FetchDispatchContext,
  FetchStateContext,
  LocalStorageContext,
  LocalStorageDispatchContext
} from 'js/context';

import { Application } from 'js/page/application';
import { Store } from 'js/component/store';
import { useFetch } from 'js/reducer/useFetch';
import { useLocalStorage } from 'js/reducer/useLocalStorage';
import './style.scss';

export function Root() {
  const [ storage, dispatchLocalStorage ] = useLocalStorage();
  const [ fetchState, dispatchFetch, dispatchFetchDelete ] = useFetch(storage.token);

  return (
    <LocalStorageContext.Provider value={storage}>
      <LocalStorageDispatchContext.Provider value={dispatchLocalStorage}>
        <FetchDispatchContext.Provider value={[ dispatchFetch, dispatchFetchDelete ]}>
          <FetchStateContext.Provider value={fetchState}>
            <Store>
              <Application />
            </Store>
          </FetchStateContext.Provider>
        </FetchDispatchContext.Provider>
      </LocalStorageDispatchContext.Provider>
    </LocalStorageContext.Provider>
  );
}
