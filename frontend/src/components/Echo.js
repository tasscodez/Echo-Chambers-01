import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../contexts/GameContext';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const Echo = () => {
  const { gameState } = useGame();
  const echoRef = useRef();
  const [echoPosition, setEchoPosition] = useState([5, 2, 0]);
  const [echoForm, setEchoForm] = useState('humanoid');
  const [isVisible, setIsVisible] = useState(true);
  const [currentGesture, setCurrentGesture] = useState('idle');

  // Update Echo's form based on mood
  useEffect(() => {
    switch (gameState.mood) {
      case 'melancholic':
        setEchoForm('ethereal');
        break;
      case 'radiant':
        setEchoForm('radiant');
        break;
      case 'contemplative':
        setEchoForm('nature');
        break;
      case 'peaceful':
        setEchoForm('serene');
        break;
      default:
        setEchoForm('humanoid');
    }
  }, [gameState.mood]);

  // Animate Echo's movement
  useFrame((state) => {
    if (!echoRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Gentle floating animation
    echoRef.current.position.y = echoPosition[1] + Math.sin(time * 0.5) * 0.3;
    
    // Gentle swaying
    echoRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
    
    // Wisp-like movement
    if (echoForm === 'ethereal') {
      echoRef.current.position.x = echoPosition[0] + Math.sin(time * 0.2) * 0.5;
      echoRef.current.position.z = echoPosition[2] + Math.cos(time * 0.15) * 0.3;
    }
  });

  // Get color scheme based on mood
  const getEchoColors = (mood) => {
    switch (mood) {
      case 'melancholic':
        return { primary: '#6366f1', secondary: '#8b5cf6', glow: '#4f46e5' };
      case 'radiant':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#d97706' };
      case 'contemplative':
        return { primary: '#8b5cf6', secondary: '#a855f7', glow: '#7c3aed' };
      case 'peaceful':
        return { primary: '#10b981', secondary: '#059669', glow: '#047857' };
      default:
        return { primary: '#9333ea', secondary: '#a855f7', glow: '#7c3aed' };
    }
  };

  const colors = getEchoColors(gameState.mood);

  // Render different Echo forms
  const renderEchoForm = () => {
    switch (echoForm) {
      case 'ethereal':
        return (
          <group>
            {/* Ethereal wispy form */}
            <mesh>
              <sphereGeometry args={[0.8, 8, 8]} />
              <meshStandardMaterial
                color={colors.primary}
                transparent
                opacity={0.4}
                emissive={colors.glow}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Wispy trails */}
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} position={[
                Math.sin(i * 0.8) * 0.5,
                -0.5 - i * 0.2,
                Math.cos(i * 0.8) * 0.3
              ]}>
                <sphereGeometry args={[0.2 - i * 0.03, 6, 6]} />
                <meshStandardMaterial
                  color={colors.secondary}
                  transparent
                  opacity={0.6 - i * 0.1}
                  emissive={colors.glow}
                  emissiveIntensity={0.2}
                />
              </mesh>
            ))}
          </group>
        );

      case 'radiant':
        return (
          <group>
            {/* Radiant humanoid form */}
            <mesh position={[0, 0.5, 0]}>
              <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
              <meshStandardMaterial
                color={colors.primary}
                emissive={colors.glow}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {/* Glowing head */}
            <mesh position={[0, 1.3, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial
                color={colors.secondary}
                emissive={colors.glow}
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Radiant wings */}
            <mesh position={[-0.4, 0.8, 0]} rotation={[0, 0, 0.3]}>
              <planeGeometry args={[1.2, 0.6]} />
              <meshStandardMaterial
                color={colors.primary}
                transparent
                opacity={0.8}
                emissive={colors.glow}
                emissiveIntensity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0.4, 0.8, 0]} rotation={[0, 0, -0.3]}>
              <planeGeometry args={[1.2, 0.6]} />
              <meshStandardMaterial
                color={colors.primary}
                transparent
                opacity={0.8}
                emissive={colors.glow}
                emissiveIntensity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );

      case 'nature':
        return (
          <group>
            {/* Nature-bound form */}
            <mesh position={[0, 0.5, 0]}>
              <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
              <meshStandardMaterial
                color={colors.primary}
                roughness={0.6}
              />
            </mesh>
            
            {/* Tree bark details */}
            <mesh position={[0, 1.3, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial
                color={colors.secondary}
                roughness={0.8}
              />
            </mesh>
            
            {/* Vine-like extensions */}
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} position={[
                Math.cos(i * Math.PI / 3) * 0.6,
                0.5 + Math.sin(i * 0.5) * 0.3,
                Math.sin(i * Math.PI / 3) * 0.6
              ]}>
                <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
                <meshStandardMaterial color="#166534" />
              </mesh>
            ))}
          </group>
        );

      case 'serene':
        return (
          <group>
            {/* Peaceful, serene form */}
            <mesh position={[0, 0.5, 0]}>
              <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
              <meshStandardMaterial
                color={colors.primary}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Gentle head */}
            <mesh position={[0, 1.3, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial
                color={colors.secondary}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Soft aura */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[1.2, 8, 8]} />
              <meshStandardMaterial
                color={colors.glow}
                transparent
                opacity={0.1}
                emissive={colors.glow}
                emissiveIntensity={0.1}
              />
            </mesh>
          </group>
        );

      default: // humanoid
        return (
          <group>
            {/* Humanoid form with armor */}
            <mesh position={[0, 0.5, 0]}>
              <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
              <meshStandardMaterial
                color={colors.primary}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            
            {/* Head with wild eyes effect */}
            <mesh position={[0, 1.3, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial
                color={colors.secondary}
                emissive={colors.glow}
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Glowing eyes */}
            <mesh position={[-0.1, 1.35, 0.2]}>
              <sphereGeometry args={[0.03, 4, 4]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={colors.glow}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0.1, 1.35, 0.2]}>
              <sphereGeometry args={[0.03, 4, 4]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={colors.glow}
                emissiveIntensity={0.8}
              />
            </mesh>
            
            {/* Armor details */}
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[0.4, 0.2, 0.1]} />
              <meshStandardMaterial
                color={colors.secondary}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            
            {/* Floating elements */}
            {Array.from({ length: 3 }, (_, i) => (
              <mesh key={i} position={[
                Math.cos(i * Math.PI * 2 / 3) * 0.8,
                1.5 + Math.sin(i * 0.8) * 0.2,
                Math.sin(i * Math.PI * 2 / 3) * 0.8
              ]}>
                <octahedronGeometry args={[0.1, 0]} />
                <meshStandardMaterial
                  color={colors.glow}
                  emissive={colors.glow}
                  emissiveIntensity={0.6}
                />
              </mesh>
            ))}
          </group>
        );
    }
  };

  return (
    <group ref={echoRef} position={echoPosition}>
      {isVisible && renderEchoForm()}
      
      {/* Echo's name label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color={colors.primary}
        anchorX="center"
        anchorY="middle"
      >
        Echo
      </Text>
      
      {/* Mood indicator */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color={colors.secondary}
        anchorX="center"
        anchorY="middle"
      >
        {gameState.mood}
      </Text>
    </group>
  );
};

export default Echo;