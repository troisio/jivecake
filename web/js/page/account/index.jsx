import React, { useEffect, useContext } from 'react';
import _ from 'lodash';

import { T } from 'common/i18n';

import { Anchor  } from 'component/anchor';
import { DefaultLayout } from 'component/default-layout';
import { NaturalSpinner } from 'component/natural-spinner';

import './style.scss';

import { safe } from 'js/helper';
import { ApplicationContext, FetchDispatchContext, FetchStateContext, OrganizationContext } from 'js/context';
import {
  GET_USER_ORGANIZATIONS,
  UPDATE_USER
} from 'js/reducer/useFetch';
import { routes } from 'js/routes';

export function Account() {
  const { userId } = useContext(ApplicationContext);
  const fetchState = useContext(FetchStateContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const organizationsMap = useContext(OrganizationContext);
  const getUserOrganizationsState = fetchState[GET_USER_ORGANIZATIONS];
  const loadingUserOrganization = safe(() => getUserOrganizationsState.loading);
  const organizations = _.values(organizationsMap);
  const organizationLoader = loadingUserOrganization ? <NaturalSpinner /> : null;
  const onOrganizationChange = (e) => {
    dispatchFetch(
      `/user/${userId}`,
      { body: { lastOrganizationId: e.target.value },
      method: 'POST'
    }, UPDATE_USER);
  };
  let organizationSelect;

  useEffect(() => {
    dispatchFetch(
      `/user/${userId}/organization?page=0`,
      {
        query: {
          page: 0
        }
      },
      GET_USER_ORGANIZATIONS
    );

    return () => {
      dispatchFetchDelete([GET_USER_ORGANIZATIONS, UPDATE_USER]);
    };
  }, []);

  if (organizations.length > 0) {
    organizationSelect = (
      <>
        <span>
          {T('Change organization')}
        </span>
        <select onChange={onOrganizationChange}>
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
    <DefaultLayout styleName='root'>
      <span>
        {T('My Account')}
      </span>
      {organizationSelect}
      {organizationLoader}
      <div>
        <Anchor to={routes.organizationPersist()}>
          {T('Create an organization')}
        </Anchor>
      </div>
    </DefaultLayout>
  );
}
