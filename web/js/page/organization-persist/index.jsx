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
  ORGANIZATION_PATH,
  ORGANIZATION_STRIPE_DISCONNECT_PATH
} from 'common/routes';

import { FetchDispatchContext, FetchStateContext, OrganizationContext } from 'js/context';
import {
  CREATE_ORGANIZATION,
  UPDATE_ORGANIZATION,
  UPDATE_ORGANIZATION_AVATAR,
  GET_ORGANIZATION,
  ORGANIZATION_STRIPE_DISCONNECT
} from 'js/reducer/useFetch';

import { routes } from 'js/routes';

import { safe } from 'js/helper';
import { ConnectWithStripeAnchor } from 'component/connect-with-stripe-anchor';
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
  const disconnectStripeState = fetchState[ORGANIZATION_STRIPE_DISCONNECT];

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
  const disconnectStripe = () => {
    if (window.confirm(T('Are you are you sure you want to disconnect?'))) {
      dispatchFetch([ORGANIZATION_STRIPE_DISCONNECT_PATH, organizationId], {
        method: 'DELETE',
      }, ORGANIZATION_STRIPE_DISCONNECT);
    }
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([
        CREATE_ORGANIZATION,
        UPDATE_ORGANIZATION,
        UPDATE_ORGANIZATION_AVATAR,
        GET_ORGANIZATION,
        ORGANIZATION_STRIPE_DISCONNECT
      ]);
    };
  }, []);

  useEffect(() => {
    if (safe(() => updateOrganizationAvatarState.response.ok)) {
      dispatchFetch([ORGANIZATION_PATH, organizationId], {}, GET_ORGANIZATION);
    }
  }, [ updateOrganizationAvatarState, organizationId ]);

  useEffect(() => {
    if (safe(() => updateOrganizationState.response.ok)) {
      dispatchFetch([ORGANIZATION_PATH, organizationId], {}, GET_ORGANIZATION);
    }
  }, [ updateOrganizationState, organizationId ]);

  useEffect(() => {
    if (organizationId && !organization) {
      dispatchFetch([ORGANIZATION_PATH, organizationId], {}, GET_ORGANIZATION);
    }
  }, [ organizationId, organization ]);

  useEffect(() => {
    if (safe(() => disconnectStripeState.response.ok)) {
      dispatchFetchDelete([ ORGANIZATION_STRIPE_DISCONNECT ]);
      dispatchFetch([ORGANIZATION_PATH, organizationId], {}, GET_ORGANIZATION);
    }
  }, [ disconnectStripeState ]);

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
      <div styleName='row'>
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
      <div styleName='row'>
        { organization && !organization.stripe &&
          <>
            <ConnectWithStripeAnchor />
            <span styleName='note'>
              {T('Connect your organization to a Stripe account to start receiving payments.')}
            </span>
          </>
        }
      </div>
      <div styleName='row'>
        { organization && organization.stripe &&
          <>
            <Button onClick={disconnectStripe} type='button'>
              {T('Disconnect your Stripe account')}
            </Button>
            <span styleName='note'>
              {T('Once your Stripe account is disconnected, you will not be able to receive payments through Stripe. This will affect any events you currently have published')}
            </span>
          </>
        }
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
