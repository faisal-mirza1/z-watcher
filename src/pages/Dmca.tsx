import { useTranslation } from 'react-i18next';

import { ThinContainer } from '@/components/layout/ThinContainer';
import { Heading1 } from '@/components/utils/Text';
import { PageTitle } from '@/pages/parts/util/PageTitle';

import { SubPageLayout } from './layouts/SubPageLayout';

export function DmcaPage() {
  const { t } = useTranslation();

  return (
    <SubPageLayout>
      <PageTitle subpage k="global.pages.dmca" />
      <ThinContainer>
        <Heading1>{t('screens.dmca.title')}</Heading1>
        <h1 className="pt-0 text-gray-600 text-xl">
          This site operates in compliance with the Digital Millennium Copyright
          Act (&ldquo;DMCA&ldquo;). We do not store any files on our servers.
          All videos and media content are hosted on third-party services.
          Please remember that we do not manage the content.
        </h1>
      </ThinContainer>
    </SubPageLayout>
  );
}
