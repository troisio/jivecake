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
import { NotFound } from 'page/not-found';
import { Login } from 'page/login';
import { Organization } from 'page/organization';
import { ForgotPassword } from 'page/forgot-password';
import { Events } from 'js/page/events';
import { CreateOrganization } from 'js/page/create-organization';
import { UpdateOrganization } from 'js/page/update-organization';
import { UpdateEvent } from 'js/page/update-event';
import { CreateEvent } from 'js/page/create-event';
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
  DEFAULT_STATE = {
    applicationContextValue: {
      userId: null
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

  constructor(props) {
    super(props);

    const storage = getLocalStorage();
    this.state = {
      ...this.DEFAULT_STATE,
      applicationContextValue: {
        userId: storage.userId
      }
    };

    const interceptor = (
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
        updateOrganizationEvents: this.updateOrganizationEvents
      });
    };

    this.fetch = getFetch(interceptor);
  }

  updateOrganizations = (organizations) => {
    const data = organizations
      .map(organization => ({ [organization._id] : organization }))
      .reduce((a, b) => ({ ...a, ...b }), []);
    const newOrganizations = _.merge({ ...this.state.organizations }, data );

    this.setState({ organizations: newOrganizations});
  }

  updateEvents = (events) => {
    const data = events
      .map(events => ({ [events._id] : events }))
      .reduce((a, b) => ({ ...a, ...b }), []);
    const entities = _.merge({ ...this.state.events }, data );
    this.setState({ events: entities });
  }

  updateUsers = (users) => {
    const data = users
      .map(user => ({ [user._id] : user }))
      .reduce((a, b) => ({ ...a, ...b }), []);
    const newUsers = _.merge({ ...this.state.users }, data);
    this.setState({ users: newUsers });
  }

  updateUserOrganizations = (userId, page, count, organizations) => {
    const ids = organizations.map(organization => organization._id);
    const result = _.merge({ ...this.state.userOrganization }, {
      [userId]: {
        count,
        pages: {
          [page]: ids
        }
      }
    });

    this.setState({ userOrganizations: result })
  }

  updateOrganizationEvents = (organizationId, page, count, events) => {
    const ids = events.map(({ _id }) => _id);
    const result = _.merge({ ...this.state.organizationEvents }, {
      [organizationId]: {
        count,
        pages: {
          [page]: ids
        }
      }
    });

    this.setState({ organizationEvents: result })
  }

  onLogoutClick = () => {
    writeLocalStorage();
    this.setState({ ...this.DEFAULT_STATE });

    /* TODO redirect to somewhere else */
  }

  onLogin = ({ user, token }) => {
    writeLocalStorage();
    const storage = getLocalStorage();
    storage.userId = user._id;
    storage.token = token;
    writeLocalStorage(storage);

    this.setState({
      applicationContextValue: {
        userId: storage.userId
      },
      users: { ...this.state.users, [ user._id ]: user }
    });
  }

  render() {
    const { applicationContextValue } = this.state;
    const signup = (props) => (
      <Signup fetch={this.fetch} onLogin={this.onLogin} {...props} />
    );

    const login = (props) => (
      <Login fetch={this.fetch} onLogin={this.onLogin} {...props} />
    );

    let authenticatedRoutes = null;

    if (applicationContextValue.userId !== null) {
      const organization = (props) => (
        <OrganizationContext.Consumer>
          {organizations =>
            <UserOrganizationContext.Consumer>
              {
                userOrganizations =>
                  <Organization
                    {...props}
                    fetch={this.fetch}
                    userId={applicationContextValue.userId}
                    organizations={organizations}
                    userOrganizations={userOrganizations}
                  />
              }
            </UserOrganizationContext.Consumer>
          }
        </OrganizationContext.Consumer>
      );

      authenticatedRoutes = (
        <>
          <Route exact path={routes.organization()} component={organization} />
          <Route
            exact
            path={routes.organizationPersist(':organizationId')}
            component={({ history, match }) => <UpdateOrganization match={match} history={history} fetch={this.fetch} />}
          />
          <Route
            exact
            path={routes.organizationPersist()}
            component={({ history }) => <CreateOrganization history={history} fetch={this.fetch} />}
          />
          <Route
            exact
            path={routes.eventPersist()}
            component={({ history }) => <CreateEvent history={history} fetch={this.fetch} />}
          />
          <Route
            exact
            path={routes.eventPersist(':eventId')}
            component={({ history }) => <UpdateEvent history={history} fetch={this.fetch} />}
          />
          <Route
            exact
            path={routes.organizationEvents(':organizationId')}
            component={({ history, match }) => (
              <Events
                userId={applicationContextValue.userId}
                organizationId={match.params.organizationId}
                history={history}
                fetch={this.fetch}
              />)}
          />
        </>
      )
    }

    return (
      <BrowserRouter>
        <ApplicationContext.Provider value={applicationContextValue}>
          <OrganizationContext.Provider value={this.state.organizations}>
            <UserOrganizationContext.Provider value={this.state.userOrganizations}>
              <UserContext.Provider value={this.state.user}>
                <EventContext.Provider value={this.state.events}>
                  <OrganizationEventsContext.Provider value={this.state.organizationEvents}>
                    <div styleName='root'>
                      <Header onLogoutClick={this.onLogoutClick} />
                      <Switch>
                        <Route exact path={routes.login()} component={login} />
                        <Route exact path={routes.signup()} component={signup} />
                        <Route exact path={routes.forgotPassword()} component={ForgotPassword} />
                        {authenticatedRoutes}
                        <Route component={NotFound} />
                      </Switch>
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
