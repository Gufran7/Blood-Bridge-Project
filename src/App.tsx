import { useCallback, useState } from 'react';
import { AboutFaq } from '@/components/about/AboutFaq';
import { BloodBanks } from '@/components/banks/BloodBanks';
import { DonationCentrePage } from '@/components/centre/DonationCentrePage';
import { CompatibilityChart } from '@/components/knowledge/CompatibilityChart';
import { EligibilityChecker } from '@/components/knowledge/EligibilityChecker';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { DonorRegistrationForm } from '@/components/donors/DonorRegistrationForm';
import { DonorSearch } from '@/components/donors/DonorSearch';
import { Hero } from '@/components/hero/Hero';
import { HowItWorks } from '@/components/how/HowItWorks';
import { BloodRequestForm } from '@/components/requests/BloodRequestForm';
import { BloodRequestSection } from '@/components/requests/BloodRequestSection';
import { ImpactStats } from '@/components/stats/ImpactStats';
import { Testimonials } from '@/components/stories/Testimonials';
import { Modal } from '@/components/ui/Modal';
import { CertificatePage } from '@/components/passport/CertificatePage';
import { PassportHighlight } from '@/components/passport/PassportHighlight';
import { PassportLookupPage } from '@/components/passport/PassportLookupPage';
import { PassportPage } from '@/components/passport/PassportPage';
import { useAppRoute } from '@/hooks/useAppRoute';
import type { DonorFilter } from '@/lib/bloodApi';

type DialogKind = 'donor' | 'request';

const DEFAULT_FILTER: DonorFilter = { bloodGroup: null, city: '', availableOnly: true };

function App() {
  const route = useAppRoute();
  const [filter, setFilter] = useState<DonorFilter>(DEFAULT_FILTER);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [version, setVersion] = useState(0);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setVersion((current) => current + 1);
  }, []);

  const openDonor = useCallback(() => setDialog('donor'), []);
  const openRequest = useCallback(() => setDialog('request'), []);

  const updateFilter = useCallback((next: Partial<DonorFilter>) => {
    setFilter((current) => ({ ...current, ...next }));
  }, []);

  const handleHeroSearch = useCallback(
    (next: Pick<DonorFilter, 'bloodGroup' | 'city'>) => {
      updateFilter(next);
      document.getElementById('find-donors')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [updateFilter],
  );

  if (route.name === 'passport-lookup') return <PassportLookupPage />;
  if (route.name === 'passport') return <PassportPage code={route.code} />;
  if (route.name === 'certificate') return <CertificatePage code={route.code} />;
  if (route.name === 'centre') return <DonationCentrePage />;

  return (
    <div className="min-h-screen bg-ink-950">
      <Header onRequestBlood={openRequest} onBecomeDonor={openDonor} />

      <main>
        <Hero onRequestBlood={openRequest} onBecomeDonor={openDonor} onSearch={handleHeroSearch} />
        <ImpactStats version={version} />
        <HowItWorks />
        <DonorSearch
          filter={filter}
          onFilterChange={updateFilter}
          onRegister={openDonor}
          version={version}
        />
        <BloodRequestSection version={version} onRequestBlood={openRequest} onBecomeDonor={openDonor} />
        <CompatibilityChart />
        <EligibilityChecker />
        <BloodBanks />
        <PassportHighlight />
        <Testimonials />
        <AboutFaq />
      </main>

      <Footer />

      <ChatWidget />

      <Modal
        open={dialog === 'donor'}
        title="Become a donor"
        subtitle="Join the donor list so patients in your city can reach you."
        onClose={closeDialog}
      >
        <DonorRegistrationForm onDone={closeDialog} />
      </Modal>

      <Modal
        open={dialog === 'request'}
        title="Post a blood request"
        subtitle="Share the details so compatible donors and blood banks can respond quickly."
        onClose={closeDialog}
      >
        <BloodRequestForm onDone={closeDialog} />
      </Modal>
    </div>
  );
}

export default App;
