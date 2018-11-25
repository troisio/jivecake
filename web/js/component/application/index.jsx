import React from 'react';
import { Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

import { Routes } from 'common/routes';

import { getLocalStorage } from 'js/storage';
import { Header } from 'component/header';
import { Login } from 'page/login';
import { Signup } from 'page/signup';
import { ForgotPassword } from 'page/forgot-password';
import { ApplicationContext } from 'js/context/application';

import './style.scss';

export class Application extends React.Component {
  render() {
    const routes = new Routes();
    const storage = getLocalStorage();
    const value = {
      userId: storage.userId
    };

    return (
      <BrowserRouter>
        <ApplicationContext.Provider value={value}>
          <div styleName='root'>
            <Header />
            <Route exact path={routes.login()} component={Login} />
            <Route exact path={routes.signup()} component={Signup} />
            <Route exact path={routes.forgotPassword()} component={ForgotPassword} />
          </div>
        </ApplicationContext.Provider>
      </BrowserRouter>
    );
  }
}
