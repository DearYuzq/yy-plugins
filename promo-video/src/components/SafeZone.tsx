import React from 'react';
import { safeZoneMargin } from '../styles/tech';

interface SafeZoneProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * SafeZone component to ensure content is visible within 10% margins
 * For 1920x1080 video: horizontal 192px, vertical 108px margins
 */
export const SafeZone: React.FC<SafeZoneProps> = ({ children, style }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: safeZoneMargin.horizontal,
        right: safeZoneMargin.horizontal,
        top: safeZoneMargin.vertical,
        bottom: safeZoneMargin.vertical,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default SafeZone;