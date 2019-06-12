import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Compressor from 'compressorjs';

import { T } from 'common/i18n';
import {
  MAXIMUM_IMAGE_UPLOAD_BYTES,
  ORGANIZATION_SCHEMA
} from 'common/schema';
import {
  ORGANIZATIONS_PATH,
  ORGANIZATION_AVATAR_PATH,
  ORGANIZATION_PATH
} from 'common/routes';

import { FetchDispatchContext, FetchStateContext, OrganizationContext } from 'js/context';
import {
  CREATE_ORGANIZATION,
  UPDATE_ORGANIZATION,
  UPDATE_ORGANIZATION_AVATAR,
  GET_ORGANIZATION
} from 'js/reducer/useFetch';
import {
  getOrganization
} from 'js/reducer/useOrganizations';

import { routes } from 'js/routes';

import { safe } from 'js/helper';
import { MessageBlock } from 'component/message-block';
import { OrganizationEmailNotice } from 'component/organization-email-notice';
import { Input } from 'component/input';
import { Button } from 'component/button';
import { AvatarImageUpload } from 'component/avatar-image-upload';
import './style.scss';

export function OrganizationPersistComponent({ history, match: { params: { organizationId } } }) {
  const organizationMap = useContext(OrganizationContext);
  const fetchState = useContext(FetchStateContext);

  const createOrganizationState = fetchState[CREATE_ORGANIZATION];
  const updateOrganizationState = fetchState[UPDATE_ORGANIZATION];
  const updateOrganizationAvatarState = fetchState[UPDATE_ORGANIZATION_AVATAR];

  const organization = organizationMap[organizationId];

  const [ avatarLoading, setAvatarLoading ] = useState(false);
  const [ blob, setBlob ] = useState(null);
  const [ name, setName ] = useState(safe(() => organization.name, ''));
  const [ email, setEmail ] = useState(safe(() => organization.email, ''));
  const [ avatar, setAvatar ] = useState(safe(() => organization.avatar, null));
  const [ unableToCompressFile , setUnableToCompressFile ] = useState(false);

  const avatarUploadProps = avatar === null ? {} : { src: avatar };
  const submitText = organizationId ? T('Update') : T('Create');
  const displayUnableToPersistError = safe(() => !createOrganizationState.response.ok, false) ||
    safe(() => !updateOrganizationAvatarState.response.ok, false);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const loading = safe(() => createOrganizationState.fetching) ||
    safe(() => updateOrganizationAvatarState.fetching) ||
    safe(() => updateOrganizationState.fetching);
  const onFile = file => {
    setAvatarLoading(true);

    if (file.size > MAXIMUM_IMAGE_UPLOAD_BYTES) {
      new Compressor(file, {
        convertSize: MAXIMUM_IMAGE_UPLOAD_BYTES,
        success(result) {
          const reader = new FileReader();
          reader.onload = () => {
            setAvatar(reader.result);
            setBlob(result);
            setAvatarLoading(false);
          };
          reader.readAsDataURL(result);
        },
        error() {
          setAvatar(false);
          setUnableToCompressFile(true);
        },
      });
    } else if (file.type.startsWith('image')) {
      setBlob(file);

      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
        setAvatarLoading(false);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarLoading(false);
    }
  };
  const onSubmit = e => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setUnableToCompressFile(false);

    if (organizationId) {
      dispatchFetch([ORGANIZATION_PATH, organizationId], {
        method: 'POST',
        body: {
          name,
          email
        },
      }, UPDATE_ORGANIZATION);

      if (blob) {
        dispatchFetch([ORGANIZATION_AVATAR_PATH, organization._id], {
          method: 'POST',
          body: blob,
        }, UPDATE_ORGANIZATION_AVATAR);
      }
    } else {
      dispatchFetch(ORGANIZATIONS_PATH, {
        method: 'POST',
        body: {
          name,
          email
        },
      }, CREATE_ORGANIZATION);
    }
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([CREATE_ORGANIZATION, UPDATE_ORGANIZATION, UPDATE_ORGANIZATION_AVATAR, GET_ORGANIZATION]);
    };
  }, []);

  useEffect(() => {
    if (safe(() => updateOrganizationAvatarState.response.ok)) {
      dispatchFetch(...getOrganization(updateOrganizationState.params.organizationId));
    }
  }, [ updateOrganizationAvatarState ]);

  useEffect(() => {
    if (safe(() => updateOrganizationState.response.ok)) {
      dispatchFetch(...getOrganization(updateOrganizationState.params.organizationId));
    }
  }, [ updateOrganizationState ]);

  useEffect(() => {
    if (organizationId && !organization) {
      dispatchFetch([ORGANIZATION_PATH, organizationId], {}, GET_ORGANIZATION);
    }
  }, [ organizationId, organization ]);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setEmail(organization.email);

      if (organization.avatar) {
        setAvatar(organization.avatar);
      }
    }
  }, [ organization ]);

  useEffect(() => {
    const newId = safe(() => createOrganizationState.body._id);

    if (newId) {
      if (blob) {
        dispatchFetch([ORGANIZATION_AVATAR_PATH, newId], {
          method: 'POST',
          body: blob
        }, UPDATE_ORGANIZATION_AVATAR);
      }

      history.push(routes.event(newId));
    }
  }, [ createOrganizationState, blob ]);

  const messages = [];

  if (unableToCompressFile) {
    messages.push(('Sorry, we can not compress your image'));
  }

  if (safe(() => !updateOrganizationAvatarState.response.ok, false)) {
    messages.push(T('Sorry, we are not able to update your avatar, please try another image'));
  }

  if (displayUnableToPersistError) {
    messages.push(T('Sorry, we are not able save your data, please try again'));
  }

  return (
    <form onSubmit={onSubmit} styleName='root'>
      {
        messages.map(message => <MessageBlock key={message}>{message}</MessageBlock>)
      }
      <AvatarImageUpload loading={avatarLoading} disabled={loading} styleName='avatar-image-upload' onFile={onFile} { ...avatarUploadProps } />
      <Input
        placeholder={T('Organization Name')}
        onChange={e => setName(e.target.value)}
        value={name}
        required
        maxLength={ORGANIZATION_SCHEMA.properties,name.maxLength}
      />
      <div styleName='email-section'>
        <Input
          placeholder={T('Email')}
          type='email'
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          maxLength={ORGANIZATION_SCHEMA.properties.email.maxLength}
        />
      <OrganizationEmailNotice />
      </div>
      <Button loading={loading}>
        {submitText}
      </Button>
    </form>
  );
}

OrganizationPersistComponent.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export const OrganizationPersist = withRouter(OrganizationPersistComponent);
