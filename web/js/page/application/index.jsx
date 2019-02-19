import React from 'react';
import { Route } from 'react-router-dom';
import { BrowserRouter, Switch } from 'react-router-dom';
import _ from 'lodash';

import { getFetch } from 'js/fetch';
import { fetchStoreInterceptor } from 'js/fetchStoreInterceptor';
import { routes } from 'js/routes';
import { getLocalStorage, writeLocalStorage } from 'js/storage';
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
  OrganizationContext,
  UserContext,
  UserOrganizationContext,
  OrganizationEventsContext,
  EventContext
} from 'js/context';

import './style.scss';

export class Application extends React.Component {
  interceptor = (
    url,
    options,
    response,
    body
  ) => {
    return fetchStoreInterceptor(url, options, response, body, {
      updateOrganizations: this.updateOrganizations,
      updateEvents: this.updateEvents,
      updateUsers: this.updateUsers,
      updateUserOrganizations: this.updateUserOrganizations,
      updateOrganizationEvents: this.updateOrganizationEvents,
      updateCredentials: this.updateCredentials,
    });
  };

  DEFAULT_STATE = {
    application: {
      userId: getLocalStorage().userId,
      fetch: getFetch(this.interceptor)
    },
    organizations: {
    },
    events: {
    },
    items: {
    },
    transactions: {
    },
    users: {
    },
    userOrganizations:  {
    },
    organizationEvents:  {
    }
  };

  state = { ...this.DEFAULT_STATE };

  updateCredentials = (credentials) => {
    const writtenCredentials = writeLocalStorage(credentials);
    this.setState({ application: {
      ...this.state.application,
      userId: writtenCredentials.userId
    }});
  };

  updateOrganizations = (newOrganizations) => {
    const organizations = {
      ...this.state.organizations,
      ..._.keyBy(newOrganizations, '_id')
    };

    this.setState({ organizations });
  };

  updateEvents = (newEvents) => {
    const events = {
      ...this.state.events,
      ..._.keyBy(newEvents, '_id')
    };
    this.setState({ events });
  };

  updateUsers = (newUsers) => {
    const users = {
      ...this.state.users,
      ..._.keyBy(newUsers, '_id')
    };
    this.setState({ users });
  };

  updateUserOrganizations = (userId, page, count, organizations) => {
    const ids = organizations.map(organization => organization._id);
    const userOrganizations = _.merge({ ...this.state.userOrganization }, {
      [userId]: {
        count,
        pages: {
          [page]: ids
        }
      }
    });

    this.setState({ userOrganizations });
  };

  updateOrganizationEvents = (organizationId, page, count, events) => {
    const ids = events.map(({ _id }) => _id);
    const organizationEvents = _.merge({ ...this.state.organizationEvents }, {
      [organizationId]: {
        count,
        pages: {
          [page]: ids
        }
      }
    });

    this.setState({ organizationEvents });
  };

  onLogoutClick = () => {
    writeLocalStorage();
    this.setState({ ...this.DEFAULT_STATE });
  };

  onLogin = ({ user, token }) => {
    writeLocalStorage();
    const storage = getLocalStorage();
    storage.userId = user._id;
    storage.token = token;
    writeLocalStorage(storage);

    this.setState({
      application: {
        userId: storage.userId
      },
      users: { ...this.state.users, [ user._id ]: user }
    });
  };

  render() {
    let authenticatedRoutes = null;

    if (this.state.application.userId !== null) {
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

    return (
      <BrowserRouter>
        <ApplicationContext.Provider value={this.state.application}>
          <OrganizationContext.Provider value={this.state.organizations}>
            <UserOrganizationContext.Provider value={this.state.userOrganizations}>
              <UserContext.Provider value={this.state.user}>
                <EventContext.Provider value={this.state.events}>
                  <OrganizationEventsContext.Provider value={this.state.organizationEvents}>
                    <div styleName='root'>
                      <Header onLogoutClick={this.onLogoutClick} />
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
                  </OrganizationEventsContext.Provider>
                </EventContext.Provider>
              </UserContext.Provider>
            </UserOrganizationContext.Provider>
          </OrganizationContext.Provider>
        </ApplicationContext.Provider>
      </BrowserRouter>
    );
  }
}
