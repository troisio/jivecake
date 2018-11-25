import React from 'react';
import { Link }from 'react-router-dom';

import { ApplicationContext } from 'js/context/application';
import { Routes } from 'common/routes';
import { T } from 'common/i18n';

import { Button } from 'component/button';
import { Input } from 'component/input';
import './style.scss';

export class Login extends React.Component {
  static contextType = ApplicationContext;

  state = {
    displayInvalidCredentials: false
  };

  render() {
    const routes = new Routes();
    const { userId } = this.context;
    let invalidCredentialsWarning = null;

    let content;

    if (userId === null) {
      if (this.state.displayInvalidCredentials) {
        invalidCredentialsWarning = (
          <div>
          </div>
        );
      }

      content = (
        <>
          {invalidCredentialsWarning}
          <form styleName='form'>
            <Input placeholder={T('Email')} type='email' />
            <Input placeholder={T('Password')} type='password' />
            <Button>
              {T('Log In')}
            </Button>
            <Link to={routes.forgotPassword()}>
              {T('Forgot your password?')}
            </Link>
            <Link to={routes.signup()}>
              {T('Sign up')}
            </Link>
          </form>
        </>
      );
    } else {
      content = (
        <>
          <span>
            {T('You are already logged in')}
          </span>
          <Link to={routes.myTransactions(userId)}>
            {T('Go to my transactions')}
          </Link>
        </>
      );
    }

    return (
      <div styleName='root'>
        {content}
      </div>
    );
  }
}
