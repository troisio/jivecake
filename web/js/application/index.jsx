import React from 'react';
import { Route } from 'react-router-dom';
import { BrowserRouter, Switch } from 'react-router-dom';

import { Routes } from 'common/routes';

import { getLocalStorage, writeLocalStorage } from 'js/storage';
import { Header } from 'component/header';
import { Signup } from 'page/signup';
import { NotFound } from 'page/not-found';
import { Login } from 'page/login';
import { OrganizationPersist } from 'page/organization-persist';
import { Organization } from 'page/organization';
import { ForgotPassword } from 'page/forgot-password';
import { ApplicationContext } from 'js/context/application';
import { OrganizationContext } from 'js/context/organization';

import './style.scss';

export class Application extends React.Component {
  constructor(props) {
    super(props);

    const storage = getLocalStorage();

    this.state = {
      applicationContextValue: {
        userId: storage.userId,
        organization: storage.organizationId
      },
      organizationContextValue: {
      }
    };
  }

  onLogoutClick = () => {
    writeLocalStorage();
    const storage = getLocalStorage();

    this.setState({
      applicationContextValue: {
        userId: storage.userId
      }
    });
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
      }
    });
  }

  render() {
    const { applicationContextValue, organizationContextValue } = this.state;
    const routes = new Routes();
    const signup = (props) => (
      <Signup onLogin={this.onLogin} {...props} />
    );

    const login = (props) => (
      <Login onLogin={this.onLogin} {...props} />
    );

    let authenticatedRoutes = null;

    if (applicationContextValue.userId !== null) {
      const organization = (props) => (
        <OrganizationContext.Consumer>
          {organizations =>
            <Organization
              {...props}
              userId={applicationContextValue.userId}
              organizations={organizations}
            />
          }
        </OrganizationContext.Consumer>
      );

      const organizationPersist = (props) => {
        return (
          <OrganizationContext.Consumer>
            {organizations =>
              <OrganizationPersist
                { ...props }
                organizations={organizations}
                userId={applicationContextValue.userId}
              />
            }
          </OrganizationContext.Consumer>
        )
      };

      authenticatedRoutes = (
        <>
          <Route exact path={routes.organization()} component={organization} />
          <Route
            exact
            path={routes.organizationPersist(':organizationId?')}
            component={organizationPersist}
          />
        </>
      )
    }

    return (
      <BrowserRouter>
        <ApplicationContext.Provider value={applicationContextValue}>
          <OrganizationContext.Provider value={organizationContextValue}>
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
          </OrganizationContext.Provider>
        </ApplicationContext.Provider>
      </BrowserRouter>
    );
  }
}
