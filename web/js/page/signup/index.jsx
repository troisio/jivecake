import React from 'react';
import { Link }from 'react-router-dom';

import { Routes } from 'common/routes';
import { T } from 'common/i18n';

import { fetch } from 'js/fetch';
import { writeLocalStorage } from 'js/storage';

import { ApplicationContext } from 'js/context/application';
import { Button } from 'component/button';
import { Input } from 'component/input';
import './style.scss';

export class Signup extends React.Component {
  static contextType = ApplicationContext;

  state = {
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    displayInvalidCredentials: false,
    displayPasswordsDoNoMatch: false,
    emailAvailable: false,
    loading: false
  };

  onSubmit = async (e) => {
    e.preventDefault();

    if (this.state.loading) {
      return;
    }

    if (this.state.password !== this.state.passwordConfirm) {
      return this.setState({ displayPasswordsDoNoMatch: true });
    }

    this.setState({loading: true});

    fetch('jivecake/account', {
      body: {
        username: this.state.username,
        password: this.state.password
      }
    }).then((result) => {
      writeLocalStorage(result);
    }, () => {
      this.setState({
        displayInvalidCredentials: true
      });
    }).then(() => {
        this.setState({loading: false});
    });
  }

  onEmailChange = (e) => {
    this.setState({ email: e.target.value });

    fetch('jivecake/user/email', {
      method: 'POST',
      body: {
        email: this.state.email
      }
    })
  }

  onPasswordChange = (e) => {
    this.setState({ password: e.target.value });
  }

  onPasswordConfirmChange = (e) => {
    this.setState({ passwordConfirm: e.target.value });
  }

  render() {
    const routes = new Routes();
    const { userId } = this.context;
    let invalidCredentialsWarning = null;

    let content;

    if (userId === null) {
      if (this.state.displayInvalidCredentials) {
        invalidCredentialsWarning = (
          <div>
            {T('Sorry, invalid credentials')}
          </div>
        );
      }

      let checkStyle;

      if (this.state.email.length === 0) {
        checkStyle = 'check-circle';
      } else if (this.state.emailAvailable) {
        checkStyle = 'check-circle success';
      } else {
        checkStyle = 'check-circle warn';
      }

      content = (
        <>
          {invalidCredentialsWarning}
          <form styleName='form' onSubmit={this.onSubmit}>
            <div styleName='email-row'>
              <Input
                onChange={this.onEmailChange}
                value={this.state.email}
                placeholder={T('Email')}
                type='email'
                styleName='email-input'
              />
              <div styleName='check-icon-container'>
                <i styleName={checkStyle} className='fas fa-user-check'></i>
              </div>
            </div>
            <Input
              onChange={this.onPasswordChange}
              value={this.state.password}
              placeholder={T('Password')}
              type='password'
              error={this.state.displayPasswordsDoNoMatch}
            />
            <Input
              onChange={this.onPasswordConfirmChange}
              value={this.state.passwordConfirm}
              placeholder={T('Password Confirm')}
              type='password'
              error={this.state.displayPasswordsDoNoMatch}
            />
            <Button>
              {T('Create Account')}
            </Button>
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
