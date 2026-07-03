import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  action?: () => void;
}

interface DashboardTourProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setOrgSubTab?: (subtab: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardTour({
  activeTab,
  setActiveTab,
  setOrgSubTab,
  isOpen,
  onClose,
}: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      targetId: 'tour-projects-btn',
      title: 'Projects & Policies',
      content: 'Configure your partner applications, restrict allowed request domains, and choose verification enforcement modes (e.g. Block Untrusted).',
      placement: 'right',
      action: () => {
        setActiveTab('organizations');
        if (setOrgSubTab) setOrgSubTab('settings');
      },
    },
    {
      targetId: 'tour-apikeys-btn',
      title: 'Cryptographic API Keys',
      content: 'Generate and manage secure API credentials to authorize your backend requests for user humanness checks.',
      placement: 'right',
      action: () => {
        setActiveTab('api-keys');
      },
    },
    {
      targetId: 'tour-events-btn',
      title: 'Real-Time Trust Events',
      content: 'Monitor live cryptographic verification attempts, examine risk scores, and view diagnostic details of failed integrity checks.',
      placement: 'right',
      action: () => {
        setActiveTab('verification-activity');
      },
    },
    {
      targetId: 'tour-profiles-btn',
      title: 'Human Identity Profiles',
      content: 'Track registered user IDs, linked device fingerprints, and verified hardware-attested trust credentials across your platform.',
      placement: 'right',
      action: () => {
        setActiveTab('organizations');
        if (setOrgSubTab) setOrgSubTab('profiles');
      },
    },
    {
      targetId: 'tour-academy-btn',
      title: 'AAN Interactive Academy',
      content: 'Click here at any time to open our contextual educational lessons, sandbox simulators, and guides linked to this specific view.',
      placement: 'bottom',
      action: () => {},
    },
  ];

  // Execute step action on step change
  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    if (step && step.action) {
      step.action();
    }
  }, [currentStep, isOpen]);

  // Track target element coordinates
  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    let retries = 0;
    const maxRetries = 10;

    const updateCoords = () => {
      const step = steps[currentStep];
      if (!step) return;

      let element = document.getElementById(step.targetId);
      
      // Fallback if target element doesn't exist (e.g. if Academy is disabled)
      if (!element && retries >= maxRetries) {
        if (step.targetId === 'tour-academy-btn') {
          element = document.getElementById('tour-header');
        }
        if (!element) {
          element = document.getElementById('tour-projects-btn') || document.body;
        }
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Add highlight styling classes to the target element
        if (element.id !== 'tour-header' && element !== document.body) {
          element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-[#0d0e12]', 'transition-all', 'duration-300');
        }
      } else {
        retries++;
        // If element is not rendered yet, retry in a short frame
        setTimeout(updateCoords, 50);
      }
    };

    // Initial update
    updateCoords();

    // Event listeners to keep positioning absolute parity
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);

      // Clean up classes on target element
      const step = steps[currentStep];
      if (step) {
        const element = document.getElementById(step.targetId);
        if (element) {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-[#0d0e12]');
        }
      }
    };
  }, [currentStep, isOpen, activeTab]);

  if (!isOpen || !coords) return null;

  const step = steps[currentStep];

  // Calculate tooltip style positions based on targeted element coordinates and step placement
  const getTooltipStyle = () => {
    const margin = 12;
    let top = 0;
    let left = 0;

    if (!tooltipRef.current) return { top: coords.top, left: coords.left };

    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    switch (step.placement) {
      case 'right':
        top = coords.top + (coords.height / 2) - (tooltipRect.height / 2);
        left = coords.left + coords.width + margin;
        break;
      case 'left':
        top = coords.top + (coords.height / 2) - (tooltipRect.height / 2);
        left = coords.left - tooltipRect.width - margin;
        break;
      case 'top':
        top = coords.top - tooltipRect.height - margin;
        left = coords.left + (coords.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = coords.top + coords.height + margin;
        left = coords.left + (coords.width / 2) - (tooltipRect.width / 2);
        break;
    }

    // Guard rails to prevent rendering outside viewport
    const viewportWidth = window.innerWidth;
    const padding = 16;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    return { top, left };
  };

  const tooltipStyle = getTooltipStyle();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onClose();
    setCurrentStep(0);
    try {
      localStorage.setItem('aan_dashboard_tour_completed', 'true');
    } catch (e) {
      console.warn("Storage write blocked", e);
    }
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Semi-transparent focal highlight backdrop for non-intrusive focus */}
      <div 
        className="fixed inset-0 bg-black/30 pointer-events-auto transition-opacity duration-300" 
        onClick={handleComplete}
      />

      {/* Actual Tooltip Container Card */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          top: `${tooltipStyle.top}px`,
          left: `${tooltipStyle.left}px`,
        }}
        className="w-80 bg-[#111319] border border-blue-500/40 rounded-xl p-5 shadow-2xl pointer-events-auto animate-fadeIn z-50"
      >
        {/* Step Indicator and Skip Button */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5 text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Interactive Guide
            </span>
          </div>
          <button
            onClick={handleComplete}
            className="text-[#78819a] hover:text-white transition-colors p-1 rounded-md hover:bg-[#1c202e] cursor-pointer"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title and Content */}
        <h3 className="text-sm font-bold text-white mb-1.5 font-sans leading-snug">
          {step.title}
        </h3>
        <p className="text-xs text-[#78819a] leading-relaxed mb-4 font-normal">
          {step.content}
        </p>

        {/* Progress & Actions Layout */}
        <div className="flex justify-between items-center pt-3 border-t border-[#1b1e28]">
          <span className="text-[10px] font-mono text-[#5d6780]">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-[#78819a] hover:text-white bg-[#171a23] hover:bg-[#1f2431] border border-[#232a3b] px-3 py-1.5 rounded transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-white bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_8px_rgba(59,130,246,0.5)] border border-blue-500/30 px-3.5 py-1.5 rounded transition-all cursor-pointer"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
