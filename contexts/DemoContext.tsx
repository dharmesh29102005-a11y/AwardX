import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DemoStep } from '../lib/demo/demoSteps';
import { DEMO_STEPS } from '../lib/demo/demoSteps';

export type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
};

type DemoContextValue = {
  isPlaying: boolean;
  isComplete: boolean;
  currentStepIndex: number;
  currentStep: DemoStep | null;
  totalSteps: number;
  cursor: CursorState;
  spotlightRect: DOMRect | null;
  setCursor: React.Dispatch<React.SetStateAction<CursorState>>;
  setSpotlightRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  exitDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export const DemoProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cursor, setCursor] = useState<CursorState>({ x: 0, y: 0, visible: false, clicking: false });
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const exitDemo = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const pauseDemo = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeDemo = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      isPlaying,
      isComplete,
      currentStepIndex,
      currentStep: DEMO_STEPS[currentStepIndex] ?? null,
      totalSteps: DEMO_STEPS.length,
      cursor,
      spotlightRect,
      setCursor,
      setSpotlightRect,
      setCurrentStepIndex,
      setIsPlaying,
      setIsComplete,
      exitDemo,
      pauseDemo,
      resumeDemo,
    }),
    [isPlaying, isComplete, currentStepIndex, cursor, spotlightRect, exitDemo, pauseDemo, resumeDemo],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export function useDemoContext(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemoContext must be used within DemoProvider');
  }
  return ctx;
}
