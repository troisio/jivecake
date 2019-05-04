import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { T } from 'common/i18n';
import {
  MAXIMUM_IMAGE_UPLOAD_BYTES,
  ORGANIZATION_SCHEMA
} from 'common/schema';

import { FetchDispatchContext, FetchStateContext } from 'js/context';
import {
  CREATE_ORGANIZATION,
  UPDATE_ORGANIZATION,
  UPDATE_ORGANIZATION_AVATAR
} from 'js/reducer/useFetch';
import { routes } from 'js/routes';

import { DefaultLayout } from 'component/default-layout';
import { safe } from 'js/helper';
import { MessageBlock } from 'component/message-block';
import { Input } from 'component/input';
import { Button } from 'component/button';
import { AvatarImageUpload } from 'component/avatar-image-upload';
import './style.scss';

export function OrganizationPersistComponent({ organization, history }) {
  const submitText = organization ? T('Update') : T('Create');
  const [ name, setName ] = useState(safe(() => organization.name, ''));
  const [ email, setEmail ] = useState(safe(() => organization.email, ''));
  const [ avatar, setAvatar ] = useState(safe(() => organization.avatar, null));
  const avatarUploadProps = avatar === null ? {} : { src: avatar };
  const [ file, setFile ] = useState(null);
  const [ avatarTooLarge, setAvatarTooLarge ] = useState(false);
  const fetchState = useContext(FetchStateContext);
  const createOrganizationState = fetchState[CREATE_ORGANIZATION];
  const updateOrganizationAvatarState = fetchState[UPDATE_ORGANIZATION_AVATAR];
  const displayUnableToPersistAvatarError = safe(() => !updateOrganizationAvatarState.response.ok, false);
  const displayUnableToPersistError = safe(() => !createOrganizationState.response.ok, false);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const loading = safe(() => createOrganizationState.fetching) ||
    safe(() => updateOrganizationAvatarState.fetching);

  useEffect(() => {
    return () => {
      dispatchFetchDelete([CREATE_ORGANIZATION, UPDATE_ORGANIZATION_AVATAR]);
    };
  }, []);

  useEffect(() => {
    const newId = safe(() => createOrganizationState.body._id);

    if (newId) {
      if (file) {
        dispatchFetch(`/organization/${newId}/avatar`, {
          method: 'POST',
          body: file,
        }, UPDATE_ORGANIZATION_AVATAR);
      }

      history.push(routes.account());
    }
  }, [ createOrganizationState, file ]);

  function onSubmit(e) {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (organization) {
      dispatchFetch(`/organization/${organization.id}`, {
        method: 'POST',
        body: {
          name,
          email
        },
      }, UPDATE_ORGANIZATION);

      if (file) {
        dispatchFetch(`/organization/${organization._id}/avatar`, {
          method: 'POST',
          body: file,
        }, UPDATE_ORGANIZATION_AVATAR);
      }
    } else {
      dispatchFetch('/organization', {
        method: 'POST',
        body: {
          name,
          email
        },
      }, CREATE_ORGANIZATION);
    }
  }

  function onFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setFile(file);
      setAvatarTooLarge(file.size > MAXIMUM_IMAGE_UPLOAD_BYTES);
    };
    reader.readAsDataURL(file);
  }

  let unableToPersistError = null;
  let unableToPersistAvatarError = null;
  let avatarTooLargeError = null;

  if (avatarTooLarge) {
    avatarTooLargeError = (
      <MessageBlock>
        {T('Sorry, your image is too large, please try a smaller image')}
      </MessageBlock>
    );
  }

  if (displayUnableToPersistAvatarError) {
    unableToPersistAvatarError = (
      <MessageBlock>
        {T('Sorry, we are not able to update your avatar, please try another image')}
      </MessageBlock>
    );
  }

  if (displayUnableToPersistError) {
    unableToPersistError = (
      <MessageBlock>
        {T('Sorry, we are not able save your data, please try again')}
      </MessageBlock>
    );
  }

  return (
    <DefaultLayout>
      <form onSubmit={onSubmit} styleName='root'>
        {unableToPersistAvatarError}
        {unableToPersistError}
        {avatarTooLargeError}
        <AvatarImageUpload disabled={loading} styleName='avatar-image-upload' onFile={onFile} { ...avatarUploadProps } />
        <Input
          placeholder={T('Organization Name')}
          onChange={e => setName(e.target.value)}
          value={name}
          required
          maxLength={ORGANIZATION_SCHEMA.name.maxLength}
        />
        <div styleName='email-section'>
          <Input
            placeholder={T('Email')}
            type='email'
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            maxLength={ORGANIZATION_SCHEMA.email.maxLength}
          />
          <div styleName='email-note'>
            {T('This email will be used so your customers can contact you.')}
            &nbsp;
            {T('We will also use this email to send you organization specific communication.')}
          </div>
        </div>
        <Button loading={loading}>
          {submitText}
        </Button>
      </form>
    </DefaultLayout>
  );
}

OrganizationPersistComponent.propTypes = {
  history: PropTypes.object,
  organization: PropTypes.object
};

export const OrganizationPersist = withRouter(OrganizationPersistComponent);
