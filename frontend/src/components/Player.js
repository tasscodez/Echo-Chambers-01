import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useGame } from '../contexts/GameContext';
import useKeyControls from '../hooks/useKeyControls';
import * as THREE from 'three';

const Player = () => {
  const { gameState, updateGameState, addToInventory } = useGame();
  const { isKeyPressed } = useKeyControls();
  const { camera } = useThree();
  
  const [playerRef, playerApi] = useBox(() => ({
    mass: 1,
    position: [gameState.position.x, gameState.position.y, gameState.position.z],
    args: [0.5, 1.8, 0.5],
    material: {
      friction: 0.1,
      restitution: 0.1
    }
  }));

  const [isFlying, setIsFlying] = useState(false);
  const [isSwimming, setIsSwimming] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [energy, setEnergy] = useState(100);
  const [health, setHealth] = useState(100);

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 0, 0]);
  const cameraOffset = useRef(new THREE.Vector3(0, 3, 5));

  // Subscribe to player physics
  useEffect(() => {
    const unsubscribeVelocity = playerApi.velocity.subscribe((v) => velocity.current = v);
    const unsubscribePosition = playerApi.position.subscribe((p) => {
      position.current = p;
      // Update game state position
      updateGameState({
        position: { x: p[0], y: p[1], z: p[2] }
      });
    });

    return () => {
      unsubscribeVelocity();
      unsubscribePosition();
    };
  }, [playerApi, updateGameState]);

  // Player movement and controls
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const speed = isRunning ? 8 : isCrouching ? 2 : 4;
    const jumpForce = isFlying ? 10 : 8;
    
    // Movement vector
    const movement = new THREE.Vector3();
    
    // Check for movement keys
    if (isKeyPressed('forward')) movement.z -= 1;
    if (isKeyPressed('backward')) movement.z += 1;
    if (isKeyPressed('left')) movement.x -= 1;
    if (isKeyPressed('right')) movement.x += 1;
    
    // Normalize movement
    if (movement.length() > 0) {
      movement.normalize();
      movement.multiplyScalar(speed * delta * 10);
    }

    // Apply movement
    playerApi.velocity.set(movement.x, velocity.current[1], movement.z);

    // Handle special movements
    if (isKeyPressed('jump') && !isFlying) {
      playerApi.velocity.set(velocity.current[0], jumpForce, velocity.current[2]);
    }

    // Flying mode
    if (isKeyPressed('fly')) {
      setIsFlying(true);
      if (isKeyPressed('jump')) {
        playerApi.velocity.set(velocity.current[0], jumpForce, velocity.current[2]);
      }
      if (isKeyPressed('crouch')) {
        playerApi.velocity.set(velocity.current[0], -jumpForce, velocity.current[2]);
      }
    } else {
      setIsFlying(false);
    }

    // Swimming mode (when in water)
    const isInWater = position.current[1] < -0.3;
    setIsSwimming(isInWater);
    if (isInWater && isKeyPressed('swim')) {
      playerApi.velocity.set(velocity.current[0], 5, velocity.current[2]);
    }

    // Crouching
    setIsCrouching(isKeyPressed('crouch') && !isFlying);
    
    // Running
    setIsRunning(isKeyPressed('run') && !isCrouching);

    // Update energy based on actions
    if (isRunning || isFlying) {
      setEnergy(prev => Math.max(0, prev - delta * 10));
    } else {
      setEnergy(prev => Math.min(100, prev + delta * 5));
    }

    // Update camera position (third person)
    const playerPosition = new THREE.Vector3(...position.current);
    const desiredCameraPosition = playerPosition.clone().add(cameraOffset.current);
    
    camera.position.lerp(desiredCameraPosition, 0.1);
    camera.lookAt(playerPosition);

    // Check for interactions
    checkInteractions();
  });

  // Interaction system
  const checkInteractions = () => {
    const playerPos = new THREE.Vector3(...position.current);
    
    // Check for hidden objects
    const hiddenObjects = [
      { pos: [3, 0.5, 3], type: 'crystal', name: 'Moonstone Crystal' },
      { pos: [-7, 0.5, 8], type: 'rune', name: 'Ancient Rune' },
      { pos: [12, 0.5, -5], type: 'essence', name: 'Spirit Essence' },
      { pos: [-3, 0.5, -8], type: 'memory', name: 'Memory Fragment' }
    ];

    if (isKeyPressed('interact')) {
      hiddenObjects.forEach(obj => {
        const objPos = new THREE.Vector3(...obj.pos);
        const distance = playerPos.distanceTo(objPos);
        
        if (distance < 2) {
          addToInventory({
            name: obj.name,
            type: obj.type,
            description: `A mystical ${obj.type} found in the castle grounds.`
          });
        }
      });
    }
  };

  // Handle mouse look
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (document.pointerLockElement) {
        const sensitivity = 0.002;
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        
        euler.setFromQuaternion(camera.quaternion);
        euler.y -= event.movementX * sensitivity;
        euler.x -= event.movementY * sensitivity;
        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
        
        camera.quaternion.setFromEuler(euler);
      }
    };

    const handleClick = () => {
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [camera]);

  // Create player character visual
  const PlayerCharacter = () => {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        
        {/* Wings (if flying) */}
        {isFlying && (
          <group>
            <mesh position={[-0.3, 0.8, 0]} castShadow>
              <planeGeometry args={[0.8, 0.4]} />
              <meshStandardMaterial 
                color="#9333ea" 
                transparent 
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0.3, 0.8, 0]} castShadow>
              <planeGeometry args={[0.8, 0.4]} />
              <meshStandardMaterial 
                color="#9333ea" 
                transparent 
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
        
        {/* Swimming effects */}
        {isSwimming && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 8, 8]} />
            <meshStandardMaterial 
              color="#0ea5e9" 
              transparent 
              opacity={0.3}
            />
          </mesh>
        )}
        
        {/* Magical aura based on spells */}
        {gameState.spells.length > 0 && (
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              transparent 
              opacity={0.2}
              emissive="#f59e0b"
              emissiveIntensity={0.1}
            />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <mesh ref={playerRef}>
      <PlayerCharacter />
    </mesh>
  );
};

export default Player;