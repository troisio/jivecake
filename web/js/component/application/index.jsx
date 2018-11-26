import React from 'react';
import { Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

import { Routes } from 'common/routes';

import { getLocalStorage, writeLocalStorage } from 'js/storage';
import { Header } from 'component/header';
import { Login } from 'page/login';
import { Signup } from 'page/signup';
import { ForgotPassword } from 'page/forgot-password';
import { ApplicationContext } from 'js/context/application';

import './style.scss';

export class Application extends React.Component {
  constructor(props) {
    super(props);

    const storage = getLocalStorage();

    this.state = {
      applicationContextValue: {
        userId: storage.userId
      }
    };
  }

  onCreateAccount = (user) => {
    writeLocalStorage({ userId: user._id });
    const storage = getLocalStorage();

    this.setState({
      applicationContextValue: {
        userId: storage.userId
      }
    });
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

  render() {
    const routes = new Routes();
    const signup = () => (
      <Signup onCreateAccount={this.onCreateAccount} />
    );

    return (
      <BrowserRouter>
        <ApplicationContext.Provider value={this.state.applicationContextValue}>
          <div styleName='root'>
            <Header onLogoutClick={this.onLogoutClick} />
            <Route exact path={routes.login()} component={Login} />
            <Route exact path={routes.signup()} component={signup} />
            <Route exact path={routes.forgotPassword()} component={ForgotPassword} />
          </div>
        </ApplicationContext.Provider>
      </BrowserRouter>
    );
  }
}
