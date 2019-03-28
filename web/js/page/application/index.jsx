import React from 'react';
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

import { ApplicationContext, FetchDispatchContext, FetchStateContext } from 'js/context';
import { useFetch } from 'js/reducer/useFetch';

import './style.scss';

export function Application() {
  const [ fetchState, dispatchFetch ] = useFetch();
  const userId = null;
  let authenticatedRoutes = null;

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

  console.log('fetchState', fetchState);

  return (
    <BrowserRouter>
      <ApplicationContext.Provider value={{userId: null}}>
        <FetchDispatchContext.Provider value={dispatchFetch}>
          <FetchStateContext.Provider value={fetchState}>
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
          </FetchStateContext.Provider>
        </FetchDispatchContext.Provider>
      </ApplicationContext.Provider>
    </BrowserRouter>
  );
}
