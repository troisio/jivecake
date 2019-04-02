import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { safe } from 'js/helper';

import { routes } from 'js/routes';
import { Header } from 'component/header';
import { Signup } from 'page/signup';
import { NotFoundPage } from 'page/not-found';
import { Login } from 'page/login';
import { Organization } from 'page/organization';
import { EventPersist } from 'page/event-persist';
import { ForgotPassword } from 'page/forgot-password';
import { Events } from 'js/page/events';
import { OrganizationPersist } from 'js/page/organization-persist';
import { UpdateOrganization } from 'js/page/update-organization';
import { UpdateEvent } from 'js/page/update-event';

import {
  ApplicationContext,
  FetchDispatchContext,
  FetchStateContext,
  UserContext
} from 'js/context';
import { useFetch, TOKEN_FROM_PASSWORD } from 'js/reducer/useFetch';
import { useLocalStorage } from 'js/reducer/useLocalStorage';
import { useUsers } from 'js/reducer/useUsers';
import './style.scss';

export function Application() {
  const [ storage, dispatchLocalStorage ] = useLocalStorage();
  const [ fetchState, dispatchFetch ] = useFetch(storage.token);
  const fetchTokenState = fetchState[TOKEN_FROM_PASSWORD];
  const [ usersState ] = useUsers(fetchState);
  const authenticatedRoutes = (
    <Switch>
      <Route path={routes.organizationPersist(':organizationId')} component={UpdateOrganization} />
      <Route path={routes.organizationPersist()} component={OrganizationPersist} />
      <Route path={routes.organization()} component={Organization} />
      <Route path={routes.eventPersist(':eventId')} component={UpdateEvent} />
      <Route path={routes.eventPersist()} component={EventPersist} />
      <Route path={routes.organizationEvents(':organizationId')} component={Events} />
    </Switch>
  );

  function onLogoutClick() {
    dispatchLocalStorage({ type: 'RESET' });
  }

  useEffect(() => {
    if (safe(() => fetchTokenState.body)) {
      dispatchLocalStorage({
        type: 'UPDATE',
        userId: fetchTokenState.body.user._id,
        token: fetchTokenState.body.token
      });
    }
  }, [ fetchTokenState ]);

  return (
    <BrowserRouter>
      <ApplicationContext.Provider value={storage}>
        <FetchDispatchContext.Provider value={dispatchFetch}>
          <FetchStateContext.Provider value={fetchState}>
            <UserContext.Provider value={usersState}>
              <div styleName='root'>
                <Header onLogoutClick={onLogoutClick} />
                <div styleName='content'>
                  <Switch>
                    <Route path={routes.login()} component={Login} />
                    <Route path={routes.signup()} component={Signup} />
                    <Route path={routes.forgotPassword()} component={ForgotPassword} />
                    {storage.userId === null ? null : authenticatedRoutes}
                    <Route component={NotFoundPage} />
                  </Switch>
                </div>
              </div>
            </UserContext.Provider>
          </FetchStateContext.Provider>
        </FetchDispatchContext.Provider>
      </ApplicationContext.Provider>
    </BrowserRouter>
  );
}
