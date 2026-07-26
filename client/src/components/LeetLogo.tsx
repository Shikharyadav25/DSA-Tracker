import React from 'react';

interface LeetLogoProps {
  className?: string;
  size?: number;
}

export const LeetLogo: React.FC<LeetLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
    >
      {/* Outer LeetCode angled loop in Vibrant Blue */}
      <path
        d="M16.102 17.93l-2.697 2.607c-.466.45-1.235.45-1.702 0l-5.92-5.72c-.467-.45-.467-1.19 0-1.638l5.92-5.72c.467-.45 1.236-.45 1.702 0l2.697 2.607c.307.296.812.296 1.12 0 .307-.297.307-.785 0-1.082l-2.697-2.607c-1.088-1.05-2.887-1.05-3.975 0l-5.92 5.72c-1.088 1.05-1.088 2.77 0 3.82l5.92 5.72c1.088 1.05 2.887 1.05 3.975 0l2.697-2.607c.307-.297.307-.785 0-1.082-.308-.297-.813-.297-1.12 0z"
        fill="#3B82F6"
      />
      {/* Top-left angled wedge in Crisp White for high contrast */}
      <path
        d="M14.545 10.748L11.8 13.4c-.467.45-.467 1.19 0 1.638l2.745 2.652c.307.297.813.297 1.12 0 .307-.297.307-.785 0-1.082l-2.185-2.111 2.185-2.111c.307-.297.307-.785 0-1.082-.307-.297-.813-.297-1.12 0z"
        fill="#FFFFFF"
      />
      {/* Center horizontal dash in Vibrant Blue */}
      <path
        d="M7.747 12.015h11.753c.435 0 .788-.342.788-.763 0-.422-.353-.764-.788-.764H7.747c-.435 0-.788.342-.788.764 0 .421.353.763.788.763z"
        fill="#3B82F6"
      />
    </svg>
  );
};

export default LeetLogo;
