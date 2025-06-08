import { runLevel1 } from './levels/level1.js';
import { runLevel2 } from './levels/level2.js';
import { runLevel3 } from './levels/level3.js';
import { runLevel4 } from './levels/level4.js';
import { runLevel5 } from './levels/level5.js';
import { runLevel6 } from './levels/level6.js';
import { runLevel7 } from './levels/level7.js';
import { runLevel8 } from './levels/level8.js';
import { runLevel9 } from './levels/level9.js';
import { runLevel10 } from './levels/level10.js';
import { runLevel11 } from './levels/level11.js';
import { runLevel12 } from './levels/level12.js';
import { runLevel13 } from './levels/level13.js';
import { runLevel14 } from './levels/level14.js';
import { runLevel15 } from './levels/level15.js';
import { runLevel16 } from './levels/level16.js';
import { runLevel17 } from './levels/level17.js';
import { runLevel18 } from './levels/level18.js';
import { runLevel19 } from './levels/level19.js';
import { runLevel20 } from './levels/level20.js';
import { runLevel21 } from './levels/level21.js';
import { runLevel22 } from './levels/level22.js';
import { runLevel23 } from './levels/level23.js';
import { runLevel24 } from './levels/level24.js';
import { runLevel25 } from './levels/level25.js';
import { runLevel26 } from './levels/level26.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
    }

    initializeLevel(level) {
        // Clear any existing level elements first
        this.clearLevelElements();
        
        // Set up the new level
        this.setBackground(level);
        this.setMusicAndNarration(level);

        // Create enemy-side element if it doesn't exist
        let enemySide = document.querySelector('.enemy-side');
        if (!enemySide) {
            enemySide = document.createElement('div');
            enemySide.className = 'enemy-side';
            document.body.appendChild(enemySide);
        }

        // Spawn enemies for the level
        this.spawnEnemies(level);

        // Add boardsd.png and boardsw.png for level 9
        if (level === 9) {
            // Add the Inn quest
            this.game.questManager.addQuest(
                'inn_quest',
                'Head to the Inn',
                'Visit the local inn to rest and gather information about your journey. The innkeeper might have valuable knowledge to share.'
            );

            const boardsd = document.createElement('img');
            boardsd.className = 'boardsd-image';
            boardsd.src = './assets/Images/boardsd.png';
            boardsd.style.position = 'absolute';
            boardsd.style.left = '73%';
            boardsd.style.top = '85%';
            boardsd.style.transform = 'translate(-50%, -50%) scale(0.13)';
            boardsd.style.zIndex = '1000';
            document.querySelector('.playfield').appendChild(boardsd);

            const boardsw = document.createElement('img');
            boardsw.className = 'boardsw-image';
            boardsw.src = './assets/Images/boardsw.png';
            boardsw.style.position = 'absolute';
            boardsw.style.left = '82.5%';
            boardsw.style.top = '80%';
            boardsw.style.transform = 'translate(-50%, -50%) scale(0.104)';
            boardsw.style.zIndex = '1000';
            document.querySelector('.playfield').appendChild(boardsw);

            const shopnote2 = document.createElement('img');
            shopnote2.className = 'shopnote2-image';
            shopnote2.src = './assets/Images/shopnote2.png';
            shopnote2.style.position = 'absolute';
            shopnote2.style.left = '72.9%';
            shopnote2.style.top = '80%';
            shopnote2.style.transform = 'translate(-50%, -50%) scale(0.06)';
            shopnote2.style.zIndex = '4000';
            shopnote2.style.cursor = 'pointer';
            shopnote2.addEventListener('click', () => {
                // Play a sound when clicked
                this.game.soundManager.playSound('click', 0.5);
                
                // Create popup container
                const popup = document.createElement('div');
                popup.style.position = 'fixed';
                popup.style.top = '50%';
                popup.style.left = '50%';
                popup.style.transform = 'translate(-50%, -50%)';
                popup.style.zIndex = '5000';

                // Create the shopnote image
                const shopnote = document.createElement('img');
                shopnote.src = './assets/Images/shopnote.png';
                shopnote.style.display = 'block';
                shopnote.style.maxWidth = '40vw';
                shopnote.style.maxHeight = '40vh';
                shopnote.style.margin = '0 auto';
                shopnote.style.cursor = 'pointer';

                // Add elements to popup
                popup.appendChild(shopnote);
                document.body.appendChild(popup);

                // Close popup when clicking the note
                shopnote.addEventListener('click', () => {
                    document.body.removeChild(popup);
                });
            });
            document.querySelector('.playfield').appendChild(shopnote2);
        }
        // Add boardsd.png for level 16
        else if (level === 16) {
            console.log('Level 16: Adding Shopkeeper quest');
            // Add the Shopkeeper quest
            if (!this.game.questManager.quests.has('shopkeepers_quest')) {
            this.game.questManager.addQuest(
                    'shopkeepers_quest',
                    'Speak to the Shop Keepers',
                    'Seek out the shopkeepers—one of them may hold a clue to the Mastersmith\'s fate.'
            );
                console.log('Shopkeeper quest added successfully');
            } else {
                console.log('Shopkeeper quest already exists');
            }

            const boardsd = document.createElement('img');
            boardsd.className = 'boardsd-image';
            boardsd.src = './assets/Images/boardsd.png';
            boardsd.style.position = 'absolute';
            boardsd.style.left = '70%';
            boardsd.style.top = '84%';
            boardsd.style.transform = 'translate(-50%, -50%) scale(0.13)';
            boardsd.style.zIndex = '1000';
            document.querySelector('.playfield').appendChild(boardsd);

            const boardsw = document.createElement('img');
            boardsw.className = 'boardsw-image';
            boardsw.src = './assets/Images/boardsw.png';
            boardsw.style.position = 'absolute';
            boardsw.style.left = '79.5%';
            boardsw.style.top = '80%';
            boardsw.style.transform = 'translate(-50%, -50%) scale(0.104)';
            boardsw.style.zIndex = '1000';
            document.querySelector('.playfield').appendChild(boardsw);

            const shopnote2 = document.createElement('img');
            shopnote2.className = 'shopnote2-image';
            shopnote2.src = './assets/Images/shopnote2.png';
            shopnote2.style.position = 'absolute';
            shopnote2.style.left = '69.9%';
            shopnote2.style.top = '80%';
            shopnote2.style.transform = 'translate(-50%, -50%) scale(0.06)';
            shopnote2.style.zIndex = '4000';
            shopnote2.style.cursor = 'pointer';
            shopnote2.addEventListener('click', () => {
                // Play a sound when clicked
                this.game.soundManager.playSound('click', 0.5);
                
                // Create popup container
                const popup = document.createElement('div');
                popup.style.position = 'fixed';
                popup.style.top = '50%';
                popup.style.left = '50%';
                popup.style.transform = 'translate(-50%, -50%)';
                popup.style.zIndex = '5000';

                // Create the shopnote image
                const shopnote = document.createElement('img');
                shopnote.src = './assets/Images/shopnote.png';
                shopnote.style.display = 'block';
                shopnote.style.maxWidth = '40vw';
                shopnote.style.maxHeight = '40vh';
                shopnote.style.margin = '0 auto';
                shopnote.style.cursor = 'pointer';

                // Add elements to popup
                popup.appendChild(shopnote);
                document.body.appendChild(popup);

                // Close popup when clicking the note
                shopnote.addEventListener('click', () => {
                    document.body.removeChild(popup);
                });
            });
            document.querySelector('.playfield').appendChild(shopnote2);
        }
    }

    clearLevelElements() {
        // Clear any existing interactable rectangles
        const existingRects = document.querySelectorAll('.interactable-rect');
        existingRects.forEach(rect => rect.remove());
        
        // Clear any existing buttons
        const existingButtons = document.querySelectorAll('.enter-town-btn, .continue-btn, .continue-deeper-btn, button[textContent="Back to Town"]');
        existingButtons.forEach(btn => btn.remove());
        
        // Clear any existing narration elements
        const existingNarration = document.querySelectorAll('.level17-narration, .level-narration');
        existingNarration.forEach(narration => narration.remove());
        
        // Clear any existing buy buttons
        const existingBuyButtons = document.querySelectorAll('.level17-buy-btn, .scroll-shop-buy-btn');
        existingBuyButtons.forEach(btn => btn.remove());

        // Clear any existing boardsd, boardsw, and shopnote2 images
        const existingBoardsd = document.querySelector('.boardsd-image');
        if (existingBoardsd) existingBoardsd.remove();
        const existingBoardsw = document.querySelector('.boardsw-image');
        if (existingBoardsw) existingBoardsw.remove();
        const existingShopnote2 = document.querySelector('.shopnote2-image');
        if (existingShopnote2) existingShopnote2.remove();

        // Clear Mountain Pass and Embervault text
        document.querySelectorAll('.mountain-pass-title, .embervault-title').forEach(el => el.remove());

        // Clear any Garrick images
        const playfield = document.querySelector('.playfield');
        if (playfield) {
            const garrickElements = playfield.querySelectorAll('div[style*="garricktied.png"], div[style*="garricknorm.png"]');
            garrickElements.forEach(el => el.remove());
        }

        // Clear enemy-side element
        const enemySide = document.querySelector('.enemy-side');
        if (enemySide) {
            while (enemySide.firstChild) {
                enemySide.removeChild(enemySide.firstChild);
            }
        }

        // Clean up enemy animations and references
        if (this.game.enemies) {
            this.game.enemies.forEach(enemy => {
                if (enemy.animationInterval) {
                    clearInterval(enemy.animationInterval);
                }
                if (enemy.element && enemy.element.parentNode) {
                    enemy.element.parentNode.removeChild(enemy.element);
                }
            });
            this.game.enemies = []; // Clear the enemies array
        }
    }

    setBackground(level) {
        const playfield = document.querySelector('.playfield');
        if (!playfield) return;
        
        // Reset background properties
        playfield.style.backgroundImage = '';
        playfield.style.backgroundSize = '';
        playfield.style.backgroundPosition = '';
        playfield.style.backgroundRepeat = '';
        
        if (level === 1) {
            playfield.style.backgroundImage = "url('./assets/Images/gy.png')";
        } else if (level === 2) {
            playfield.style.backgroundImage = "url('./assets/Images/graveyard2.png')";
        } else if (level === 3) {
            playfield.style.backgroundImage = "url('./assets/Images/graveyard3.png')";
        } else if (level === 4) {
            playfield.style.backgroundImage = "url('./assets/Images/forest.png')";
        } else if (level === 5) {
            playfield.style.backgroundImage = "url('./assets/Images/forest2.png')";
        } else if (level === 6) {
            playfield.style.backgroundImage = "url('./assets/Images/forest3.png')";
        } else if (level === 7) {
            playfield.style.backgroundImage = "url('./assets/Images/forest5.png')";
        } else if (level === 8) {
            playfield.style.backgroundImage = "url('./assets/Images/ftown.png')";
        } else if (level === 9) {
            playfield.style.backgroundImage = "url('./assets/Images/level9.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 10) {
            playfield.style.backgroundImage = "url('./assets/Images/innnight.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 11) {
            playfield.style.backgroundImage = "url('./assets/Images/innkeeper.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 12) {
            playfield.style.backgroundImage = "url('./assets/Images/innroom.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 13) {
            playfield.style.backgroundImage = "url('./assets/Images/roomday.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 14) {
            playfield.style.backgroundImage = "url('./assets/Images/innkeeper2.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 15) {
            playfield.style.backgroundImage = "url('./assets/Images/innday.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 16) {
            playfield.style.backgroundImage = "url('./assets/Images/townday.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 17) {
            playfield.style.backgroundImage = "url('./assets/Images/townnight.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 18) {
            playfield.style.backgroundImage = "url('./assets/Images/townday.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 19) {
            playfield.style.backgroundImage = "url('./assets/Images/townnight.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 20) {
            playfield.style.backgroundImage = "url('./assets/Images/level20.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 21) {
            playfield.style.backgroundImage = "url('./assets/Images/level21.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 22) {
            playfield.style.backgroundImage = "url('./assets/Images/level22.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 23) {
            playfield.style.backgroundImage = "url('./assets/Images/level23.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 24) {
            playfield.style.backgroundImage = "url('./assets/Images/level24.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 25) {
            playfield.style.backgroundImage = "url('./assets/Images/level25.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        } else if (level === 26) {
            playfield.style.backgroundImage = "url('./assets/Images/townday.png')";
            playfield.style.backgroundSize = 'cover';
            playfield.style.backgroundPosition = 'center';
            playfield.style.backgroundRepeat = 'no-repeat';
        }
    }

    setMusicAndNarration(level) {
        if (level === 5) {
            // Start forestmusic.mp3 as new background music
            this.game.soundManager.playMusic('./assets/Audio/forestmusic.mp3', 0.5, true);
            
            // Play appropriate narration based on player class
            if (this.game.playerClass === 'mage') {
                this.game.soundManager.playNarration('forestnar', 0.5);
            } else if (this.game.playerClass === 'warrior') {
                this.game.soundManager.playNarration('warforest', 0.5);
            }
            
            // Add click handler to fade out narration
            const playfield = document.querySelector('.playfield');
            if (playfield) {
                const clickHandler = () => {
                    this.game.soundManager.fadeOutNarration();
                    playfield.removeEventListener('click', clickHandler);
                };
                playfield.addEventListener('click', clickHandler);
            }
        } else if (level === 8) {
            // Let existing forest music continue playing
            // Play forest exit narration and show enter town button
            const audio = this.game.soundManager.sounds.get('forestexit');
            if (audio) {
                audio.volume = 0.7;
                audio.currentTime = 0;
                audio.play().catch(() => {});
                audio.onended = () => {
                    this.game.showEnterTownButton();
                };
            } else {
                setTimeout(() => this.game.showEnterTownButton(), 3000);
            }
        } else if (level === 9) {
            // Stop any existing music
            this.game.soundManager.stopMusic(false);
            
            // Play nighttown.mp3 as new background music
            const nighttownMusic = this.game.soundManager.sounds.get('nighttown');
            if (nighttownMusic) {
                nighttownMusic.loop = true;
                nighttownMusic.volume = 0.5;
                nighttownMusic.play().catch(() => {});
                this.game.soundManager.currentMusic = nighttownMusic;
            }
            
            // Handle the narration
            if (this.game.previousLevel !== 10) {
                // Disable all interactions
                const gameScene = document.querySelector('.game-scene');
                if (gameScene) {
                    gameScene.style.pointerEvents = 'none';
                }
                
                // Play the narration and re-enable interactions when it's done
                const townNarration = this.game.soundManager.sounds.get('townnar');
                if (townNarration) {
                    townNarration.volume = 0.7;
                    townNarration.currentTime = 0;
                    townNarration.play().then(() => {
                        townNarration.onended = () => {
                            // Re-enable interactions when narration is done
                            if (gameScene) {
                                gameScene.style.pointerEvents = 'auto';
                            }
                        };
                    }).catch(() => {
                        // If autoplay is prevented, re-enable interactions
                        if (gameScene) {
                            gameScene.style.pointerEvents = 'auto';
                        }
                    });
                } else {
                    // If narration fails to load, re-enable interactions
                    if (gameScene) {
                        gameScene.style.pointerEvents = 'auto';
                    }
                }
            }
        } else if (level === 10) {
            // No music changes needed for level 10
        } else if (level === 11) {
            // Stop any existing music immediately
            this.game.soundManager.stopMusic(false);
            // Play inn.mp3 as new background music
            this.game.soundManager.playMusic('./assets/Audio/inn.mp3', 0.5, true);
        } else if (level === 15) {
            // If coming from level 19, stop mountain.mp3 and play townday.mp3
            if (this.game.previousLevel === 19) {
                // Stop mountain.mp3
                const mountainMusic = this.game.soundManager.sounds.get('mountain');
                if (mountainMusic) {
                    mountainMusic.pause();
                    mountainMusic.currentTime = 0;
                }
                
                // Stop any other music that might be playing
                this.game.soundManager.stopMusic(false);
                
                // Clear the current music reference
                this.game.soundManager.currentMusic = null;
                
                // Start townday.mp3 as new background music
                const towndayMusic = this.game.soundManager.sounds.get('townday');
                if (towndayMusic) {
                    towndayMusic.loop = true;
                    towndayMusic.volume = 0.5;
                    towndayMusic.play().catch(() => {});
                    this.game.soundManager.currentMusic = towndayMusic;
                }
            }
        } else if (level === 17) {
            this.game.showLevel17Narration();
        } else if (level === 19) {
            // Force stop all music
            this.game.soundManager.stopMusic(false);
            
            // Explicitly stop and reset townday.mp3
            const towndayMusic = this.game.soundManager.sounds.get('townday');
            if (towndayMusic) {
                towndayMusic.pause();
                towndayMusic.currentTime = 0;
                towndayMusic.loop = false;
            }
            
            // Clear any existing music reference
            this.game.soundManager.currentMusic = null;
            
            // Small delay before starting new music
            setTimeout(() => {
                this.game.soundManager.playMusic('./assets/Audio/mountain.mp3', 0.5, true);
            }, 100);

            // Play mountainnar.mp3 after 1 second
            setTimeout(() => {
                const mountainNarration = this.game.soundManager.sounds.get('mountainnar');
                if (mountainNarration) {
                    mountainNarration.volume = 0.7;
                    mountainNarration.currentTime = 0;
                    mountainNarration.play().then(() => {
                        mountainNarration.onended = () => {
                            // Function to create and position the continue button
                            const createContinueButton = () => {
                                // Remove any existing button
                                const existingBtn = document.querySelector('.level19-continue-btn');
                                if (existingBtn) {
                                    existingBtn.remove();
                                }

                                const continueBtn = document.createElement('button');
                                continueBtn.textContent = 'Continue';
                                continueBtn.className = 'level19-continue-btn';
                                
                                // Apply styles directly
                                Object.assign(continueBtn.style, {
                                    position: 'absolute',
                                    bottom: '250px',
                                    left: '75%',
                                    transform: 'translateX(-50%)',
                                    padding: '12px 24px',
                                    fontSize: '1.2em',
                                    background: 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)',
                                    color: '#b6ffb6',
                                    border: '2px solid #39ff14',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontFamily: 'Cinzel, Times New Roman, serif',
                                    boxShadow: '0 0 16px 4px #39ff1466, 0 4px 16px rgba(0,0,0,0.7)',
                                    zIndex: '1000'
                                });

                                // Add hover effects
                                continueBtn.addEventListener('mouseenter', () => {
                                    continueBtn.style.boxShadow = '0 0 24px 8px #39ff14cc, 0 4px 24px rgba(0,0,0,0.8)';
                                    continueBtn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
                                });
                                
                                continueBtn.addEventListener('mouseleave', () => {
                                    continueBtn.style.boxShadow = '0 0 16px 4px #39ff1466, 0 4px 16px rgba(0,0,0,0.7)';
                                    continueBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                                    continueBtn.style.color = '#b6ffb6';
                                });
                                
                                // Add click handler to transition to level 20
                                continueBtn.addEventListener('click', () => {
                                    continueBtn.remove();
                                    
                                    // Get the mage element
                                    const mage = document.querySelector('.player-character');
                                    if (mage) {
                                        // Start the run animation
                                        this.game.playerCharacter.playRunAnimation();
                                        
                                        // Play running sound
                                        const runningSound = this.game.soundManager.sounds.get('running');
                                        if (runningSound) {
                                            runningSound.currentTime = 0;
                                            runningSound.volume = 0.5;
                                            runningSound.loop = true;
                                            runningSound.play().catch(() => {});
                                        }
                                        
                                        // Animate mage moving right
                                        mage.style.transition = 'transform 4s ease-out';
                                        mage.style.transform = 'translateX(1200px)';
                                        
                                        // Wait for animation to complete before transitioning
                                        setTimeout(() => {
                                            // Stop running sound
                                            if (runningSound) {
                                                runningSound.pause();
                                                runningSound.currentTime = 0;
                                            }
                                            
                                            // Play level20.mp3
                                            const level20Music = this.game.soundManager.sounds.get('level20');
                                            if (level20Music) {
                                                level20Music.volume = 0.5;
                                                level20Music.currentTime = 0;
                                                level20Music.play().catch(() => {});
                                            }
                                            
                                            this.game.currentLevel = 20;
                                            this.game.startNextLevel();
                                        }, 4000);
                                    } else {
                                        // If mage element not found, transition immediately
                                        this.game.currentLevel = 20;
                                        this.game.startNextLevel();
                                    }
                                });

                                const playfield = document.querySelector('.playfield');
                                if (playfield) {
                                    playfield.appendChild(continueBtn);
                                } else {
                                    document.body.appendChild(continueBtn);
                                }

                                return continueBtn;
                            };

                            // Create the button
                            createContinueButton();
                        };
                    }).catch(() => {
                        console.error('Error playing mountain narration');
                    });
                }
            }, 1000);
        } else if (level === 26) {
            // Stop any existing music
            this.game.soundManager.stopMusic(false);
            
            // Play townday.mp3 as new background music
            this.game.soundManager.playMusic('./assets/Audio/townday.mp3', 0.5, true);
        }
    }

    spawnEnemies(level) {
        if (level === 1) {
            runLevel1(this.game);
        } else if (level === 2) {
            runLevel2(this.game);
        } else if (level === 3) {
            runLevel3(this.game);
        } else if (level === 4) {
            runLevel4(this.game);
        } else if (level === 5) {
            runLevel5(this.game);
        } else if (level === 6) {
            runLevel6(this.game);
        } else if (level === 7) {
            runLevel7(this.game);
        } else if (level === 8) {
            runLevel8(this.game);
        } else if (level === 9) {
            runLevel9(this.game);
        } else if (level === 10) {
            runLevel10(this.game);
        } else if (level === 11) {
            runLevel11(this.game);
        } else if (level === 12) {
            runLevel12(this.game);
        } else if (level === 13) {
            runLevel13(this.game);
        } else if (level === 14) {
            runLevel14(this.game);
        } else if (level === 15) {
            runLevel15(this.game);
        } else if (level === 16) {
            runLevel16(this.game);
        } else if (level === 17) {
            runLevel17(this.game);
        } else if (level === 18) {
            runLevel18(this.game);
        } else if (level === 19) {
            runLevel19(this.game);
        } else if (level === 20) {
            runLevel20(this.game);
        } else if (level === 21) {
            runLevel21(this.game);
        } else if (level === 22) {
            runLevel22(this.game);
        } else if (level === 23) {
            runLevel23(this.game);
        } else if (level === 24) {
            runLevel24(this.game);
        } else if (level === 25) {
            runLevel25(this.game);
        } else if (level === 26) {
            runLevel26(this.game);
        } else {
            // Default: no enemies
        }
    }

    handleLevelTransition() {
        // Remove any existing level transition overlay
        const existingOverlay = document.querySelector('.level-transition-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Remove Mountain Pass and Embervault text if transitioning from level 20
        if (this.game.currentLevel === 20) {
            document.querySelectorAll('.mountain-pass-title, .embervault-title').forEach(el => el.remove());
        }

        // Create the overlay
        const overlay = document.createElement('div');
        overlay.className = 'level-transition-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease-in-out';

        const levelText = document.createElement('div');
        levelText.style.color = 'white';
        levelText.style.fontSize = '48px';
        levelText.style.fontFamily = 'Arial, sans-serif';
        levelText.style.textAlign = 'center';

        if (this.game.currentLevel < this.game.maxLevel) {
            levelText.textContent = `Level ${this.game.currentLevel + 1}`;
        } else {
            levelText.textContent = 'Victory!';
        }

        overlay.appendChild(levelText);
        document.body.appendChild(overlay);

        // Fade in the overlay
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        // After a shorter delay, proceed to next level or show victory
        setTimeout(() => {
            if (this.game.currentLevel < this.game.maxLevel) {
                this.game.currentLevel++;
                this.game.startNextLevel();
            } else {
                this.game.showVictoryScreen();
            }

            // Remove the overlay with a fade out
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                this.game.isLevelTransitioning = false;
                // Re-enable game interactions
                const gameScene = document.querySelector('.game-scene');
                if (gameScene) {
                    gameScene.style.pointerEvents = 'auto';
                }
            }, 500);
        }, 1000);
    }
} 