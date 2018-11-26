import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import URLSearchParams from 'url-search-params';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import * as Sentry from '@sentry/browser';

import { USER_SCHEMA } from 'common/schema';
import { Routes } from 'common/routes';
import { T } from 'common/i18n';
import { getNavigatorLanguage } from 'common/helpers';

import { fetch } from 'js/fetch';

import { MessageBlock, MessageBlockType } from 'component/message-block';
import { ApplicationContext } from 'js/context/application';
import { Button } from 'component/button';
import { Anchor } from 'component/anchor';
import { Input } from 'component/input';
import './style.scss';

export class Signup extends React.Component {
  static contextType = ApplicationContext;
  static propTypes = {
    onCreateAccount: PropTypes.func.isRequired
  };

  state = {
    email: '',
    password: '',
    passwordConfirm: '',
    displayAccountNotAvailable: false,
    displayUnableToCreateAccount: false,
    displayPasswordsDoNoMatch: false,
    displayPasswordLengthError: false,
    emailAvailable: null,
    loading: false
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (this.state.loading) {
      return;
    }

    const displayPasswordsDoNoMatch = this.state.password !== this.state.passwordConfirm;
    const displayPasswordLengthError = this.state.password.length < USER_SCHEMA.password.minLength ||
      this.state.passwordConfirm.length < USER_SCHEMA.password.minLength;

    if (displayPasswordsDoNoMatch) {
      return this.setState({ displayPasswordsDoNoMatch });
    }

    if (displayPasswordLengthError) {
      return this.setState({ displayPasswordLengthError });
    }

    this.setState({
      loading: true,
      displayPasswordsDoNoMatch,
      displayPasswordLengthError: false,
      displayUnableToCreateAccount: false,
      displayAccountNotAvailable: false
    });

    fetch('/account', {
      method: 'POST',
      body: {
        email: this.state.email,
        password: this.state.password,
        lastLanguage: getNavigatorLanguage(window.navigator)
      }
    }).then(({ body, response }) => {
      if (response.ok) {
        this.props.onCreateAccount(body);
      } else if (response.status === 409) {
        this.setState({
          displayAccountNotAvailable: true,
          loading: false
        });
      } else {
        Sentry.captureMessage('Unable to create account with status ' + response.status);
        this.setState({
          displayUnableToCreateAccount: true,
          loading: false
        });
      }
    }, () => {
      Sentry.captureMessage('Unable to create account with status');
      this.setState({
        displayUnableToCreateAccount: true,
        loading: false
      });
    });
  }

  onEmailChange = (e) => {
    const email = e.target.value;
    this.setState({ email }, () => {
      this.checkEmail();
    });
  }

  checkEmail = _.debounce(() => {
    const params = new URLSearchParams();
    params.append('email', this.state.email);

    fetch(`/user/email?${params.toString()}`).then(({ response }) => {
      this.setState({ emailAvailable: response.status === 404 });
    }, () => {
      this.setState({ emailAvailable: null });
    });
  }, 500);

  onPasswordChange = (e) => {
    this.setState({ password: e.target.value });
  }

  onPasswordConfirmChange = (e) => {
    this.setState({ passwordConfirm: e.target.value });
  }

  render() {
    const routes = new Routes();
    const { userId } = this.context;

    let content;

    if (userId === null) {
      let invalidCredentialsWarning = null;
      let unableToCreateAccount = null;
      let accountNotAvailable = null;
      let passwordLengthError = null;

      if (this.state.displayPasswordLengthError) {
        passwordLengthError = (
          <MessageBlock type={MessageBlockType.error}>
            {T('Your password must be at least 8 characters')}
          </MessageBlock>
        );
      }

      if (this.state.displayAccountNotAvailable) {
        accountNotAvailable = (
          <MessageBlock type={MessageBlockType.error}>
            {T('Sorry, this email is not available')}
          </MessageBlock>
        );
      }

      if (this.state.displayUnableToCreateAccount) {
        unableToCreateAccount = (
          <MessageBlock type={MessageBlockType.error}>
            {T('Sorry, we are not able to create your account. Please try again')}
          </MessageBlock>
        );
      }

      if (this.state.displayInvalidCredentials) {
        invalidCredentialsWarning = (
          <MessageBlock type={MessageBlockType.error}>
            {T('Sorry, invalid credentials')}
          </MessageBlock>
        );
      }

      let iconStyleName;

      if (this.state.email.length === 0 || this.state.emailAvailable === null) {
        iconStyleName = 'check-circle';
      } else if (this.state.emailAvailable) {
        iconStyleName = 'check-circle success';
      } else {
        iconStyleName = 'check-circle error';
      }

      content = (
        <form styleName='form' onSubmit={this.onSubmit}>
          {accountNotAvailable}
          {invalidCredentialsWarning}
          {unableToCreateAccount}
          {passwordLengthError}
          <div styleName='email-row'>
            <Input
              onChange={this.onEmailChange}
              value={this.state.email}
              placeholder={T('Email')}
              type='email'
              styleName='email-input'
              autoComplete='email'
            />
            <div styleName='check-icon-container'>
              <FontAwesomeIcon styleName={iconStyleName} icon={faCheckCircle} />
            </div>
          </div>
          <Input
            onChange={this.onPasswordChange}
            value={this.state.password}
            placeholder={T('Password')}
            type='password'
            error={this.state.displayPasswordsDoNoMatch}
            autoComplete='new-password'
            minLength={USER_SCHEMA.password.minLength}
          />
          <Input
            onChange={this.onPasswordConfirmChange}
            value={this.state.passwordConfirm}
            placeholder={T('Password Confirm')}
            type='password'
            error={this.state.displayPasswordsDoNoMatch}
            autoComplete='new-password'
            minLength={USER_SCHEMA.password.minLength}
          />
          <Button>
            {T('Create Account')}
          </Button>
          <Anchor to={routes.login()}>
            {T('Already have an account?')}
          </Anchor>
        </form>
      );
    } else {
      content = (
        <div styleName='form'>
          <span styleName='logged-in'>
            {T('You are logged in')}
          </span>
          <Anchor to={routes.transactions()} button={true}>
            {T('Go to my transactions')}
          </Anchor>
          <Anchor to={routes.events()} button={true}>
            {T('Go to events')}
          </Anchor>
        </div>
      );
    }

    return (
      <div styleName='root'>
        {content}
      </div>
    );
  }
}
