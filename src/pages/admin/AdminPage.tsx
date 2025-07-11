import { ThinContainer } from '@/components/layout/ThinContainer';
import { Heading1, Paragraph } from '@/components/utils/Text';
import { SubPageLayout } from '@/pages/layouts/SubPageLayout';
import { ConfigValuesPart } from '@/pages/parts/admin/ConfigValuesPart';
import { RegionSelectorPart } from '@/pages/parts/admin/RegionSelectorPart';
import { TMDBTestPart } from '@/pages/parts/admin/TMDBTestPart';
import { WorkerTestPart } from '@/pages/parts/admin/WorkerTestPart';

import { BackendTestPart } from '../parts/admin/BackendTestPart';

export function AdminPage() {
  return (
    <SubPageLayout>
      <ThinContainer>
        <Heading1>Admin tools</Heading1>
        <Paragraph>Silly tools used test Z-Watcher! ee b4f6  445 d0</Paragraph>

        <ConfigValuesPart />
        <BackendTestPart />
        <WorkerTestPart />
        <TMDBTestPart />
        <RegionSelectorPart />
      </ThinContainer>
    </SubPageLayout>
  );
}
