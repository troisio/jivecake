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

import { MessageBlock } from 'component/message-block';
import { ApplicationContext } from 'js/context/application';
import { Button } from 'component/button';
import { Anchor } from 'component/anchor';
import { Input } from 'component/input';
import './style.scss';

export class Signup extends React.Component {
  static contextType = ApplicationContext;
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired
  };

  state = {
    email: '',
    password: '',
    passwordConfirm: '',
    displayAccountNotAvailable: false,
    displayUnableToCreateAccount: false,
    displayPasswordsDoNoMatch: false,
    displayPasswordLengthError: false,
    displayCommonPasswordError: false,
    emailAvailable: null,
    loading: false,
    onCreateAccountSuccess: false
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { fetch } = this.props;

    if (this.state.loading) {
      return;
    }

    const displayPasswordsDoNoMatch = this.state.password !== this.state.passwordConfirm;
    const displayPasswordLengthError = this.state.password.length < USER_SCHEMA.password.minLength ||
      this.state.passwordConfirm.length < USER_SCHEMA.password.minLength;
    const displayCommonPasswordError = USER_SCHEMA.password.not.enum.includes(this.state.password);

    this.setState({
      loading: true,
      displayUnableToCreateAccount: false,
      displayPasswordsDoNoMatch,
      displayPasswordLengthError,
      displayCommonPasswordError
    });

    const hasError = displayCommonPasswordError || displayPasswordLengthError || displayPasswordsDoNoMatch;

    if (hasError) {
      return;
    }

    fetch('/account', {
      method: 'POST',
      body: {
        email: this.state.email,
        password: this.state.password,
        lastLanguage: getNavigatorLanguage(window.navigator)
      }
    }).then(({ response }) => {
      if (response.ok) {
        fetch('/token/password', {
          method: 'POST',
          body: {
            email: this.state.email,
            password: this.state.password
          }
        }).then(({ response, body }) => {
          if (response.ok) {
            this.props.onLogin(body);
          } else {
            this.setState({
              onCreateAccountSuccess: true,
              loading: false,
            });
          }
        }, () => {
          this.setState({
            onCreateAccountSuccess: true,
            loading: false,
          });
        });
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
    const { fetch } = this.props;
    const params = new URLSearchParams();
    params.append('email', this.state.email);

    fetch(`/user/email?${params.toString()}`).then(({ response }) => {
      this.setState({ emailAvailable: response.status === 404 });
    }, () => {
      this.setState({ emailAvailable: null });
    });
  }, 200);

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

    if (this.state.onCreateAccountSuccess) {
      content = (
        <div styleName='vertical-content'>
          <MessageBlock>
            {T('Your account has been created')}
          </MessageBlock>
          <Anchor to={routes.login(this.state.email)} button={true}>
            {T('Login')}
          </Anchor>
        </div>
      );
    } else if (userId === null) {
      let invalidCredentialsWarning = null;
      let unableToCreateAccount = null;
      let accountNotAvailable = null;
      let passwordLengthError = null;
      let commonPasswordError = null;

      if (this.state.displayCommonPasswordError) {
        commonPasswordError = (
          <MessageBlock>
            {T('Your password is too common, please choose another password')}
          </MessageBlock>
        );
      }

      if (this.state.displayPasswordLengthError) {
        passwordLengthError = (
          <MessageBlock>
            {T('Your password must be at least 8 characters')}
          </MessageBlock>
        );
      }

      if (this.state.displayAccountNotAvailable) {
        accountNotAvailable = (
          <MessageBlock>
            {T('Sorry, this email is not available')}
          </MessageBlock>
        );
      }

      if (this.state.displayUnableToCreateAccount) {
        unableToCreateAccount = (
          <MessageBlock>
            {T('Sorry, we are not able to create your account. Please try again')}
          </MessageBlock>
        );
      }

      if (this.state.displayInvalidCredentials) {
        invalidCredentialsWarning = (
          <MessageBlock>
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
        <form styleName='vertical-content' onSubmit={this.onSubmit}>
          {accountNotAvailable}
          {invalidCredentialsWarning}
          {unableToCreateAccount}
          {passwordLengthError}
          {commonPasswordError}
          <div styleName='email-row'>
            <Input
              onChange={this.onEmailChange}
              value={this.state.email}
              placeholder={T('Email')}
              type='email'
              styleName='email-input'
              autoComplete='email'
              required={true}
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
            required={true}
          />
          <Input
            onChange={this.onPasswordConfirmChange}
            value={this.state.passwordConfirm}
            placeholder={T('Password Confirm')}
            type='password'
            error={this.state.displayPasswordsDoNoMatch}
            autoComplete='new-password'
            minLength={USER_SCHEMA.password.minLength}
            required={true}
          />
        <Button loading={this.state.loading}>
            {T('Create Account')}
          </Button>
          <Anchor to={routes.login()}>
            {T('Already have an account?')}
          </Anchor>
        </form>
      );
    } else {
      content = (
        <div styleName='vertical-content'>
          <Anchor to={routes.transactions()} button={true}>
            {T('Go to my transactions')}
          </Anchor>
          <Anchor to={routes.organization()} button={true}>
            {T('Go to my organizations')}
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
