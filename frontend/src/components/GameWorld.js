import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, usePlane } from '@react-three/cannon';
import { Text, Environment, Stars, Clouds } from '@react-three/drei';
import { useGame } from '../contexts/GameContext';
import * as THREE from 'three';

const GameWorld = () => {
  const { gameState, updateMood } = useGame();
  const [timeOfDay, setTimeOfDay] = useState(0.5);
  
  // Create terrain
  const [groundRef] = usePlane(() => ({
    position: [0, -1, 0],
    rotation: [-Math.PI / 2, 0, 0],
    args: [100, 100]
  }));

  // Castle walls
  const [castleWall1] = useBox(() => ({
    position: [-10, 2, -10],
    args: [2, 4, 20]
  }));

  const [castleWall2] = useBox(() => ({
    position: [10, 2, -10],
    args: [2, 4, 20]
  }));

  const [castleWall3] = useBox(() => ({
    position: [0, 2, -20],
    args: [20, 4, 2]
  }));

  // Castle towers
  const [tower1] = useBox(() => ({
    position: [-15, 5, -15],
    args: [3, 10, 3]
  }));

  const [tower2] = useBox(() => ({
    position: [15, 5, -15],
    args: [3, 10, 3]
  }));

  // Interactive elements
  const [mirrorRef] = useBox(() => ({
    position: [0, 2, -18],
    args: [0.1, 3, 2]
  }));

  // Animate lighting based on mood
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    setTimeOfDay(0.5 + 0.3 * Math.sin(time * 0.1));
  });

  // Trees for decision trees mechanic
  const DecisionTree = ({ position, unlocked = false }) => {
    const [treeRef] = useBox(() => ({
      position,
      args: [0.5, 3, 0.5]
    }));

    return (
      <group>
        <mesh ref={treeRef} castShadow>
          <boxGeometry args={[0.5, 3, 0.5]} />
          <meshStandardMaterial color={unlocked ? "#4ade80" : "#8b5cf6"} />
        </mesh>
        <mesh position={[position[0], position[1] + 2, position[2]]}>
          <sphereGeometry args={[1.5, 8, 6]} />
          <meshStandardMaterial 
            color={unlocked ? "#22c55e" : "#7c3aed"} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      </group>
    );
  };

  // Hidden objects scattered around
  const HiddenObject = ({ position, type, collected = false }) => {
    if (collected) return null;

    return (
      <mesh position={position} castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#f59e0b"
          emissiveIntensity={0.2}
        />
      </mesh>
    );
  };

  // Vines that can be cleared
  const VineObstacle = ({ position, cleared = false }) => {
    if (cleared) return null;

    return (
      <mesh position={position} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
    );
  };

  // Water area for swimming
  const WaterArea = ({ position, size }) => {
    const waterRef = useRef();
    
    useFrame((state) => {
      if (waterRef.current) {
        waterRef.current.position.y = -0.5 + Math.sin(state.clock.getElapsedTime()) * 0.1;
      }
    });

    return (
      <mesh ref={waterRef} position={position} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          transparent 
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>
    );
  };

  // Mood-based lighting
  const getMoodLighting = (mood) => {
    switch (mood) {
      case 'melancholic':
        return { color: "#6366f1", intensity: 0.3 };
      case 'radiant':
        return { color: "#fbbf24", intensity: 0.8 };
      case 'contemplative':
        return { color: "#8b5cf6", intensity: 0.5 };
      case 'peaceful':
        return { color: "#10b981", intensity: 0.6 };
      default:
        return { color: "#f8fafc", intensity: 0.5 };
    }
  };

  const moodLighting = getMoodLighting(gameState.mood);

  return (
    <group>
      {/* Environment */}
      <Environment preset="night" />
      <Stars radius={300} depth={60} count={1000} factor={4} />
      
      {/* Mood-based clouds */}
      <Clouds 
        material={THREE.MeshBasicMaterial} 
        color={moodLighting.color}
        opacity={0.3}
        position={[0, 10, 0]}
        volume={20}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={moodLighting.intensity}
        color={moodLighting.color}
        castShadow
      />
      
      {/* Ground */}
      <mesh ref={groundRef} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Castle Structure */}
      <group>
        {/* Castle walls */}
        <mesh ref={castleWall1} castShadow>
          <boxGeometry args={[2, 4, 20]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh ref={castleWall2} castShadow>
          <boxGeometry args={[2, 4, 20]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh ref={castleWall3} castShadow>
          <boxGeometry args={[20, 4, 2]} />
          <meshStandardMaterial color="#374151" />
        </mesh>

        {/* Castle towers */}
        <mesh ref={tower1} castShadow>
          <boxGeometry args={[3, 10, 3]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        <mesh ref={tower2} castShadow>
          <boxGeometry args={[3, 10, 3]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>

        {/* Castle entrance */}
        <mesh position={[0, 1, -10]} castShadow>
          <boxGeometry args={[4, 2, 1]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Interactive Mirror */}
      <mesh ref={mirrorRef} castShadow>
        <boxGeometry args={[0.1, 3, 2]} />
        <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0} />
      </mesh>

      {/* Decision Trees */}
      <DecisionTree position={[5, 0, 5]} unlocked={gameState.unlocked_areas.includes('memory_garden')} />
      <DecisionTree position={[-5, 0, 5]} unlocked={gameState.unlocked_areas.includes('shadow_realm')} />
      <DecisionTree position={[0, 0, 15]} unlocked={gameState.unlocked_areas.includes('crystal_caverns')} />

      {/* Hidden Objects */}
      <HiddenObject position={[3, 0.5, 3]} type="crystal" />
      <HiddenObject position={[-7, 0.5, 8]} type="rune" />
      <HiddenObject position={[12, 0.5, -5]} type="essence" />
      <HiddenObject position={[-3, 0.5, -8]} type="memory" />

      {/* Vine Obstacles */}
      <VineObstacle position={[8, 2, 2]} cleared={gameState.spells.some(spell => spell.name === 'Vine Whisper')} />
      <VineObstacle position={[-4, 2, 12]} cleared={gameState.spells.some(spell => spell.name === 'Vine Whisper')} />

      {/* Water Areas */}
      <WaterArea position={[20, -0.5, 20]} size={[15, 15]} />
      <WaterArea position={[-20, -0.5, 20]} size={[10, 10]} />

      {/* Mini-game Portals */}
      <mesh position={[15, 1, 0]} castShadow>
        <torusGeometry args={[1, 0.3, 8, 16]} />
        <meshStandardMaterial 
          color="#ec4899" 
          emissive="#be185d"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Location Labels */}
      <Text
        position={[0, 3, -5]}
        fontSize={0.5}
        color="#9333ea"
        anchorX="center"
        anchorY="middle"
      >
        {gameState.location_names.castle_entrance || "Castle Entrance"}
      </Text>

      {/* Atmospheric Elements */}
      <group>
        {/* Floating particles */}
        {Array.from({ length: 20 }, (_, i) => (
          <mesh key={i} position={[
            Math.random() * 40 - 20,
            Math.random() * 10 + 2,
            Math.random() * 40 - 20
          ]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial 
              color="#9333ea" 
              emissive="#7c3aed"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default GameWorld;