'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeAQISphereProps {
  aqi: number | null;
  color: string;
}

export const ThreeAQISphere: React.FC<ThreeAQISphereProps> = ({ aqi, color }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle Sphere Geometry
    const particleCount = aqi && aqi > 300 ? 1400 : 900;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const radius = 1.8;
    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere surface
      const theta = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      scales[i] = Math.random() * 0.8 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material
    const parsedColor = new THREE.Color(color || '#10b981');
    const material = new THREE.PointsMaterial({
      color: parsedColor,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Inner glowing core sphere
    const coreGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: parsedColor,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Outer subtle atmospheric ring
    const ringGeometry = new THREE.RingGeometry(2.1, 2.15, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: parsedColor,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2.5;
    scene.add(ringMesh);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const elapsedTime = clock.getElapsedTime();
        const speed = aqi ? Math.min(0.015, 0.004 + (aqi / 500) * 0.012) : 0.005;

        particles.rotation.y += speed;
        particles.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;

        coreMesh.rotation.y -= speed * 0.7;
        ringMesh.rotation.z += speed * 0.5;

        // Subtle pulsing wave
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const ox = originalPositions[i * 3];
          const oy = originalPositions[i * 3 + 1];
          const oz = originalPositions[i * 3 + 2];

          const wave = Math.sin(elapsedTime * 1.5 + ox * 2 + oy * 2) * 0.06;
          posArray[i * 3] = ox * (1 + wave);
          posArray[i * 3 + 1] = oy * (1 + wave);
          posArray[i * 3 + 2] = oz * (1 + wave);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle container resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, [aqi, color]);

  return (
    <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center pointer-events-none select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
