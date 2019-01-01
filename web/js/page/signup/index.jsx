import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'lodash';
import URLSearchParams from 'url-search-params';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import * as Sentry from '@sentry/browser';

import { USER_SCHEMA } from 'common/schema';
import { T } from 'common/i18n';
import { getNavigatorLanguage } from 'common/helpers';
import { routes } from 'js/routes';
import { MessageBlock } from 'component/message-block';
import { ApplicationContext } from 'js/context';
import { Button } from 'component/button';
import { Anchor } from 'component/anchor';
import { Input } from 'component/input';
import './style.scss';

class Component extends React.PureComponent {
  static propTypes = {
    fetch: PropTypes.func.isRequired,
    userId: PropTypes.string
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

    if (this.state.loading) {
      return;
    }

    const { fetch } = this.props;
    const displayPasswordsDoNoMatch = this.state.password !== this.state.passwordConfirm;
    const displayPasswordLengthError = this.state.password.length < USER_SCHEMA.password.minLength ||
      this.state.passwordConfirm.length < USER_SCHEMA.password.minLength;
    const displayCommonPasswordError = USER_SCHEMA.password.not.enum.includes(this.state.password);
    const nextState = {
      loading: true,
      displayUnableToCreateAccount: false,
      displayPasswordsDoNoMatch,
      displayPasswordLengthError,
      displayCommonPasswordError
    };

    const hasError = displayCommonPasswordError || displayPasswordLengthError || displayPasswordsDoNoMatch;
    nextState.loading = !hasError;

    this.setState(nextState);

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
        }).then(({ response }) => {
          if (!response.ok) {
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
      Sentry.captureMessage('Unable to create account');
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
    const { userId } = this.props;
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
      const errorMessages = [];

      if (this.state.displayCommonPasswordError) {
        errorMessages.push(T('Your password is too common, please choose another password'));
      }

      if (this.state.displayPasswordLengthError) {
        errorMessages.push(T('Your password must be at least 8 characters'));
      }

      if (this.state.displayAccountNotAvailable) {
        errorMessages.push(T('Sorry, this email is not available'));
      }

      if (this.state.displayUnableToCreateAccount) {
        errorMessages.push(T('Sorry, we are not able to create your account. Please try again'));
      }

      if (this.state.displayInvalidCredentials) {
        errorMessages.push(T('Sorry, invalid credentials'));
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
          {
            errorMessages.map(message => (
              <MessageBlock key={message}>
                {message}
              </MessageBlock>
            ))
          }
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
            {T('My transactions')}
          </Anchor>
          <Anchor to={routes.organization()} button={true}>
            {T('My organizations')}
          </Anchor>
          <Anchor to={routes.event()} button={true}>
            {T('My events')}
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

const SignupWithRouter = withRouter(Component);

export const Signup = () => (
  <ApplicationContext.Consumer>
    { value =>
      <SignupWithRouter userId={value.userId} fetch={value.fetch} />
    }
  </ApplicationContext.Consumer>
);
