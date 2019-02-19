import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link }from 'react-router-dom';

import { ApplicationContext } from 'js/context';
import { T } from 'common/i18n';
import { routes } from 'js/routes';
import { MessageBlock } from 'component/message-block';
import { Anchor } from 'component/anchor';
import { Button } from 'component/button';
import { Input } from 'component/input';
import './style.scss';

class Component extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    userId: PropTypes.string
  };

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

    const { fetch } = this.props;
    const { loading } = this.state;

    if (loading) {
      return;
    }

    this.setState({
      loading: true,
      displayUnableToValidate: false,
      displayInvalidCredentials: false
    });

    fetch('/token/password', {
      method: 'POST',
      body: {
        email: this.state.email,
        password: this.state.password
      }
    }).then(({ response }) => {
      if (!response.ok) {
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
    });
  };

  onPasswordChange = (e) => {
    this.setState({ password: e.target.value });
  };

  onEmailChange = (e) => {
    this.setState({ email: e.target.value });
  };

  render() {
    let invalidCredentialsWarning = null;
    let unableToValidateMessage = null;

    let content;

    if (this.props.hasOwnProperty('userId')) {
      content = (
        <div styleName='vertical-content'>
          <MessageBlock>
            {T('You are already logged in')}
          </MessageBlock>
          <Link to={routes.myTransactions(this.props.userId)}>
            {T('Go to my transactions')}
          </Link>
        </div>
      );
    } else {
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
          <Anchor to={routes.forgotPassword()}>
            {T('Forgot your password?')}
          </Anchor>
          <Anchor to={routes.signup()}>
            {T('Create an account')}
          </Anchor>
        </form>
      );
    }

    return (
      <div styleName='root'>
        {content}
      </div>
    );
  }
}

const ComponentWithRouter = withRouter(Component);
export const Login = () => (
  <ApplicationContext.Consumer>
    {
      ({ fetch }) => <ComponentWithRouter fetch={fetch} />
    }
  </ApplicationContext.Consumer>
);
