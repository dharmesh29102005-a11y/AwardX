import React from 'react';
import { holdHintForAwardsMode, type AwardsViewMode } from '../../lib/awardsViewMode';
import { HoldToggleNavItem } from './HoldToggleNavItem';

interface AwardsNavItemProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  currentView: string;
  collapsed: boolean;
  awardsViewMode: AwardsViewMode;
  onNavigate: () => void;
  onToggleCanvas: () => void;
}

export const AwardsNavItem: React.FC<AwardsNavItemProps> = ({
  label,
  icon,
  currentView,
  collapsed,
  awardsViewMode,
  onNavigate,
  onToggleCanvas,
}) => (
  <HoldToggleNavItem
    navId="awards"
    demoTarget="nav-awards"
    label={label}
    icon={icon}
    currentView={currentView}
    collapsed={collapsed}
    holdHint={holdHintForAwardsMode(awardsViewMode)}
    onNavigate={onNavigate}
    onHoldToggle={onToggleCanvas}
  />
);
