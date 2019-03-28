import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
    const DISPATCH_ID = 'SEARCH_USER_EMAIL';
    const isRequsting = fetchState.CALL[DISPATCH_ID];

    if (email.length > 0 && !isRequsting) {
      const params = new URLSearchParams();
      params.append('email', email);
      fetchDispatch(`/user/email?${params.toString()}`, {}, DISPATCH_ID);
    }
  }, [email]);

  function onSubmit(e) {
    e.preventDefault();
    const requestDone = true;

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

    fetchDispatch('/account', {
      method: 'POST',
      body: {
        email: email,
        password: password,
        lastLanguage: getNavigatorLanguage(window.navigator)
      }
    });
  }

  let content;

  const didSucceed = false;

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

    const iconStyleName = 'check-circle';

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
