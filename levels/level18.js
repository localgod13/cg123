// Level 18: Merchant scene (no player, no enemies)
import { Scroll } from '../scroll.js';

export function runLevel18(game) {
    localStorage.setItem('level18_hmr_log', 'START: ' + new Date().toISOString());
    // Remove player and enemy sides
    const playerSide = document.querySelector('.player-side');
    if (playerSide) playerSide.innerHTML = '';
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    // Remove any existing inn/town door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    // Remove any existing boardsd, boardsw, and shopnote2 images
    document.querySelectorAll('.boardsd-image').forEach(el => el.remove());
    document.querySelectorAll('.boardsw-image').forEach(el => el.remove());
    document.querySelectorAll('.shopnote2-image').forEach(el => el.remove());
    // Set background to smerch.png
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.style.backgroundImage = 'url("./assets/Images/smerch.png")';
        playfield.style.backgroundSize = 'cover';
        playfield.style.backgroundPosition = 'center';
        playfield.style.backgroundRepeat = 'no-repeat';
    }

    // Add scroll shop dialogue box
    const dialogueBox = document.createElement('div');
    dialogueBox.className = 'scroll-shop-dialogue';
    dialogueBox.style.position = 'fixed';
    dialogueBox.style.top = '60px';
    dialogueBox.style.left = '62%';
    dialogueBox.style.transform = 'translateX(-40%)';
    dialogueBox.style.background = 'rgba(30,30,30,0.97)';
    dialogueBox.style.border = '2.5px solid #39ff14';
    dialogueBox.style.borderRadius = '14px';
    dialogueBox.style.padding = '18px 18px 16px 18px';
    dialogueBox.style.color = '#b6ffb6';
    dialogueBox.style.fontFamily = 'Cinzel, Times New Roman, serif';
    dialogueBox.style.fontSize = '1.08em';
    dialogueBox.style.zIndex = '4000';
    dialogueBox.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.8)';
    dialogueBox.style.maxWidth = '410px';
    dialogueBox.style.textAlign = 'center';
    dialogueBox.innerHTML = `
        <div style="margin-bottom: 12px; font-size: 1.1em; color: #39ff14;">Scroll Merchant</div>
        <div class="typewriter-narration" style="margin-bottom: 12px; min-height: 80px;"></div>
        <div style="display: flex; justify-content: center; gap: 10px;">
        <button style="margin-top: 8px; padding: 8px 24px; font-size: 1em; background: linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%); color: #b6ffb6; border: 2px solid #39ff14; border-radius: 8px; cursor: pointer; font-family: Cinzel, Times New Roman, serif; display:none;">Continue</button>
            <button style="margin-top: 8px; padding: 8px 24px; font-size: 1em; background: linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%); color: #b6ffb6; border: 2px solid #39ff14; border-radius: 8px; cursor: pointer; font-family: Cinzel, Times New Roman, serif; display:none;">Ask about the Master Smith</button>
        </div>
    `;
    const continueBtn = dialogueBox.querySelector('button:first-child');
    const askBtn = dialogueBox.querySelector('button:last-child');
    continueBtn.onclick = () => {
        // Check if we're showing the Garrick dialogue
        const target = dialogueBox.querySelector('.typewriter-narration');
        if (target.textContent.includes("Still no sign of Garrick")) {
            // Fade out the scrollv2 sound using the sound manager
            if (game.soundManager) {
                game.soundManager.fadeOutNarration();
            }
            
            // Add the new quest
            game.questManager.addQuest(
                'garricks_trail',
                "Garrick's Trail",
                "Garrick is overdue from his supply run to the mountain pass. Investigate his disappearance."
            );
        }
        dialogueBox.remove();
        // Add Buy Scrolls button
        const buyBtn = document.createElement('button');
        buyBtn.className = 'scroll-shop-buy-btn';
        buyBtn.textContent = 'Buy Scrolls';
        buyBtn.style.position = 'fixed';
        buyBtn.style.top = '60px';
        buyBtn.style.left = '62%';
        buyBtn.style.transform = 'translateX(-40%)';
        buyBtn.style.padding = '18px 36px';
        buyBtn.style.fontSize = '1.3em';
        buyBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
        buyBtn.style.color = '#b6ffb6';
        buyBtn.style.border = '2px solid #39ff14';
        buyBtn.style.borderRadius = '16px';
        buyBtn.style.cursor = 'pointer';
        buyBtn.style.zIndex = '4000';
        buyBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
        buyBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
        buyBtn.style.letterSpacing = '1px';
        buyBtn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        buyBtn.addEventListener('mouseenter', () => {
            buyBtn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
            buyBtn.style.background = 'linear-gradient(135deg, #2a3a2a 60%, #3e5d3e 100%)';
            buyBtn.style.color = '#fff6ea';
        });
        buyBtn.addEventListener('mouseleave', () => {
            buyBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
            buyBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
            buyBtn.style.color = '#b6ffb6';
        });
        buyBtn.addEventListener('click', () => {
            buyBtn.remove();
            // Open scroll shop
            const itemsForSale = [
                { name: 'Scroll of Echoing Fury', icon: './assets/Images/bpackscroll.png', price: 25, type: 'echoingFury' },
                { name: 'Scroll of Unbroken Ward', icon: './assets/Images/bpackscroll.png', price: 30, type: 'unbrokenWard' },
                { name: 'Scroll of Temporal Grace', icon: './assets/Images/bpackscroll.png', price: 35, type: 'temporalGrace' },
                { name: 'Scroll of Arcane Debt', icon: './assets/Images/bpackscroll.png', price: 20, type: 'arcaneDebt' }
            ];
            // Get player's inventory
            const playerInventory = [];
            for (let i = 0; i < 16; i++) {
                const item = game.backpack.items[i];
                if (item) {
                    if (item instanceof Scroll) {
                        playerInventory.push({
                            name: item.getDisplayName(),
                            icon: item.imagePath,
                            price: Math.floor(item.price * 0.5), // Sell for half price
                            type: item.type,
                            slot: i
                        });
                    } else if (item.type === 'health') {
                        playerInventory.push({
                            name: 'Health Potion',
                            icon: './assets/Images/healthpotion.png',
                            price: 5,
                            type: 'healthpotion',
                            slot: i
                        });
                    } else if (item.type === 'mana') {
                        playerInventory.push({
                            name: 'Mana Potion',
                            icon: './assets/Images/manapotion.png',
                            price: 6,
                            type: 'manapotion',
                            slot: i
                        });
                    }
                }
            }
            game.store.open(itemsForSale, playerInventory);
            // Hide back button when store is open
            const backBtn = document.querySelector('.merchant-back-btn');
            if (backBtn) backBtn.style.display = 'none';
            
            // Re-show the button after store closes
            const origClose = game.store.close.bind(game.store);
            game.store.close = () => {
                origClose();
                // Show back button when store is closed
                const backBtn = document.querySelector('.merchant-back-btn');
                if (backBtn) backBtn.style.display = 'block';
                
                // Only re-show the button if we're still on level 18
                if (game.currentLevel === 18) {
                    setTimeout(() => {
                        const newBuyBtn = document.createElement('button');
                        newBuyBtn.className = 'scroll-shop-buy-btn';
                        newBuyBtn.textContent = 'Buy Scrolls';
                        newBuyBtn.style.position = 'fixed';
                        newBuyBtn.style.top = '60px';
                        newBuyBtn.style.left = '62%';
                        newBuyBtn.style.transform = 'translateX(-40%)';
                        newBuyBtn.style.padding = '18px 36px';
                        newBuyBtn.style.fontSize = '1.3em';
                        newBuyBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                        newBuyBtn.style.color = '#b6ffb6';
                        newBuyBtn.style.border = '2px solid #39ff14';
                        newBuyBtn.style.borderRadius = '16px';
                        newBuyBtn.style.cursor = 'pointer';
                        newBuyBtn.style.zIndex = '4000';
                        newBuyBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
                        newBuyBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
                        newBuyBtn.style.letterSpacing = '1px';
                        newBuyBtn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
                        newBuyBtn.addEventListener('mouseenter', () => {
                            newBuyBtn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
                            newBuyBtn.style.background = 'linear-gradient(135deg, #2a3a2a 60%, #3e5d3e 100%)';
                            newBuyBtn.style.color = '#fff6ea';
                        });
                        newBuyBtn.addEventListener('mouseleave', () => {
                            newBuyBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
                            newBuyBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                            newBuyBtn.style.color = '#b6ffb6';
                        });
                        newBuyBtn.addEventListener('click', () => {
                            newBuyBtn.remove();
                            game.store.open(itemsForSale, playerInventory);
                            // Hide back button when store is open
                            const backBtn = document.querySelector('.merchant-back-btn');
                            if (backBtn) backBtn.style.display = 'none';
                            
                            // Re-show the button after store closes
                            const origCloseInner = game.store.close.bind(game.store);
                            game.store.close = () => {
                                origCloseInner();
                                // Show back button when store is closed
                                const backBtn = document.querySelector('.merchant-back-btn');
                                if (backBtn) backBtn.style.display = 'block';
                                
                                if (game.currentLevel === 18) {
                                    setTimeout(() => {
                                        if (!document.querySelector('.scroll-shop-buy-btn')) {
                                            document.body.appendChild(newBuyBtn);
                                        }
                                    }, 100);
                                }
                            };
                        });
                        if (!document.querySelector('.scroll-shop-buy-btn')) {
                            document.body.appendChild(newBuyBtn);
                        }
                    }, 100);
                }
            };
        });
        document.body.appendChild(buyBtn);
    };
    askBtn.onclick = () => {
        // Play scrollv2 sound using narration system
        if (game.soundManager) {
            game.soundManager.playNarration('scrollv2', 0.7);
        }

        const target = dialogueBox.querySelector('.typewriter-narration');
        target.textContent = "Still no sign of Garrick... It's been five days since he set out for the mountain pass. Said he'd be back in three.\"\n\n\"We're starting to get concerned. He's no stranger to danger, but disappearing like this? That's not like him. If your path leads that way, maybe see if you can find him.";
        continueBtn.style.display = 'inline-block';
        askBtn.style.display = 'none';

        // Complete the "Speak to the Shop Keepers" quest
        game.questManager.completeQuest('shopkeepers_quest');

        // Add the new "Search for Garrick" quest with a proper quest ID
        game.questManager.addQuest(
            'garricks_trail',
            "Garrick's Trail",
            "The scroll merchant mentioned that Garrick has been missing for five days after heading to the mountain pass. Investigate his disappearance."
        );
    };
    document.body.appendChild(dialogueBox);
    const text = "Ink and incantation await. Browse carefully — some of these scrolls bite back.";
    const target = dialogueBox.querySelector('.typewriter-narration');
    let finished = false;
    let timeoutId = null;
    const typewriter = (i = 0) => {
        if (finished) return;
        if (i <= text.length) {
            target.textContent = text.slice(0, i);
            let delay = 55;
            const prevChar = text[i - 1];
            if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
                delay = 400;
            }
            timeoutId = setTimeout(() => typewriter(i + 1), delay);
        } else {
            finished = true;
            continueBtn.style.display = 'inline-block';
            // Only show the ask button if the Garrick's Trail quest doesn't exist
            if (!game.questManager.quests.has('garricks_trail')) {
                askBtn.style.display = 'inline-block';
            }
        }
    };
    typewriter();
    // Allow click to finish instantly
    dialogueBox.onclick = () => {
        if (!finished) {
            finished = true;
            clearTimeout(timeoutId);
            target.textContent = text;
            continueBtn.style.display = 'inline-block';
            // Only show the ask button if the Garrick's Trail quest doesn't exist
            if (!game.questManager.quests.has('garricks_trail')) {
                askBtn.style.display = 'inline-block';
            }
        }
    };

    // Play scroll sound when dialogue box appears
    if (game.soundManager) {
        game.soundManager.playSound('scrollv1', 0.7);
    }

    // Remove any existing back button to prevent duplicates
    const oldBackBtn = playfield ? playfield.querySelector('.merchant-back-btn') : null;
    if (oldBackBtn) oldBackBtn.remove();
    // Add 'Back to Town' button in the bottom left corner
    const backBtn = document.createElement('button');
    backBtn.className = 'merchant-back-btn';
    backBtn.textContent = 'Back to Town';
    backBtn.style.position = 'absolute';
    backBtn.style.left = '32px';
    backBtn.style.bottom = '32px';
    backBtn.style.padding = '18px 36px';
    backBtn.style.fontSize = '1.3em';
    backBtn.style.background = 'linear-gradient(135deg, #2a1a1a 60%, #4d2e2e 100%)';
    backBtn.style.color = '#ffe6b6';
    backBtn.style.border = '2px solid #ffb639';
    backBtn.style.borderRadius = '16px';
    backBtn.style.cursor = 'pointer';
    backBtn.style.zIndex = '4000';
    backBtn.style.boxShadow = '0 0 24px 4px #ffb63966, 0 4px 24px rgba(0,0,0,0.7)';
    backBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
    backBtn.style.letterSpacing = '1px';
    backBtn.style.textShadow = '0 0 8px #ffb639, 0 2px 2px #000';
    backBtn.addEventListener('mouseenter', () => {
        backBtn.style.boxShadow = '0 0 32px 8px #ffb639cc, 0 4px 32px rgba(0,0,0,0.8)';
        backBtn.style.background = 'linear-gradient(135deg, #332222 60%, #6d3e3e 100%)';
        backBtn.style.color = '#fff6ea';
    });
    backBtn.addEventListener('mouseleave', () => {
        backBtn.style.boxShadow = '0 0 24px 4px #ffb63966, 0 4px 24px rgba(0,0,0,0.7)';
        backBtn.style.background = 'linear-gradient(135deg, #2a1a1a 60%, #4d2e2e 100%)';
        backBtn.style.color = '#ffe6b6';
    });
    backBtn.addEventListener('click', () => {
        // Remove all UI elements
        const dialogueBox = document.querySelector('.scroll-shop-dialogue');
        if (dialogueBox) dialogueBox.remove();
        
        const buyBtn = document.querySelector('.scroll-shop-buy-btn');
        if (buyBtn) buyBtn.remove();
        
        backBtn.remove();
        
        // Transition to next level
        game.previousLevel = 18;
        game.currentLevel = 16;
        game.startNextLevel();
    });
    if (playfield) playfield.appendChild(backBtn);
    // No player character, no enemies, no UI elements
    localStorage.setItem('level18_hmr_log', 'END: ' + new Date().toISOString());
} 