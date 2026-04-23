import React, { useState } from 'react';
import { Joyride, CallBackProps, STATUS, Step } from 'react-joyride';
import { HelpCircle } from 'lucide-react';

const steps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>👋 Welcome to Business Nexus!</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Let's take a quick tour of the platform. This will only take a minute!</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>📊 Dashboard</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Your home base. See pending requests, connections, upcoming meetings and profile views at a glance.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="find-investors"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>💰 Find Investors</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Browse and connect with investors who match your startup's needs. Filter by stage, interests, and location.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="meetings"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>📅 Meetings</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Schedule meetings, manage availability slots, and accept or decline meeting requests from investors.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="videocall"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>📹 Video Call</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Join or start video calls with investors. Toggle mic/camera, share your screen, and chat in real-time.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="doc-chamber"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>📄 Document Chamber</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Upload contracts and pitch decks. Track status (Draft → In Review → Signed) and e-sign documents.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="payments"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>💳 Payments</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Manage your wallet balance. Deposit, withdraw, transfer funds, and track your full transaction history.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="security"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>🔐 Security</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Update your password with a strength meter and enable Two-Factor Authentication to protect your account.</p>
      </div>
    ),
  },
  {
    target: '[data-tour="settings"]',
    content: (
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>⚙️ Settings</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Update your profile, notification preferences, and account settings here.</p>
      </div>
    ),
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>You're all set!</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>You now know your way around Business Nexus. Start by finding investors or scheduling a meeting!</p>
      </div>
    ),
    placement: 'center',
  },
];

interface GuidedTourProps {
  autoStart?: boolean;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ autoStart = false }) => {
  const [run, setRun] = useState(autoStart);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('nexus_tour_done', 'true');
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableOverlayClose
        styles={{
          options: {
            primaryColor: '#2563eb',
            zIndex: 10000,
            arrowColor: '#fff',
            backgroundColor: '#fff',
            overlayColor: 'rgba(0, 0, 0, 0.45)',
            textColor: '#1f2937',
          },
          tooltip: {
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          },
          buttonNext: {
            backgroundColor: '#2563eb',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 18px',
          },
          buttonBack: {
            color: '#6b7280',
            fontSize: 13,
            fontWeight: 500,
          },
          buttonSkip: {
            color: '#9ca3af',
            fontSize: 12,
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish 🎉',
          next: 'Next →',
          skip: 'Skip tour',
        }}
        callback={handleCallback}
      />

      {/* Floating tour button */}
      <button
        onClick={() => setRun(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg text-sm font-medium transition-all hover:scale-105"
        title="Start guided tour"
      >
        <HelpCircle size={18} />
        <span>Tour</span>
      </button>
    </>
  );
};

export const useAutoTour = (): boolean => {
  return !localStorage.getItem('nexus_tour_done');
};