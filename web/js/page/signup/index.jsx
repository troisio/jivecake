import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { useFetch } from 'js/reducer/useFetch';

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

import { AFTER, REQUEST } from 'js/reducer/useFetch';

const FETCH_EMAIL = '/user/email';
const CREATE_ACCOUNT = '/user/email';

function Component() {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordConfirm, setPasswordConfirm ] = useState('');
  const [ commonPasswordError, setCommonPasswordError ] = useState(false);
  const [ passwordLengthError, setPasswordLengthError ] = useState(false);
  const [ passwordsDoNoMatch, setPasswordsDoNoMatch ] = useState(false);
  const { userId } = useContext(ApplicationContext);
  const [ fetchEmailState, fetchEmail ] = useFetch(FETCH_EMAIL);
  const [ fetchCreateAccountState, fetchCreateAccount ] = useFetch(CREATE_ACCOUNT);

  useEffect(() => {
    if (email.length > 0) {
      const params = new URLSearchParams();
      params.append('email', email);
      fetchEmail(`/user/email?${params.toString()}`);
    }
  }, [email]);

  function onSubmit(e) {
    e.preventDefault();
    const requestDone = fetchCreateAccountState === null || fetchCreateAccountState.type === AFTER;

    if (!requestDone) {
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

    fetchCreateAccount('/account', {
      method: 'POST',
      body: {
        email: email,
        password: password,
        lastLanguage: getNavigatorLanguage(window.navigator)
      }
    });
  }

  /*
  fetch('/token/password', {
    method: 'POST',
    body: {
      email: state.email,
      password: state.password
    }
  })
  */

  let content;

  const didSucceed = fetchCreateAccountState !== null &&
    fetchCreateAccountState.type === AFTER &&
    fetchCreateAccountState.response.status < 400;

  if (didSucceed) {
    content = (
      <div styleName='vertical-content'>
        <MessageBlock>
          {T('Your account has been created')}
        </MessageBlock>
        <Anchor to={routes.login(email)} button={true}>
          {T('Login')}
        </Anchor>
      </div>
    );
  } else if (userId === null) {
    const errorMessages = [];

    if (commonPasswordError) {
      errorMessages.push(T('Your password is too common, please choose another password'));
    }

    if (passwordLengthError) {
      errorMessages.push(T('Your password must be at least 8 characters'));
    }

    if (fetchCreateAccountState !== null) {
      if ( fetchCreateAccountState.type === AFTER && fetchCreateAccountState.response.status >= 400) {
        errorMessages.push(T('Sorry, we are not able to create your account. Please try again'));
      }

      if (fetchCreateAccountState.type === AFTER && fetchCreateAccountState.response.status === 400) {
        errorMessages.push(T('Sorry, invalid credentials'));
      }
    }

    let iconStyleName;

    if (email.length === 0) {
      iconStyleName = 'check-circle';
    } else if (fetchEmailState === null) {
      iconStyleName = 'check-circle';
    } else if (fetchEmailState.type === REQUEST) {
      iconStyleName = 'check-circle';
    } else if (fetchEmailState.type === AFTER && fetchEmailState.response.status === 200) {
      iconStyleName = 'check-circle success';
    } else {
      iconStyleName = 'check-circle error';
    }

    content = (
      <form styleName='vertical-content' onSubmit={onSubmit}>
        {
          errorMessages.map(message => (
            <MessageBlock key={message}>
              {message}
            </MessageBlock>
          ))
        }
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
            <FontAwesomeIcon styleName={iconStyleName} icon={faCheckCircle} />
          </div>
        </div>
        <Input
          onChange={e => setPassword(e.targer.value)}
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

export const Signup = withRouter(Component);
