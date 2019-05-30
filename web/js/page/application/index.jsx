import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import _ from 'lodash';
import jwt from 'jsonwebtoken';

import { safe } from 'js/helper';

import {
  ApplicationContext,
  SetApplicationStateContext,
  OrganizationContext,
  FetchDispatchContext,
  FetchStateContext,
  LocalStorageContext,
  UserContext,
  LocalStorageDispatchContext
} from 'js/context';

import { routes } from 'js/routes';
import { Header } from 'component/header';
import { NaturalSpinner } from 'component/natural-spinner';
import { Signup } from 'page/signup';
import { NotFound } from 'page/not-found';
import { Landing } from 'page/landing';
import { Account } from 'page/account';
import { Login } from 'page/login';
import { Organization } from 'page/organization';
import { EventPersist } from 'page/event-persist';
import { ItemPersist } from 'page/item-persist';
import { ForgotPassword } from 'page/forgot-password';
import { EventDashboard } from 'page/event-dashboard';
import { Events } from 'js/page/events';
import { Home } from 'js/page/home';
import { OrganizationPersist } from 'js/page/organization-persist';

import {
  TOKEN_FROM_PASSWORD,
  GET_USER,
  GET_ORGANIZATION,
  CREATE_ORGANIZATION,
  GET_USER_ORGANIZATIONS
} from 'js/reducer/useFetch';
import './style.scss';

const DEFAULT_APPLICATION_STATE = { userId: null, organizationId: null };

export function Application() {
  const storage = useContext(LocalStorageContext);
  const dispatchLocalStorage = useContext(LocalStorageDispatchContext);
  const [ dispatchFetch ] = useContext(FetchDispatchContext);
  const usersState = useContext(UserContext);
  const fetchState = useContext(FetchStateContext);
  const organizationMap = useContext(OrganizationContext);

  const fetchTokenState = fetchState[TOKEN_FROM_PASSWORD];
  const getUserState = fetchState[GET_USER];
  const createOrganizationState = fetchState[CREATE_ORGANIZATION];

  const [ applicationState, setApplicationState ] = useState(DEFAULT_APPLICATION_STATE);
  const jwtPayload = jwt.decode(storage.token);

  const onLogoutClick = e => {
    e.preventDefault();
    dispatchLocalStorage({ type: 'RESET' });
  };
  const authenticatedRoutes = (
    <Switch>
      <Route path={routes.organizationPersist(':organizationId')} component={OrganizationPersist} />
      <Route path={routes.organizationPersist()} component={OrganizationPersist} />
      <Route path={routes.organization()} component={Organization} />
      <Route path={routes.itemPersist(':eventId', ':itemId')} component={ItemPersist} />
      <Route path={routes.itemPersist(':eventId')} component={ItemPersist} />
      <Route path={routes.eventPersist()} component={EventPersist} />
      <Route path={routes.eventPersist(':eventId')} component={EventPersist} />
      <Route path={routes.event(':eventId')} component={EventDashboard} />
      <Route path={routes.event()} component={Events} />
      <Route path={routes.home()} component={Home} />
      <Route path={routes.account()} component={Account} />
    </Switch>
  );

  useEffect(() => {
    if (!applicationState.userId) {
      return;
    }

    dispatchFetch(
      ['user/:userId/organization', applicationState.userId],
      {
        query: {
          page: 0,
          order: '-created'
        }
      },
      GET_USER_ORGANIZATIONS
    );
  }, [ applicationState ]);

  useEffect(() => {
    if (applicationState.organizationId) {
      return;
    }

    const organization = _.values(organizationMap)
      .find(({ read }) => read.includes(applicationState.userId));

    if (organization) {
      setApplicationState({ ...applicationState, organizationId: organization._id });
    }
  }, [ organizationMap, applicationState ]);

  useEffect(() => {
    if (!safe(() => fetchTokenState.response.ok)) {
      return;
    }
    dispatchLocalStorage({
      type: 'UPDATE',
      data: {
        token: fetchTokenState.body.token
      }
    });
  }, [ fetchTokenState ]);

  useEffect(() => {
    if (jwtPayload) {
      dispatchFetch(['user/:userId', jwtPayload.sub], {}, GET_USER);
    }
  }, [ storage ]);

  useEffect(() => {
    if (safe(() => createOrganizationState.response.ok)) {
      dispatchFetch(['organization/:organizationId', createOrganizationState.body._id], {}, GET_ORGANIZATION);

      if (applicationState.organizationId !== createOrganizationState.body._id) {
        setApplicationState({
          ...applicationState,
          organizationId: createOrganizationState.body._id
        });
      }
    }
  }, [ createOrganizationState, applicationState ]);

  useEffect(() => {
    const status = safe(() => getUserState.response.status);
    const userId = safe(() => getUserState.params.userId);

    if (jwtPayload && jwtPayload.sub === userId) {
      if (status === 401) {
        dispatchLocalStorage({ type: 'RESET' });
      }
    }
  }, [ getUserState, jwtPayload ]);

  useEffect(() => {
    const nextApplicationState = { ...applicationState };

    if (jwtPayload) {
      if (usersState.hasOwnProperty(jwtPayload.sub)) {
        nextApplicationState.userId = jwtPayload.sub;
      }
    } else {
      nextApplicationState.userId = null;
    }

    if (nextApplicationState.userId !== applicationState.userId) {
      setApplicationState(nextApplicationState);
    }
  }, [ usersState, storage, applicationState ]);

  let content;
  const loading = safe(() => getUserState.fetching) ||
    (applicationState.userId && !usersState.hasOwnProperty(applicationState.userId));

  if (loading) {
    content = <NaturalSpinner styleName='spinner' />;
  } else {
    content = (
      <>
        <Header onLogoutClick={onLogoutClick} />
        <Switch>
          <Route exact path={routes.landing()} component={Landing} />
          <Route path={routes.login()} component={Login} />
          <Route path={routes.signup()} component={Signup} />
          <Route path={routes.forgotPassword()} component={ForgotPassword} />
          {applicationState.userId === null ? null : authenticatedRoutes}
          <Route component={NotFound} />
        </Switch>
      </>
    );
  }

  return (
    <ApplicationContext.Provider value={applicationState}>
      <SetApplicationStateContext.Provider value={setApplicationState}>
        <BrowserRouter>
          <div styleName='root'>
            {content}
          </div>
        </BrowserRouter>
      </SetApplicationStateContext.Provider>
    </ApplicationContext.Provider>
  );
}
