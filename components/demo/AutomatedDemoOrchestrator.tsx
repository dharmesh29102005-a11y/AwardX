import React, { useEffect, useRef } from 'react';
import type { DemoStepAction } from '../../lib/demo/demoSteps';
import { DEMO_STEPS } from '../../lib/demo/demoSteps';
import { useDemoContext } from '../../contexts/DemoContext';

type AutomatedDemoOrchestratorProps = {
  onChangeView: (view: string) => void;
  autoplay?: boolean;
};

const NAV_TARGET_VIEWS: Record<string, string> = {
  'nav-overview': 'overview',
  'nav-schedule-rounds': 'schedule-rounds',
  'nav-awards': 'awards',
  'nav-templates': 'templates',
  'nav-judging': 'judging',
  'nav-submissions': 'submissions',
};

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function getTargetRect(target: string): DOMRect | null {
  const el = document.querySelector(`[data-demo-target="${target}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

function waitForTarget(target: string, attempts = 12, intervalMs = 250): Promise<DOMRect | null> {
  return new Promise((resolve) => {
    let tries = 0;
    const tick = () => {
      const rect = getTargetRect(target);
      if (rect || tries >= attempts) {
        resolve(rect);
        return;
      }
      tries += 1;
      window.setTimeout(tick, intervalMs);
    };
    tick();
  });
}

export const AutomatedDemoOrchestrator: React.FC<AutomatedDemoOrchestratorProps> = ({
  onChangeView,
  autoplay = true,
}) => {
  const {
    isPlaying,
    setCurrentStepIndex,
    setCursor,
    setSpotlightRect,
    setIsComplete,
    setIsPlaying,
  } = useDemoContext();

  const onChangeViewRef = useRef(onChangeView);
  const pausedRef = useRef(false);

  useEffect(() => {
    onChangeViewRef.current = onChangeView;
  }, [onChangeView]);

  useEffect(() => {
    pausedRef.current = !isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!autoplay) {
      setIsPlaying(false);
    }
  }, [autoplay, setIsPlaying]);

  useEffect(() => {
    if (!autoplay) return;

    let cancelled = false;

    const waitWhilePaused = async () => {
      while (pausedRef.current && !cancelled) {
        await sleep(200);
      }
    };

    const animateCursorTo = async (rect: DOMRect) => {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setCursor((prev) => ({ ...prev, visible: true, x, y }));
      await sleep(600);
    };

    const pulseClick = async () => {
      setCursor((prev) => ({ ...prev, clicking: true }));
      await sleep(180);
      setCursor((prev) => ({ ...prev, clicking: false }));
      await sleep(280);
    };

    const performTargetAction = async (target: string) => {
      const navView = NAV_TARGET_VIEWS[target];
      if (navView) {
        const rect = await waitForTarget(target);
        if (rect) await animateCursorTo(rect);
        await pulseClick();
        onChangeViewRef.current(navView);
        await sleep(500);
        return;
      }

      if (target === 'publish-toggle') {
        const rect = await waitForTarget(target);
        if (rect) await animateCursorTo(rect);
        await pulseClick();
        window.dispatchEvent(new CustomEvent('demo-action', { detail: 'open-publish-modal' }));
        await sleep(1000);
        return;
      }

      if (target === 'publish-confirm') {
        const rect = await waitForTarget(target);
        if (rect) await animateCursorTo(rect);
        await pulseClick();
        window.dispatchEvent(new CustomEvent('demo-action', { detail: 'confirm-publish' }));
        await sleep(800);
        return;
      }

      const rect = await waitForTarget(target);
      if (rect) {
        await animateCursorTo(rect);
        await pulseClick();
        const el = document.querySelector(`[data-demo-target="${target}"]`) as HTMLElement | null;
        el?.click();
        await sleep(350);
      } else {
        await sleep(300);
      }
    };

    const runAction = async (action: DemoStepAction) => {
      if (cancelled) return;
      await waitWhilePaused();
      if (cancelled) return;

      switch (action.type) {
        case 'navigate':
          onChangeViewRef.current(action.view);
          await sleep(500);
          break;
        case 'click':
          await performTargetAction(action.target);
          break;
        case 'move': {
          const rect = await waitForTarget(action.target, 16, 200);
          if (rect) {
            await animateCursorTo(rect);
            setSpotlightRect(rect);
          }
          await sleep(action.duration ?? 1200);
          break;
        }
        case 'event':
          window.dispatchEvent(new CustomEvent('demo-action', { detail: action.detail }));
          await sleep(action.waitMs ?? 600);
          break;
        case 'wait':
          await sleep(action.ms);
          break;
        case 'highlight': {
          const rect = action.target
            ? await waitForTarget(action.target, 12, 200)
            : await waitForTarget('main-content', 12, 200);
          if (rect) setSpotlightRect(rect);
          await sleep(action.duration);
          break;
        }
        case 'scroll': {
          const el = document.querySelector(`[data-demo-target="${action.target}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await sleep(800);
          const rect = getTargetRect(action.target);
          if (rect) setSpotlightRect(rect);
          break;
        }
        default:
          break;
      }
    };

    const run = async () => {
      await sleep(900);

      for (let stepIndex = 0; stepIndex < DEMO_STEPS.length; stepIndex += 1) {
        if (cancelled) return;
        await waitWhilePaused();
        if (cancelled) return;

        setCurrentStepIndex(stepIndex);

        for (const action of DEMO_STEPS[stepIndex].actions) {
          if (cancelled) return;
          await waitWhilePaused();
          if (cancelled) return;
          await runAction(action);
        }

        if (stepIndex === DEMO_STEPS.length - 1) {
          setSpotlightRect(null);
          setCursor((prev) => ({ ...prev, visible: false }));
          setIsComplete(true);
          setIsPlaying(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    autoplay,
    setCurrentStepIndex,
    setCursor,
    setSpotlightRect,
    setIsComplete,
    setIsPlaying,
  ]);

  return null;
};
