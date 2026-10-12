import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { useCurrentFrame } from 'remotion';

export const GLTest: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 2, 6], fov: 50 }}>
      <color attach="background" args={['#9FB3C4']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={2} />
      <mesh rotation={[0, frame * 0.05, 0]}>
        <torusKnotGeometry args={[1, 0.3, 200, 32]} />
        <meshStandardMaterial color="#d98a9a" roughness={0.8} />
      </mesh>
    </ThreeCanvas>
  );
};
