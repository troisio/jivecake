import React from 'react';
import PropTypes from 'prop-types';
import { Link }from 'react-router-dom';

import { ApplicationContext } from 'js/context';
import { Routes } from 'common/routes';
import { T } from 'common/i18n';

import { MessageBlock } from 'component/message-block';
import { Button } from 'component/button';
import { Input } from 'component/input';
import './style.scss';

export class Login extends React.Component {
  static contextType = ApplicationContext;
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    const params = new URLSearchParams(props.location.search);
    const email = params.has('email') ? params.get('email') : '';

    this.state = {
      displayInvalidCredentials: false,
      displayUnableToValidate: false,
      loading: false,
      email,
      password: ''
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
    const { loading } = this.state;

    if (loading) {
      return;
    }

    this.setState({
      loading: true,
      displayUnableToValidate: false,
      displayInvalidCredentials: false
    });

    this.props.fetch('/token/password', {
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
          loading: false,
          displayInvalidCredentials: true
        });
      }
    }, () => {
      this.setState({
        loading: false,
        displayUnableToValidate: true
      });
    })
  }

  onPasswordChange = (e) => {
    this.setState({ password: e.target.value });
  }

  onEmailChange = (e) => {
    this.setState({ email: e.target.value });
  }

  render() {
    const routes = new Routes();
    const { userId } = this.context;
    let invalidCredentialsWarning = null;
    let unableToValidateMessage = null;

    let content;

    if (userId === null) {
      if (this.state.displayInvalidCredentials) {
        invalidCredentialsWarning = (
          <MessageBlock>
            {T('Sorry, invalid email or password')}
          </MessageBlock>
        );
      }

      if (this.state.displayUnableToValidate) {
        unableToValidateMessage = (
          <MessageBlock>
            {T('Sorry, we were not able to log you in, please try again')}
          </MessageBlock>
        );
      }

      content = (
        <form onSubmit={this.onSubmit} styleName='vertical-content'>
          {invalidCredentialsWarning}
          {unableToValidateMessage}
          <Input
            value={this.state.email}
            onChange={this.onEmailChange}
            placeholder={T('Email')}
            type='email'
            required={true}
            autoComplete='email'
          />
          <Input
            onChange={this.onPasswordChange}
            placeholder={T('Password')}
            type='password'
            autoComplete='current-password'
            required={true}
          />
          <Button loading={this.state.loading}>
            {T('Log In')}
          </Button>
          <Link to={routes.forgotPassword()}>
            {T('Forgot your password?')}
          </Link>
          <Link to={routes.signup()}>
            {T('Create an account')}
          </Link>
        </form>
      );
    } else {
      content = (
        <div styleName='vertical-content'>
          <MessageBlock>
            {T('You are already logged in')}
          </MessageBlock>
          <Link to={routes.myTransactions(userId)}>
            {T('Go to my transactions')}
          </Link>
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
