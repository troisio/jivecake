import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import jwt from 'jsonwebtoken';

import { safe } from 'js/helper';

import {
  ApplicationContext,
  FetchDispatchContext,
  FetchStateContext,
  LocalStorageContext,
  UserContext,
  LocalStorageDispatchContext
} from 'js/context';

import { routes } from 'js/routes';
import { Header } from 'component/header';
import { Signup } from 'page/signup';
import { NotFoundPage } from 'page/not-found';
import { Landing } from 'page/landing';
import { Account } from 'page/account';
import { Login } from 'page/login';
import { Organization } from 'page/organization';
import { EventPersist } from 'page/event-persist';
import { ForgotPassword } from 'page/forgot-password';
import { Events } from 'js/page/events';
import { Home } from 'js/page/home';
import { OrganizationPersist } from 'js/page/organization-persist';
import { UpdateOrganization } from 'js/page/update-organization';
import { UpdateEvent } from 'js/page/update-event';

import { TOKEN_FROM_PASSWORD, GET_USER } from 'js/reducer/useFetch';
import './style.scss';

const DEFAULT_APPLICATION_STATE = { userId: null, organizationId: null };

export function Application() {
  const [ applicationState, setApplicationState ] = useState(DEFAULT_APPLICATION_STATE);
  const storage = useContext(LocalStorageContext);
  const dispatchLocalStorage = useContext(LocalStorageDispatchContext);
  const [ dispatchFetch ] = useContext(FetchDispatchContext);
  const usersState = useContext(UserContext);
  const fetchState = useContext(FetchStateContext);
  const fetchTokenState = fetchState[TOKEN_FROM_PASSWORD];
  const authenticatedRoutes = (
    <Switch>
      <Route path={routes.organizationPersist(':organizationId')} component={UpdateOrganization} />
      <Route path={routes.organizationPersist()} component={OrganizationPersist} />
      <Route path={routes.organization()} component={Organization} />
      <Route path={routes.eventPersist(':eventId')} component={UpdateEvent} />
      <Route path={routes.eventPersist()} component={EventPersist} />
      <Route path={routes.organizationEvents(':organizationId')} component={Events} />
      <Route path={routes.home()} component={Home} />
      <Route path={routes.account()} component={Account} />
    </Switch>
  );

  function onLogoutClick(e) {
    e.preventDefault();
    dispatchLocalStorage({ type: 'RESET' });
  }

  useEffect(() => {
    if (safe(() => fetchTokenState.response.ok)) {
      dispatchLocalStorage({
        type: 'UPDATE',
        data: {
          token: fetchTokenState.body.token
        }
      });
    }
  }, [ fetchTokenState ]);

  useEffect(() => {
    const payload = jwt.decode(storage.token);

    if (payload) {
      dispatchFetch(`/user/${payload.sub}`, {}, GET_USER);
    }
  }, [ storage ]);

  useEffect(() => {
    const payload = jwt.decode(storage.token);
    const nextApplicationState = { ...applicationState };

    if (payload) {
      if (usersState.hasOwnProperty(payload.sub)) {
        nextApplicationState.userId = payload.sub;
      }
    } else {
      nextApplicationState.userId = null;
    }

    if (nextApplicationState.userId !== applicationState.userId) {
      setApplicationState(nextApplicationState);
    }
  }, [ usersState, storage, applicationState ]);

  return (
    <ApplicationContext.Provider value={applicationState}>
      <BrowserRouter>
        <div styleName='root'>
          <Header onLogoutClick={onLogoutClick} />
          <Switch>
            <Route exact path={routes.landing()} component={Landing} />
            <Route path={routes.login()} component={Login} />
            <Route path={routes.signup()} component={Signup} />
            <Route path={routes.forgotPassword()} component={ForgotPassword} />
            {applicationState.userId === null ? null : authenticatedRoutes}
            <Route component={NotFoundPage} />
          </Switch>
        </div>
      </BrowserRouter>
    </ApplicationContext.Provider>
  );
}
