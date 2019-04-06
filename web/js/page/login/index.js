import React, { useState, useContext } from 'react';
import { Link }from 'react-router-dom';

import { safe } from 'js/helper';

import {
  ApplicationContext,
  FetchDispatchContext,
  FetchStateContext
} from 'js/context';

import { T } from 'common/i18n';
import { routes } from 'js/routes';
import { MessageBlock } from 'component/message-block';
import { Anchor } from 'component/anchor';
import { Button } from 'component/button';
import { Input } from 'component/input';
import { DefaultLayout } from 'component/default-layout';
import './style.scss';

import { TOKEN_FROM_PASSWORD } from 'js/reducer/useFetch';

export function Login() {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const { userId } = useContext(ApplicationContext);
  const [ fetchDispatch ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);
  const tokenFromPasswordState = fetchState[TOKEN_FROM_PASSWORD];

  function onSubmit(e) {
    e.preventDefault();

    if (safe(() => tokenFromPasswordState.fetching)) {
      return;
    }

    fetchDispatch('/token/password', {
      method: 'POST',
      body: {
        email: email,
        password: password
      }
    }, TOKEN_FROM_PASSWORD);
  }

  function onPasswordChange(e) {
    setPassword(e.target.value);
  }

  function onEmailChange(e) {
    setEmail(e.target.value);
  }

  let content;

  if (userId === null) {
    let invalidCredentialsWarning, unableToValidateMessage;

    if (safe(() => tokenFromPasswordState.response.status === 400)) {
      invalidCredentialsWarning = (
        <MessageBlock>
          {T('Sorry, invalid email or password')}
        </MessageBlock>
      );
    }

    if (safe(() => tokenFromPasswordState.response.status >= 400)) {
      unableToValidateMessage = (
        <MessageBlock>
          {T('Sorry, we were not able to log you in, please try again')}
        </MessageBlock>
      );
    }

    content = (
      <form onSubmit={onSubmit} styleName='vertical-content'>
        {invalidCredentialsWarning}
        {unableToValidateMessage}
        <Input
          value={email}
          onChange={onEmailChange}
          placeholder={T('Email')}
          type='email'
          required
          autoComplete='email'
        />
        <Input
          onChange={onPasswordChange}
          placeholder={T('Password')}
          type='password'
          autoComplete='current-password'
          required
          value={password}
        />
        <Button loading={safe(() => tokenFromPasswordState.response.status >= 400)}>
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
    <DefaultLayout>
      {content}
    </DefaultLayout>
  );
}
