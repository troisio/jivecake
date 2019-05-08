import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { isValidEmail, safe } from 'js/helper';

import { USER_SCHEMA } from 'common/schema';
import { T } from 'common/i18n';
import { getNavigatorLanguage } from 'common/helpers';
import { routes } from 'js/routes';
import { MessageBlock } from 'component/message-block';
import { EmailSearchIcon } from 'component/email-search-icon';
import { DefaultLayout } from 'component/default-layout';
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

export function SignupComponent({ history }) {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordConfirm, setPasswordConfirm ] = useState('');
  const [ commonPasswordError, setCommonPasswordError ] = useState(false);
  const [ passwordLengthError, setPasswordLengthError ] = useState(false);
  const [ passwordsDoNoMatch, setPasswordsDoNoMatch ] = useState(false);
  const emailEqualsPassword = email !== '' && email.toLocaleLowerCase() === password.toLocaleLowerCase();
  const { userId } = useContext(ApplicationContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);
  const emailFetchState = fetchState[SEARCH_EMAIL];
  const createAccountState = fetchState[CREATE_ACCOUNT];
  const isCreatingAccount = safe(() => createAccountState.fetching, false);
  const emailIsAvailable = safe(() => emailFetchState.response.status === 404, false);
  const emailIsTaken = safe(() => emailFetchState.response.status === 200, false);
  const didFailToCreateAccount = safe(() => !createAccountState.response.ok, false) ||
    safe(() => createAccountState.state.hasOwnProperty('error'), false);
  const errorMessages = [];
  const onSubmit = e => {
    e.preventDefault();

    if (safe(() => createAccountState.fetching) || !emailIsAvailable || emailEqualsPassword) {
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

    dispatchFetch(
      'account',
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
  };
  let emailTakenMessage;

  useEffect(() => {
    return () => {
      dispatchFetchDelete([TOKEN_FROM_PASSWORD, CREATE_ACCOUNT, SEARCH_EMAIL]);
    };
  }, []);

  useEffect(() => {
    if (userId !== null) {
      history.push(routes.home());
    }
  }, [ userId ]);

  useEffect(() => {
    if (safe(() => createAccountState.response.ok)) {
      dispatchFetch('token/password', {
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
      dispatchFetch('user/email', { query: { email } }, SEARCH_EMAIL);
    }
  }, [email]);

  if (commonPasswordError) {
    errorMessages.push(T('Your password is too common, please choose another password'));
  }

  if (passwordLengthError) {
    errorMessages.push(T('Your password must be at least 8 characters'));
  }

  if (didFailToCreateAccount) {
    errorMessages.push(T('Unable to create your account. Please try again'));
  }

  if (emailEqualsPassword) {
    errorMessages.push(T('Your email and password must be different'));
  }

  if (emailIsTaken) {
    emailTakenMessage = (
      <MessageBlock key='email-taken'>
        {T('Sorry, that email already is taken')}
      </MessageBlock>
    );
  }

  return (
    <DefaultLayout>
      <form styleName='vertical-content' onSubmit={onSubmit}>
        <div styleName='email-row'>
          <Input
            onChange={e => setEmail(e.target.value)}
            value={email}
            placeholder={T('Email')}
            type='email'
            autoComplete='email'
            required
          />
          <div styleName='check-icon-container'>
            <EmailSearchIcon />
          </div>
          {emailTakenMessage}
        </div>
        <Input
          onChange={e => setPassword(e.target.value)}
          value={password}
          placeholder={T('Password')}
          type='password'
          error={passwordsDoNoMatch}
          autoComplete='new-password'
          minLength={USER_SCHEMA.password.minLength}
          required
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
    </DefaultLayout>
  );
}

SignupComponent.propTypes = {
  history: PropTypes.object.isRequired
};

export const Signup = withRouter(SignupComponent);
