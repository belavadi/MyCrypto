import React from 'react';
import translate from 'translations';
import OnboardSlide from './OnboardSlide';
import onboardIconNine from 'assets/images/onboarding/slide-09.svg';

interface Props {
  site?: string;
}

const SecureSlideThree: React.SFC<Props> = ({ site }) => {
  const header = translate('ONBOARD_SECURE_3_TITLE');
  const subheader = translate('ONBOARD_SECURE_3_CONTENT__1');

  const content = (
    <div>
      <ul>
        <li>{translate('ONBOARD_SECURE_3_CONTENT__2', {}, true)}</li>
        <li>{translate('ONBOARD_SECURE_3_CONTENT__3', {}, true)}</li>
        <li>{translate('ONBOARD_SECURE_3_CONTENT__4', {}, true)}</li>
        <li>{translate('ONBOARD_SECURE_3_CONTENT__5', {}, true)}</li>
        {site === 'cx' && <li>{translate('CX_WARNING_1', {}, true)}</li>}
      </ul>
      <h5 className="text-center">{translate('ONBOARD_SECURE_3_CONTENT__6', {}, true)} </h5>
    </div>
  );

  return (
    <OnboardSlide
      header={header}
      subheader={subheader}
      content={content}
      image={onboardIconNine}
      imageSide="right"
    />
  );
};
export default SecureSlideThree;
