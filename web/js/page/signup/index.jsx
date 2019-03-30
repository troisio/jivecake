import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

import { isValidEmail, onErrorOrUndefined } from 'js/helper';

import { USER_SCHEMA } from 'common/schema';
import { T } from 'common/i18n';
import { getNavigatorLanguage } from 'common/helpers';
import { routes } from 'js/routes';
import { MessageBlock } from 'component/message-block';
import { ApplicationContext, FetchDispatchContext, FetchStateContext } from 'js/context';
import { Button } from 'component/button';
import { Anchor } from 'component/anchor';
import { Input } from 'component/input';
import './style.scss';

import {
  SEARCH_EMAIL,
  CREATE_ACCOUNT,
  TOKEN_FROM_PASSWORD
} from 'js/reducer/useFetch';

function Component() {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordConfirm, setPasswordConfirm ] = useState('');
  const [ commonPasswordError, setCommonPasswordError ] = useState(false);
  const [ passwordLengthError, setPasswordLengthError ] = useState(false);
  const [ passwordsDoNoMatch, setPasswordsDoNoMatch ] = useState(false);
  const { userId } = useContext(ApplicationContext);
  const fetchDispatch = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);

  const emailFetchState = fetchState[SEARCH_EMAIL];
  const createAccountState = fetchState[CREATE_ACCOUNT];
  const fetchingEmail = onErrorOrUndefined(() => emailFetchState.state) === 'FETCHING';
  const isCreatingAccount = onErrorOrUndefined(() => createAccountState.state === 'FETCHING', false);
  const emailIsAvailable = onErrorOrUndefined(() => emailFetchState.response.status === 404, false);
  const didFailToCreateAccount = onErrorOrUndefined(() => !createAccountState.response.ok, false) ||
    onErrorOrUndefined(() => createAccountState.state.hasOwnProperty('error'), false);

  useEffect(() => {
    if (createAccountState && createAccountState.body) {
      fetchDispatch('/token/password', {
        method: 'POST',
        body: {
          email: createAccountState.originalBody.email,
          password: createAccountState.originalBody.password
        }
      }, TOKEN_FROM_PASSWORD);
    }
  }, [ createAccountState ]);

  useEffect(() => {
    if (isValidEmail(email)) {
      const params = new URLSearchParams();
      params.append('email', email);
      fetchDispatch(`/user/email?${params.toString()}`, {}, SEARCH_EMAIL);
    }
  }, [email]);

  function onSubmit(e) {
    e.preventDefault();

    if (onErrorOrUndefined(() => createAccountState.state) === 'FETCHING' || !emailIsAvailable) {
      return;
    }

    const displayPasswordsDoNoMatch = password !== passwordConfirm;
    const displayPasswordLengthError = password.length < USER_SCHEMA.password.minLength ||
      passwordConfirm.length < USER_SCHEMA.password.minLength;
    const displayCommonPasswordError = USER_SCHEMA.password.not.enum.includes(password);

    setCommonPasswordError(displayCommonPasswordError);
    setPasswordsDoNoMatch(displayPasswordsDoNoMatch);
    setPasswordLengthError(displayPasswordLengthError);
    setCommonPasswordError(displayCommonPasswordError);

    const hasError = displayCommonPasswordError || displayPasswordLengthError || displayPasswordsDoNoMatch;

    if (hasError) {
      return;
    }

    fetchDispatch(
      '/account',
      {
        method: 'POST',
        body: {
          email,
          password: password,
          lastLanguage: getNavigatorLanguage(window.navigator)
        },
      },
      CREATE_ACCOUNT
    );
  }

  let content;

  if (userId === null) {
    const errorMessages = [];

    if (commonPasswordError) {
      errorMessages.push(T('Your password is too common, please choose another password'));
    }

    if (passwordLengthError) {
      errorMessages.push(T('Your password must be at least 8 characters'));
    }

    if (didFailToCreateAccount) {
      errorMessages.push(T('Unable to create your account. Please try again'));
    }

    let iconStyleName = 'check-circle';

    if (email.length > 0 && !fetchingEmail) {
      if (isValidEmail(email) && emailIsAvailable) {
        iconStyleName = 'check-circle success';
      } else {
        iconStyleName = 'check-circle error';
      }
    }

    content = (
      <form styleName='vertical-content' onSubmit={onSubmit}>
        <div styleName='email-row'>
          <Input
            onChange={e => setEmail(e.target.value)}
            value={email}
            placeholder={T('Email')}
            type='email'
            styleName='email-input'
            autoComplete='email'
            required={true}
          />
          <div styleName='check-icon-container'>
            <FontAwesomeIcon styleName={iconStyleName} icon={fetchingEmail ? faSyncAlt : faCheckCircle} />
          </div>
        </div>
        <Input
          onChange={e => setPassword(e.target.value)}
          value={password}
          placeholder={T('Password')}
          type='password'
          error={passwordsDoNoMatch}
          autoComplete='new-password'
          minLength={USER_SCHEMA.password.minLength}
          required={true}
        />
        <Input
          onChange={e => setPasswordConfirm(e.target.value)}
          value={passwordConfirm}
          placeholder={T('Password Confirm')}
          type='password'
          error={passwordsDoNoMatch}
          autoComplete='new-password'
          minLength={USER_SCHEMA.password.minLength}
          required={true}
        />
      <Button loading={isCreatingAccount}>
          {T('Create Account')}
        </Button>
        <Anchor to={routes.login()}>
          {T('Already have an account?')}
        </Anchor>
        {
          errorMessages.map(message => (
            <MessageBlock key={message}>
              {message}
            </MessageBlock>
          ))
        }
      </form>
    );
  } else {
    content = (
      <div styleName='vertical-content'>
        <div>
          {T('You already have an account')}
        </div>
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

export const Signup = withRouter(Component);
