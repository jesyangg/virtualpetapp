// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    // Game state
    const gameState = {
        pet: {
            name: '',
            level: 1,
            evolution: 'Baby',
            hunger: 1,
            energy: 9,
            mood: 9,
            appearance: '😺',
            experience: 0,
            state: 'idle', // New property to track pet state
            targetState: null // Add this to track what state we want after movement
        },
        isSleeping: false,
        isPlaying: false,
        isEating: false,
        lastUpdate: Date.now(),
        bowls: {
            food: 0, // 0-100 percentage full
            water: 0  // 0-100 percentage full
        }
    };

    // Get DOM elements
    const startScreen = document.getElementById('startScreen');
    const container = document.querySelector('.container');
    const petNameInput = document.getElementById('petNameInput');
    const startButton = document.getElementById('startButton');
    const petNameDisplay = document.getElementById('petName');
    const petLevelDisplay = document.getElementById('petLevel');
    const evolutionStageDisplay = document.getElementById('evolutionStage');
    const hungerBar = document.getElementById('hungerBar');
    const hungerValue = document.getElementById('hungerValue');
    const energyBar = document.getElementById('energyBar');
    const energyValue = document.getElementById('energyValue');
    const moodBar = document.getElementById('moodBar');
    const moodValue = document.getElementById('moodValue');
    const pet = document.getElementById('pet');
    const petImage = document.getElementById('petImage');
    const petArea = document.getElementById('petArea');
    const feedBtn = document.getElementById('feedBtn');
    const playBtn = document.getElementById('playBtn');
    const sleepBtn = document.getElementById('sleepBtn');
    const customizeBtn = document.getElementById('customizeBtn');
    const notification = document.getElementById('notification');
    const customizeModal = document.getElementById('customizeModal');
    const closeModal = document.getElementById('closeModal');
    const customPetName = document.getElementById('customPetName');
    const petAppearance = document.getElementById('petAppearance');
    const applyCustomize = document.getElementById('applyCustomize');
    const foodBowl = document.getElementById('foodBowl');
    const waterBowl = document.getElementById('waterBowl');
    const foodLevel = document.getElementById('foodLevel');
    const waterLevel = document.getElementById('waterLevel');
    
    // Update bowls function (was missing)
    function updateBowls() {
        foodLevel.style.height = `${gameState.bowls.food}%`;
        waterLevel.style.height = `${gameState.bowls.water}%`;
    }
    
    // Evolution images (these will be replaced with your actual image paths)
    const evolutionImages = {
        Baby: {
            idle: 'assets/cat_idle.png',
            sleeping: 'assets/cat_sleeping.png',
            eating: 'assets/cat_eating.png',
            playing: 'assets/cat_playing.png',
            sad: 'assets/cat_sad.png'
        },
        Child: {
            idle: 'assets/cat_idle.png',
            sleeping: 'assets/cat_sleeping.png',
            eating: 'assets/cat_eating.png',
            playing: 'assets/cat_playing.png',
            sad: 'assets/cat_sad.png'
        },
        Teen: {
            idle: 'assets/cat_idle.png',
            sleeping: 'assets/cat_sleeping.png',
            eating: 'assets/cat_eating.png',
            playing: 'assets/cat_playing.png',
            sad: 'assets/cat_sad.png'
        },
        Adult: {
            idle: 'assets/cat_idle.png',
            sleeping: 'assets/cat_sleeping.png',
            eating: 'assets/cat_eating.png',
            playing: 'assets/cat_playing.png',
            sad: 'assets/cat_sad.png'
        }
    };

    // Hide container initially
    container.style.display = 'none';

    // Start game event
    startButton.addEventListener('click', () => {
        const name = petNameInput.value.trim();
        if (name) {
            gameState.pet.name = name;
            startScreen.style.display = 'none';
            container.style.display = 'block';
            updateUI();
            startGameLoop();
            showNotification(`Welcome, ${name}!`);
            
            // Position pet in center initially
            resetPetPosition();
        } else {
            showNotification('Please enter a name for your pet!');
        }
    });

    // Reset pet position to center
    function resetPetPosition() {
        pet.style.left = '50%';
        pet.style.top = '50%';
        pet.style.transform = 'translate(-50%, -50%)';
    }

    // Feed button with improved bowl functionality
    feedBtn.addEventListener('click', () => {
        if (gameState.isSleeping) {
            showNotification('Your pet is sleeping!');
            return;
        }
        
        if (gameState.isPlaying || gameState.isEating) {
            showNotification(`${gameState.pet.name} is busy!`);
            return;
        }
        
        // Fill food bowl
        gameState.bowls.food = 100;
        updateBowls();
        
        // Set eating as target state after movement
        gameState.pet.targetState = 'eating';
        gameState.isEating = true;
        
        // Move pet to food bowl - we'll set the state after arrival
        const bowlPosition = foodBowl.getBoundingClientRect();
        const petAreaPosition = petArea.getBoundingClientRect();
        const relativeX = (bowlPosition.left - petAreaPosition.left) + (bowlPosition.width / 2);
        const relativeY = (bowlPosition.top - petAreaPosition.top) + (bowlPosition.height / 2) - 30; // Position above bowl
        
        movePetTo(relativeX, relativeY);
        
        showNotification(`${gameState.pet.name} is going to eat!`);
        
        // After eating
        setTimeout(() => {
            gameState.pet.hunger = Math.max(0, gameState.pet.hunger - 3);
            gameState.pet.mood = Math.min(10, gameState.pet.mood + 1);
            gameState.isEating = false;
            setPetState('idle');
            updateUI();
            addExperience(5);
            
            // Empty bowl slowly
            gameState.bowls.food = 20;
            updateBowls();
        }, 5000); // Increased to 5 seconds to ensure enough time to see eating animation
    });
    
    // Water bowl click functionality
    waterBowl.addEventListener('click', () => {
        if (gameState.isSleeping) {
            showNotification('Your pet is sleeping!');
            return;
        }
        
        if (gameState.isPlaying || gameState.isEating) {
            showNotification(`${gameState.pet.name} is busy!`);
            return;
        }
        
        // Fill water bowl
        gameState.bowls.water = 100;
        updateBowls();
        
        // Set eating as target state (use eating for drinking too)
        gameState.pet.targetState = 'eating';
        gameState.isEating = true;
        
        // Move pet to water bowl
        const bowlPosition = waterBowl.getBoundingClientRect();
        const petAreaPosition = petArea.getBoundingClientRect();
        const relativeX = (bowlPosition.left - petAreaPosition.left) + (bowlPosition.width / 2);
        const relativeY = (bowlPosition.top - petAreaPosition.top) + (bowlPosition.height / 2) - 30; // Position above bowl
        
        movePetTo(relativeX, relativeY);
        
        showNotification(`${gameState.pet.name} is going to drink water!`);
        
        // After drinking
        setTimeout(() => {
            gameState.pet.hunger = Math.max(0, gameState.pet.hunger - 1);
            gameState.pet.energy = Math.min(10, gameState.pet.energy + 1);
            gameState.isEating = false;
            setPetState('idle');
            updateUI();
            
            // Empty bowl slowly
            gameState.bowls.water = 20;
            updateBowls();
        }, 5000);
    });
    
    // Food bowl click functionality - same as feed button
    foodBowl.addEventListener('click', () => {
        if (gameState.bowls.food <= 0) {
            // Fill food bowl
            feedBtn.click();
        } else {
            // Pet eats from bowl
            if (gameState.isSleeping || gameState.isPlaying || gameState.isEating) {
                return;
            }
            
            // Set eating as target state
            gameState.pet.targetState = 'eating';
            gameState.isEating = true;
            
            // Move pet to food bowl
            const bowlPosition = foodBowl.getBoundingClientRect();
            const petAreaPosition = petArea.getBoundingClientRect();
            const relativeX = (bowlPosition.left - petAreaPosition.left) + (bowlPosition.width / 2);
            const relativeY = (bowlPosition.top - petAreaPosition.top) + (bowlPosition.height / 2) - 30;
            
            movePetTo(relativeX, relativeY);
            
            showNotification(`${gameState.pet.name} is going to eat the remaining food!`);
            
            // After eating
            setTimeout(() => {
                gameState.pet.hunger = Math.max(0, gameState.pet.hunger - 1);
                gameState.bowls.food = 0;
                updateBowls();
                gameState.isEating = false;
                setPetState('idle');
                updateUI();
            }, 4000);
        }
    });

    // Play button with improved animation handling
    playBtn.addEventListener('click', () => {
        if (gameState.isSleeping) {
            showNotification('Your pet is sleeping!');
            return;
        }
        
        if (gameState.isPlaying || gameState.isEating) {
            showNotification(`${gameState.pet.name} is already busy!`);
            return;
        }
        
        if (gameState.pet.energy < 3) {
            showNotification(`${gameState.pet.name} is too tired to play!`);
            return;
        }
        
        // Start playing animation
        gameState.isPlaying = true;
        setPetState('playing');
        
        // Play for 5 seconds
        const playDuration = 5000;
        let bounceCount = 0;
        const maxBounces = 5;
        
        // Make small bouncy movements
        const playInterval = setInterval(() => {
            if (bounceCount >= maxBounces || !gameState.isPlaying) {
                clearInterval(playInterval);
                if (gameState.isPlaying) { // Only reset if still playing (not interrupted)
                    gameState.pet.mood = Math.min(10, gameState.pet.mood + 2);
                    gameState.pet.energy = Math.max(0, gameState.pet.energy - 2);
                    gameState.isPlaying = false;
                    setPetState('idle');
                    updateUI();
                    addExperience(10);
                }
                return;
            }
            
            // Make a small bounce
            const currentX = parseFloat(pet.style.left) || petArea.clientWidth / 2;
            const currentY = parseFloat(pet.style.top) || petArea.clientHeight / 2;
            
            const bounceDistance = 20;
            const newX = Math.max(0, Math.min(petArea.clientWidth - 50, 
                                             currentX + (Math.random() * bounceDistance * 2 - bounceDistance)));
            const newY = Math.max(0, Math.min(petArea.clientHeight - 50, 
                                             currentY + (Math.random() * bounceDistance * 2 - bounceDistance)));
            
            // Keep the playing state during movement
            gameState.pet.targetState = 'playing';
            movePetTo(newX, newY, false); // Pass false to not use walking animation
            
            bounceCount++;
        }, 1000);
        
        showNotification(`${gameState.pet.name} is having fun!`);
    });

    // Sleep button with improved state management
    sleepBtn.addEventListener('click', () => {
        if (gameState.isPlaying) {
            gameState.isPlaying = false;
            showNotification(`${gameState.pet.name} stopped playing to sleep.`);
        }
        
        if (gameState.isEating) {
            gameState.isEating = false;
            showNotification(`${gameState.pet.name} stopped eating to sleep.`);
        }
        
        gameState.isSleeping = !gameState.isSleeping;
        
        if (gameState.isSleeping) {
            setPetState('sleeping');
            showNotification(`${gameState.pet.name} is sleeping...`);
        } else {
            setPetState('idle');
            showNotification(`${gameState.pet.name} woke up!`);
            gameState.pet.energy = Math.min(10, gameState.pet.energy + 3);
        }
        
        updateUI();
    });

    // Customize button
    customizeBtn.addEventListener('click', () => {
        customizeModal.style.display = 'flex';
        customPetName.value = gameState.pet.name;
        if (petAppearance) {
            petAppearance.value = gameState.pet.appearance;
        }
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        customizeModal.style.display = 'none';
    });

    // Apply customizations - FIX: Ensure modal is properly hidden
    applyCustomize.addEventListener('click', () => {
        const newName = customPetName.value.trim();
        if (newName) {
            gameState.pet.name = newName;
        }
        
        if (petAppearance) {
            gameState.pet.appearance = petAppearance.value;
        }
        updateUI();
        
        // FIX: Make sure we explicitly set display to 'none'
        customizeModal.style.display = 'none';
        showNotification('Changes applied!');
    });

    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === customizeModal) {
            customizeModal.style.display = 'none';
        }
    });

    // Game loop (runs every second)
    function startGameLoop() {
        // Initial random position
        randomPetMovement();
        
        setInterval(() => {
            const now = Date.now();
            const deltaTime = (now - gameState.lastUpdate) / 1000; // Time in seconds
            gameState.lastUpdate = now;
            
            if (!gameState.isSleeping && !gameState.isPlaying && !gameState.isEating) {
                // Increase hunger over time
                gameState.pet.hunger = Math.min(10, gameState.pet.hunger + (0.1 * deltaTime));
                
                // Decrease energy when active
                gameState.pet.energy = Math.max(0, gameState.pet.energy - (0.05 * deltaTime));
                
                // Decrease mood if hungry or tired
                if (gameState.pet.hunger > 7 || gameState.pet.energy < 3) {
                    gameState.pet.mood = Math.max(0, gameState.pet.mood - (0.1 * deltaTime));
                    // Show sad state if mood is low
                    if (gameState.pet.mood < 3) {
                        setPetState('sad');
                    } else {
                        setPetState('idle');
                    }
                }
                
                // Random movement (less frequent and smaller)
                if (Math.random() < 0.1) {
                    randomPetMovement();
                }
            } else if (gameState.isSleeping) {
                // Recover energy while sleeping
                gameState.pet.energy = Math.min(10, gameState.pet.energy + (0.1 * deltaTime));
            }
            
            // Decrease bowl contents over time
            if (gameState.bowls.food > 0) {
                gameState.bowls.food = Math.max(0, gameState.bowls.food - (1 * deltaTime));
            }
            if (gameState.bowls.water > 0) {
                gameState.bowls.water = Math.max(0, gameState.bowls.water - (0.5 * deltaTime));
            }
            
            // Update UI
            updateUI();
            updateBowls();
            
            // Check for alerts
            checkAlerts();
        }, 1000);
    }

    // Update UI with current game state
    function updateUI() {
        petNameDisplay.textContent = gameState.pet.name;
        petLevelDisplay.textContent = gameState.pet.level;
        evolutionStageDisplay.textContent = gameState.pet.evolution;
        
        // Update bars
        hungerBar.style.width = `${gameState.pet.hunger * 10}%`;
        hungerValue.textContent = `${Math.round(gameState.pet.hunger)}/10`;
        
        energyBar.style.width = `${gameState.pet.energy * 10}%`;
        energyValue.textContent = `${Math.round(gameState.pet.energy)}/10`;
        
        moodBar.style.width = `${gameState.pet.mood * 10}%`;
        moodValue.textContent = `${Math.round(gameState.pet.mood)}/10`;
        
        // Update pet appearance based on state and evolution
        updatePetAppearance();
    }
    
    // Update pet appearance based on state and evolution
    function updatePetAppearance() {
        // Just update the image based on state
        updatePetImage(gameState.pet.state);
    }
    
    // Set pet state
    function setPetState(state) {
        gameState.pet.state = state;
        
        // Remove all state classes
        pet.classList.remove('walking', 'playing', 'sleeping', 'eating', 'sad', 'petting');
        
        // Add appropriate class
        if (state) {
            pet.classList.add(state);
        }
        
        // Make sure to update the image
        updatePetImage(state);
    }

    // Move pet randomly (with smaller movements)
    function randomPetMovement() {
        if (gameState.isSleeping || gameState.isPlaying || gameState.isEating) return;
        
        // Get current position
        const currentX = parseFloat(pet.style.left) || petArea.clientWidth / 2;
        const currentY = parseFloat(pet.style.top) || petArea.clientHeight / 2;
        
        // Calculate new position with smaller, more natural movement
        const moveRadius = 50; // Maximum movement radius in pixels
        const newX = Math.max(0, Math.min(petArea.clientWidth - 50, 
                                         currentX + (Math.random() * moveRadius * 2 - moveRadius)));
        const newY = Math.max(0, Math.min(petArea.clientHeight - 50, 
                                         currentY + (Math.random() * moveRadius * 2 - moveRadius)));
        
        // Apply smooth transition
        movePetTo(newX, newY);
    }
    
    // Move pet to specific position - FIXED FUNCTION
    function movePetTo(x, y, useWalking = true) {
        // Store current state if we need to return to it after walking
        const previousState = gameState.pet.state;
        
        // Only change to walking animation if useWalking is true and we're not preserving another state
        if (useWalking && !gameState.pet.targetState) {
            setPetState('walking');
        }
        
        pet.style.transition = 'left 0.5s ease, top 0.5s ease';
        pet.style.left = `${x}px`;
        pet.style.top = `${y}px`;
        
        // Change to target state (eating, playing) when reaching destination
        setTimeout(() => {
            if (gameState.pet.targetState) {
                setPetState(gameState.pet.targetState);
                // Clear the target state after it's been set
                gameState.pet.targetState = null;
            } 
            // If no target state and we used walking animation, return to previous or idle state
            else if (useWalking && gameState.pet.state === 'walking') {
                if (previousState !== 'walking') {
                    setPetState(previousState);
                } else {
                    setPetState('idle');
                }
            }
        }, 500);
    }

    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
    }

    // Check for alerts
    function checkAlerts() {
        if (gameState.pet.hunger >= 8 && !gameState.alertShown) {
            showNotification(`${gameState.pet.name} is very hungry!`);
            gameState.alertShown = true;
            
            // Reset alert after a while
            setTimeout(() => {
                gameState.alertShown = false;
            }, 30000);
        }
        
        if (gameState.pet.energy <= 2 && !gameState.energyAlertShown) {
            showNotification(`${gameState.pet.name} is exhausted!`);
            gameState.energyAlertShown = true;
            
            // Reset alert after a while
            setTimeout(() => {
                gameState.energyAlertShown = false;
            }, 30000);
        }
        
        if (gameState.pet.mood <= 2 && !gameState.moodAlertShown) {
            showNotification(`${gameState.pet.name} is unhappy!`);
            gameState.moodAlertShown = true;
            
            // Reset alert after a while
            setTimeout(() => {
                gameState.moodAlertShown = false;
            }, 30000);
        }
    }

    // Add experience and level up
    function addExperience(amount) {
        gameState.pet.experience += amount;
        
        // Check for level up
        if (gameState.pet.experience >= gameState.pet.level * 50) {
            gameState.pet.level += 1;
            
            // Evolution stages
            if (gameState.pet.level === 5) {
                gameState.pet.evolution = 'Child';
                showNotification(`${gameState.pet.name} evolved to Child stage!`);
            } else if (gameState.pet.level === 10) {
                gameState.pet.evolution = 'Teen';
                showNotification(`${gameState.pet.name} evolved to Teen stage!`);
            } else if (gameState.pet.level === 15) {
                gameState.pet.evolution = 'Adult';
                showNotification(`${gameState.pet.name} evolved to Adult stage!`);
            } else {
                showNotification(`${gameState.pet.name} leveled up to ${gameState.pet.level}!`);
            }
            
            updateUI();
        }
    }
    
    // Pet click handler - show pet status and pet the cat
    pet.addEventListener('click', () => {
        showNotification(`${gameState.pet.name} loves being petted!`);
        
        // Only allow petting if not in another state
        if (!gameState.isSleeping && !gameState.isPlaying && !gameState.isEating) {
            // Set to petting state
            setPetState('petting');
            
            // Increase mood when petted
            gameState.pet.mood = Math.min(10, gameState.pet.mood + 1);
            updateUI();
            
            // Return to idle after petting (3 seconds)
            setTimeout(() => {
                if (gameState.pet.state === 'petting') { // Only reset if still in petting state
                    setPetState('idle');
                }
            }, 3000);
        }
    });
    
    // Update pet image based on state
    function updatePetImage(state) {
        const petImg = document.getElementById('petImage');
        
        switch(state) {
            case 'idle':
                petImg.src = 'assets/cat_idle.png';
                break;
            case 'walking':
                petImg.src = 'assets/cat_walking.png'; 
                break;
            case 'playing':
                petImg.src = 'assets/cat_playing.png';
                break;
            case 'sleeping':
                petImg.src = 'assets/cat_sleeping.png';
                break;
            case 'eating':
                petImg.src = 'assets/cat_eating.png';
                break;
            case 'sad':
                petImg.src = 'assets/cat_sad.png';
                break;
            case 'petting':
                petImg.src = 'assets/cat_love.png';
                break;
            default:
                petImg.src = 'assets/cat_idle.png';
        }
    }
}