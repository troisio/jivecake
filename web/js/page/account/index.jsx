import React from 'react';

import { T } from 'common/i18n';

import { Anchor  } from 'component/anchor';
import { DefaultLayout } from 'component/default-layout';

import { routes } from 'js/routes';

import './style.scss';

export function Account() {
  return (
    <DefaultLayout>
      My account
      <div>
        Search for an Organization
      </div>
      <div>
        <Anchor to={routes.organizationPersist()}>
          {T('Create an organization')}
        </Anchor>
      </div>
    </DefaultLayout>
  );
}
