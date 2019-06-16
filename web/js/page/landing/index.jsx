import React from 'react';
import { T } from 'common/i18n';
import './style.scss';

import { svgUrl } from 'web/js/helper';

export function Landing() {
  return (
    <div styleName='root'>
      <section styleName='section'>
        <h2 styleName='section-title'>{T('Bringing people together is easy')}</h2>
        <div styleName='image-row'>
          <img alt='calendar' src={svgUrl('731-calendar.svg')} />
          <img alt='airplane' src={svgUrl('624-airplane.svg')} />
          <img alt='circus-tent' src={svgUrl('599-circus-tent.svg')} />
        </div>
        <h4 styleName='description'>{T(`We get it. Event organization is hard. We're here to do the heavy lifting for you.`)}</h4>
      </section>
      <section styleName='section logistics'>
        <h2 styleName='section-title'>{T('Manage Logistics like a Pro')}</h2>
        <div styleName='image-row'>
          <img alt='bar-chart' src={svgUrl('732-bar-chart.svg')} />
          <img alt='selfie-2' src={svgUrl('348-selfie-2.svg')} />
          <img alt='delivery-truck' src={svgUrl('613-delivery-truck.svg')} />
        </div>
        <h4 styleName='description'>{T('No last minute surprises. See all your data & customers on-the-go. Know your event status anywhere, anytime, on any device.')}</h4>
      </section>
      <section styleName='section introduction'>
        <h2 styleName='section-title'>{T('Get paid on time')}</h2>
        <div styleName='image-row'>
          <img alt='calendar' src={svgUrl('731-calendar.svg')} />
          <img alt='credit-card' src={svgUrl('721-credit-card.svg')} />
          <img alt='money-bag' src={svgUrl('717-money-bag.svg')} />
        </div>
        <h4 styleName='description'>{T('Use your favorite payments processor to get paid on time. Your money stays with you, straight from the customer into your pocket.')}</h4>
      </section>
      <section styleName='section audience'>
        <h2 styleName='section-title'>{T('Engage your Audience')}</h2>
        <div styleName='image-row'>
          <img alt='South-Korea' src={svgUrl('776-South-Korea.svg')} />
          <img alt='France' src={svgUrl('767-France.svg')} />
          <img alt='United-States' src={svgUrl('787-United-States.svg')} />
        </div>
        <h4 styleName='description'>{T('Your customers come in different shapes and sizes. We make sure your customers get the information they need securely, fast and in a language they can understand.')}</h4>
      </section>
      <section styleName='section pricing'>
        <h2 styleName='section-title'>{T('Pricing')}</h2>
        <div styleName='image-row'>
          <img alt='grinning-face' src={svgUrl('001-grinning-face.svg')} />
          <img alt='smiling-face-with-sunglasses' src={svgUrl('012-smiling-face-with-sunglasses.svg')} />
          <img alt='kissing-face' src={svgUrl('015-kissing-face.svg')} />
        </div>
        <h4 styleName='description'>{T('Flat rate pricing. $1 for every payment processed, everything else is free.')}</h4>
      </section>
    </div>
  );
}
