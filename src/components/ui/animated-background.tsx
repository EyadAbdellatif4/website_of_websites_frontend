'use client';

import React from 'react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Deep cosmic midnight mesh base */}
      <div className="absolute inset-0 bg-[#080d1a] bg-gradient-to-b from-[#080d1a] via-[#0c1222] to-[#070b16]" />

      {/* Floating Animated Aurora 1 (Indigo / Electric Blue) */}
      <div
        className="absolute -top-[15%] left-[10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-indigo-600/25 to-blue-500/15 blur-[120px] animate-aurora-slow"
        style={{ animationDuration: '18s' }}
      />

      {/* Floating Animated Aurora 2 (Purple / Violet) */}
      <div
        className="absolute top-[25%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-600/20 via-pink-600/15 to-indigo-600/15 blur-[130px] animate-aurora-reverse"
        style={{ animationDuration: '22s' }}
      />

      {/* Floating Animated Aurora 3 (Cyan / Emerald Ambient) */}
      <div
        className="absolute -bottom-[20%] left-[25%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-indigo-600/15 to-emerald-500/10 blur-[120px] animate-aurora-slow"
        style={{ animationDuration: '26s' }}
      />

      {/* Modern Cyber Grid / Dot Matrix Pattern */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Vignette Overlay to soften edges */}
      <div className="absolute inset-0 bg-radial-vignette opacity-70" />
    </div>
  );
}
