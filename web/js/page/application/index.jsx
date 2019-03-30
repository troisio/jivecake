import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { BrowserRouter, Switch } from 'react-router-dom';

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

import { getLocalStorage } from 'js/storage';

import {
  ApplicationContext,
  FetchDispatchContext,
  FetchStateContext,
  UserContext
} from 'js/context';
import { useFetch, TOKEN_FROM_PASSWORD } from 'js/reducer/useFetch';
import { useUsers } from 'js/reducer/useUsers';
import './style.scss';

export function Application() {
  const storage = getLocalStorage();
  const [ applicationState, setApplicationState ] = useState(storage);
  const [ fetchState, dispatchFetch ] = useFetch(applicationState.token);
  const fetchTokenState = fetchState[TOKEN_FROM_PASSWORD];
  const [ usersState ] = useUsers(fetchState);
  const userId = null;
  let authenticatedRoutes = null;

  useEffect(() => {
    if (!fetchTokenState) {
      return;
    }

    setApplicationState({
      userId: fetchTokenState.body.user._id,
      token: fetchTokenState.body.token
    });
  }, [ fetchTokenState ]);

  if (userId !== null) {
    authenticatedRoutes = (
      <Switch>
        <Route path={routes.organizationPersist(':organizationId')} component={UpdateOrganization} />
        <Route path={routes.organizationPersist()} component={OrganizationPersist} />
        <Route path={routes.organization()} component={Organization} />
        <Route path={routes.eventPersist(':eventId')} component={UpdateEvent} />
        <Route path={routes.eventPersist()} component={EventPersist} />
        <Route path={routes.organizationEvents(':organizationId')} component={Events} />
      </Switch>
    );
  }

  const onLogoutClick = () => {

  };

  return (
    <BrowserRouter>
      <ApplicationContext.Provider value={applicationState}>
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
                    {authenticatedRoutes}
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
