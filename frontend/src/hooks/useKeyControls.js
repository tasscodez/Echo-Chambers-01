import { useState, useEffect } from 'react';

const useKeyControls = () => {
  const [keys, setKeys] = useState({});
  const [keyBindings, setKeyBindings] = useState({
    forward: 'KeyW',
    backward: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    crouch: 'KeyC',
    run: 'ShiftLeft',
    interact: 'KeyE',
    fly: 'KeyF',
    swim: 'KeyR',
    quickMenu: 'KeyM',
    chat: 'KeyT',
    journal: 'KeyJ',
    inventory: 'KeyI',
    spells: 'KeyP'
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeys(prev => ({
        ...prev,
        [event.code]: true
      }));
    };

    const handleKeyUp = (event) => {
      setKeys(prev => ({
        ...prev,
        [event.code]: false
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const isKeyPressed = (action) => {
    return keys[keyBindings[action]] || false;
  };

  const updateKeyBinding = (action, newKey) => {
    setKeyBindings(prev => ({
      ...prev,
      [action]: newKey
    }));
  };

  return {
    keys,
    keyBindings,
    isKeyPressed,
    updateKeyBinding
  };
};

export default useKeyControls;