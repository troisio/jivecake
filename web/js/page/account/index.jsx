import React, { useEffect, useContext, useState } from 'react';
import _ from 'lodash';

import { T } from 'common/i18n';

import { Input  } from 'component/input';
import { Button  } from 'component/button';
import { MessageBlock } from 'component/message-block';
import { EmailSearchIcon } from 'component/email-search-icon';

import './style.scss';

import { safe, isValidEmail } from 'js/helper';
import {
  ApplicationContext,
  SetApplicationStateContext,
  FetchDispatchContext,
  FetchStateContext,
  OrganizationContext,
  UserContext
} from 'js/context';
import {
  GET_USER_ORGANIZATIONS,
  UPDATE_USER,
  SEARCH_EMAIL,
  GET_USER
} from 'js/reducer/useFetch';

export function Account() {
  const applicationState = useContext(ApplicationContext);
  const setApplicationState = useContext(SetApplicationStateContext);
  const fetchState = useContext(FetchStateContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const organizationsMap = useContext(OrganizationContext);
  const usersMap = useContext(UserContext);

  const emailFetchState = fetchState[SEARCH_EMAIL];
  const updateUserState = fetchState[UPDATE_USER];

  const emailIsTaken = safe(() => emailFetchState.response.status === 200, false);
  const organizations = _.values(organizationsMap).sort((first, second) => first.name.localeCompare(second.name));
  const user = usersMap[applicationState.userId];

  const [ email, setEmail ] = useState(user.email);
  const [ organizationId, setOrganizationId ] = useState();

  const onSubmit = (e) => {
    e.preventDefault();

    if (safe(() => updateUserState.fetching) || emailIsTaken || !isValidEmail(email)) {
      return;
    }

    const body = { email };

    dispatchFetch(
      ['user/:userId', applicationState.userId],
      {
        method: 'POST',
        body,
      },
      UPDATE_USER
    );
  };

  let organizationSelect;
  let emailTakenMessage;

  if (email !== user.email && emailIsTaken) {
    emailTakenMessage = (
      <MessageBlock>
        {T('Sorry, that email already is taken.')}
      </MessageBlock>
    );
  }

  useEffect(() => {
    dispatchFetch(
      ['user/:userId/organization', applicationState.userId],
      {
        query: {
          page: 0
        }
      },
      GET_USER_ORGANIZATIONS
    );

    return () => {
      dispatchFetchDelete([GET_USER_ORGANIZATIONS, UPDATE_USER, SEARCH_EMAIL, GET_USER]);
    };
  }, []);

  useEffect(() => {
    if (!safe(() => updateUserState.response.ok)) {
      return;
    }

    dispatchFetch(
      ['user/:userId', applicationState.userId],
      {},
      GET_USER
    );

    if (applicationState.organizationId !== organizationId) {
      setApplicationState({ ...applicationState, organizationId });
    }
  }, [ updateUserState, applicationState ]);

  useEffect(() => {
    if (isValidEmail(email) && email !== user.email) {
      dispatchFetch('user/email', { query: { email } }, SEARCH_EMAIL);
    }
  }, [email]);

  if (organizations.length > 0) {
    organizationSelect = (
      <>
        <label styleName='label' htmlFor='account-change-organization'>
          {T('Current organization')}
        </label>
        <select onBlur={e => setOrganizationId(e.target.value)} id='account-change-organization'>
          {
            organizations.map(organization => {
              return (
                <option value={organization._id} key={organization._id}>
                  {organization.name}
                </option>
              );
            })
          }
        </select>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} styleName='root'>
      <span styleName='page-title'>
        {T('My Account')}
      </span>
      <div styleName='email-update'>
        <label htmlFor='account-email' styleName='label'>
          {T('Email')}
        </label>
        <div styleName='email-row'>
          <Input id='account-email' value={email} onChange={e => setEmail(e.target.value) } />
          <div styleName='check-icon-container'>
            <EmailSearchIcon />
          </div>
          {emailTakenMessage}
        </div>
      </div>
      {organizationSelect}
      <Button loading={safe(() => updateUserState.fetching)}>
        {T('Save')}
      </Button>
    </form>
  );
}
