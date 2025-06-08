export class QuestManager {
    constructor(game) {
        this.game = game;
        this.quests = new Map();
        this.questLogElement = null;
        this.isQuestLogVisible = false;
        this.toggleButton = null;
        this.buttonId = 'quest-toggle-' + Date.now();
        this.detailedQuestView = null;
        this.hasNewQuests = false;
        this.hasCompletedQuests = false;
        
        // Load saved quests from localStorage
        this.loadQuests();
        
        // Initialize quest log immediately
        this.initializeQuestLog();
        
        // Preload images in the background
        this.preloadImages().catch(error => {
            console.error('Failed to preload quest images:', error);
        });

        // Add to game's DOM elements set to prevent cleanup
        if (this.game.domElements) {
            this.game.domElements.add(this.questLogElement);
            this.game.domElements.add(this.toggleButton);
        }

        // Initially hide the quest log
        if (this.toggleButton) {
            this.toggleButton.style.display = 'none';
        }
        if (this.questLogElement) {
            this.questLogElement.style.display = 'none';
        }

        // Add observer to watch for game scene visibility changes
        this.observer = new MutationObserver(() => {
            this.updateQuestLogVisibility();
        });

        // Start observing the game scene
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            this.observer.observe(gameScene, {
                attributes: true,
                attributeFilter: ['style']
            });
        }
    }

    async preloadImages() {
        const images = [
            { id: 'smedium', path: './assets/Images/smedium.png' },
            { id: 'sclosed', path: './assets/Images/sclosed.png' }
        ];

        const loadPromises = images.map(img => {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(img.id);
                image.onerror = () => reject(new Error(`Failed to load image: ${img.path}`));
                image.src = img.path;
            });
        });

        await Promise.all(loadPromises);
    }

    initializeQuestLog() {
        // Only cleanup if elements already exist
        if (this.questLogElement || this.toggleButton) {
            this.cleanup();
        }

        // Add keyframes for the glowing animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glowPulse {
                0% { color: #FF0000; text-shadow: 0 0 5px #FF0000, 0 0 10px #FF0000; }
                50% { color: #FFD700; text-shadow: 0 0 5px #FFD700, 0 0 10px #FFD700; }
                100% { color: #FF0000; text-shadow: 0 0 5px #FF0000, 0 0 10px #FF0000; }
            }
            @keyframes pulse {
                0% { transform: scale(1); filter: drop-shadow(0 0 5px #FFD700); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 15px #FFD700); }
                100% { transform: scale(1); filter: drop-shadow(0 0 5px #FFD700); }
            }
            @keyframes completedPulse {
                0% { transform: scale(1); filter: drop-shadow(0 0 5px #39ff14); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 15px #39ff14); }
                100% { transform: scale(1); filter: drop-shadow(0 0 5px #39ff14); }
            }
        `;
        document.head.appendChild(style);

        // Create quest log container
        this.questLogElement = document.createElement('div');
        this.questLogElement.className = 'quest-log';
        this.questLogElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 600px;
            background-image: url('./assets/Images/smedium.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            padding: 130px 40px 60px 40px;
            color: #000;
            font-family: 'MedievalSharp', cursive;
            z-index: 5000;
            display: none;
            cursor: pointer;
        `;

        // Add click event to close quest log when clicking anywhere on the scroll
        this.questLogElement.addEventListener('click', (event) => {
            // Only close if clicking directly on the scroll background
            if (event.target === this.questLogElement) {
                this.toggleQuestLog();
            }
        });

        // Create quest log header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 10px;
            pointer-events: none;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Quest Log';
        title.style.margin = '0';
        title.style.color = '#000';
        title.style.textAlign = 'center';
        title.style.width = '100%';
        title.style.fontSize = '24px';
        title.style.pointerEvents = 'none';

        // Add Completed button
        const completedButton = document.createElement('button');
        completedButton.textContent = 'Completed';
        completedButton.style.cssText = `
            background: linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%);
            color: #b6ffb6;
            border: 2px solid #39ff14;
            border-radius: 8px;
            padding: 8px 16px;
            cursor: pointer;
            font-family: 'MedievalSharp', cursive;
            font-size: 14px;
            pointer-events: auto;
            transition: all 0.2s ease;
        `;
        completedButton.onmouseover = () => {
            completedButton.style.background = 'linear-gradient(135deg, #2a3a2a 60%, #3e5d3e 100%)';
            completedButton.style.color = '#fff6ea';
            completedButton.style.boxShadow = '0 0 12px 2px #39ff1466';
        };
        completedButton.onmouseout = () => {
            completedButton.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
            completedButton.style.color = '#b6ffb6';
            completedButton.style.boxShadow = 'none';
        };
        completedButton.onclick = () => this.showCompletedQuests();

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #000;
            font-size: 24px;
            cursor: pointer;
            padding: 0 5px;
            position: absolute;
            top: 15px;
            right: 15px;
            pointer-events: auto;
        `;
        closeButton.onclick = (event) => {
            event.stopPropagation(); // Prevent the click from bubbling to the scroll
            this.toggleQuestLog();
        };

        header.appendChild(title);
        header.appendChild(completedButton);
        this.questLogElement.appendChild(closeButton);
        this.questLogElement.appendChild(header);

        // Create quest list container
        const questList = document.createElement('div');
        questList.className = 'quest-list';
        questList.style.cssText = `
            padding: 0 20px;
            height: calc(100% - 180px);
            overflow-y: auto;
            pointer-events: auto;
        `;
        this.questLogElement.appendChild(questList);

        // Add quest log to document
        document.body.appendChild(this.questLogElement);

        // Create and add toggle button
        this.toggleButton = document.createElement('img');
        this.toggleButton.id = this.buttonId;
        this.toggleButton.className = 'quest-log-toggle';
        this.toggleButton.src = './assets/Images/sclosed.png';
        this.toggleButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 200px;
            width: 100px;
            height: 50px;
            cursor: pointer;
            z-index: 1000;
            transition: transform 0.2s ease;
            object-fit: contain;
            display: none;
        `;
        this.toggleButton.onmouseover = () => {
            this.toggleButton.style.transform = 'scale(1.1)';
        };
        this.toggleButton.onmouseout = () => {
            this.toggleButton.style.transform = 'scale(1)';
        };
        this.toggleButton.onclick = () => this.toggleQuestLog();
        document.body.appendChild(this.toggleButton);

        // Update display if there are any quests
        if (this.quests.size > 0) {
            this.updateQuestDisplay();
        }
    }

    toggleQuestLog() {
        this.isQuestLogVisible = !this.isQuestLogVisible;
        if (this.questLogElement) {
            this.questLogElement.style.display = this.isQuestLogVisible ? 'block' : 'none';
            this.updateQuestDisplay();
            
            // Reset the new quests and completed quests flags when opening the quest log
            if (this.isQuestLogVisible) {
                console.log('Quest Log Opened: Resetting glow states');
                this.hasNewQuests = false;
                this.hasCompletedQuests = false;
                this.updateToggleButtonAppearance();
            }
        }
    }

    loadQuests() {
        try {
            const savedQuests = localStorage.getItem('quests');
            if (savedQuests) {
                const questsArray = JSON.parse(savedQuests);
                if (Array.isArray(questsArray)) {
                    // Don't clear existing quests, just load saved ones
                    questsArray.forEach(quest => {
                        // Only load quests that haven't been loaded yet
                        if (!this.quests.has(quest.id)) {
                            this.quests.set(quest.id, {
                                title: quest.title,
                                description: quest.description,
                                isCompleted: quest.isCompleted,
                                timestamp: new Date(quest.timestamp)
                            });
                        }
                    });
                } else {
                    console.warn('Saved quests data is not in the expected array format');
                    // Clear invalid data
                    localStorage.removeItem('quests');
                }
            }
        } catch (error) {
            console.error('Error loading quests:', error);
            // Clear invalid data
            localStorage.removeItem('quests');
        }
        // Reset glow states after loading
        this.hasNewQuests = false;
        this.hasCompletedQuests = false;
        this.updateToggleButtonAppearance();
    }

    saveQuests() {
        const questsArray = Array.from(this.quests.entries()).map(([id, quest]) => ({
            id,
            title: quest.title,
            description: quest.description,
            isCompleted: quest.isCompleted,
            timestamp: quest.timestamp.toISOString()
        }));
        localStorage.setItem('quests', JSON.stringify(questsArray));
    }

    addQuest(questId, title, description, isCompleted = false) {
        // Check if quest already exists
        if (this.quests.has(questId)) {
            console.log(`Quest ${questId} already exists, not adding again`);
            return;
        }

        console.log(`Adding new quest: ${questId} - ${title}`);
        this.quests.set(questId, {
            title,
            description,
            isCompleted,
            timestamp: new Date()
        });
        
        // Save quests to localStorage
        this.saveQuests();
        
        // Set hasNewQuests to true and update the toggle button appearance
        this.hasNewQuests = true;
        this.updateToggleButtonAppearance();
        
        // Only update display if quest log is visible
        if (this.isQuestLogVisible) {
            this.updateQuestDisplay();
        }
    }

    updateToggleButtonAppearance() {
        if (!this.toggleButton) return;

        if (this.hasNewQuests) {
            console.log('Quest Log Glow Triggered: New Quest Added');
            this.toggleButton.style.filter = 'drop-shadow(0 0 10px #FFD700)';
            this.toggleButton.style.animation = 'pulse 1.5s infinite';
        } else if (this.hasCompletedQuests) {
            console.log('Quest Log Glow Triggered: Quest Completed');
            this.toggleButton.style.filter = 'drop-shadow(0 0 10px #39ff14)';
            this.toggleButton.style.animation = 'completedPulse 1.5s infinite';
        } else {
            console.log('Quest Log Glow Reset: No new quests or completions');
            this.toggleButton.style.filter = 'none';
            this.toggleButton.style.animation = 'none';
        }
    }

    completeQuest(questId) {
        const quest = this.quests.get(questId);
        if (quest) {
            console.log(`Completing quest: ${questId} - ${quest.title}`);
            quest.isCompleted = true;
            // Save quests to localStorage
            this.saveQuests();
            
            // Set hasCompletedQuests to true and update the toggle button appearance
            this.hasCompletedQuests = true;
            this.updateToggleButtonAppearance();
            
            // Only update display if quest log is visible
            if (this.isQuestLogVisible) {
                this.updateQuestDisplay();
            }
        } else {
            console.log(`Attempted to complete non-existent quest: ${questId}`);
        }
    }

    showDetailedQuestView(questId, quest) {
        // Remove existing detailed view if any
        if (this.detailedQuestView) {
            this.detailedQuestView.remove();
        }

        // Update quest status when dialogue is shown
        if (questId === 'inn_quest') {
            const updatedQuest = this.quests.get(questId);
            if (updatedQuest) {
                updatedQuest.description = "The innkeeper mentioned something about a secret door in the basement. I should investigate when I have time.";
                this.saveQuests();
            }
        }

        // Create detailed quest view
        this.detailedQuestView = document.createElement('div');
        this.detailedQuestView.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 600px;
            background-image: url('./assets/Images/smedium.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            padding: 130px 40px 60px 40px;
            color: #000;
            font-family: 'MedievalSharp', cursive;
            z-index: 5001;
            cursor: pointer;
        `;

        // Add click event to close detailed view
        this.detailedQuestView.addEventListener('click', () => {
            this.detailedQuestView.remove();
            this.detailedQuestView = null;
            // Update display after closing
            this.updateQuestDisplay();
        });

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            height: calc(100% - 180px);
            overflow-y: auto;
            pointer-events: none;
            padding: 0 20px;
        `;

        // Add quest title
        const title = document.createElement('h2');
        title.textContent = quest.title;
        title.style.cssText = `
            margin: 0 0 30px 0;
            color: #000;
            text-align: center;
            font-size: 24px;
            text-decoration: ${quest.isCompleted ? 'line-through' : 'none'};
            pointer-events: none;
        `;

        // Add quest description
        const description = document.createElement('p');
        description.textContent = quest.description;
        description.style.cssText = `
            margin: 0 0 30px 0;
            color: #000;
            font-size: 16px;
            line-height: 1.6;
            pointer-events: none;
        `;

        // Add quest status
        const status = document.createElement('p');
        status.textContent = `Status: ${quest.isCompleted ? 'Completed' : 'In Progress'}`;
        status.style.cssText = `
            margin: 0 0 30px 0;
            color: ${quest.isCompleted ? '#2E8B57' : '#8B4513'};
            font-size: 16px;
            font-weight: bold;
            pointer-events: none;
        `;

        // Add timestamp
        const timestamp = document.createElement('p');
        timestamp.textContent = `Started: ${quest.timestamp.toLocaleString()}`;
        timestamp.style.cssText = `
            margin: 0;
            color: #666;
            font-size: 14px;
            pointer-events: none;
        `;

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(status);
        content.appendChild(timestamp);
        this.detailedQuestView.appendChild(content);
        document.body.appendChild(this.detailedQuestView);
    }

    updateQuestDisplay() {
        if (!this.questLogElement) return;
        
        const questList = this.questLogElement.querySelector('.quest-list');
        if (!questList) return;
        
        questList.innerHTML = '';

        // Filter out completed quests and ensure we have valid quests
        const activeQuests = Array.from(this.quests.entries())
            .filter(([_, quest]) => !quest.isCompleted && quest.title && quest.description);

        if (activeQuests.length === 0) {
            const noQuests = document.createElement('p');
            noQuests.textContent = 'No active quests';
            noQuests.style.textAlign = 'center';
            noQuests.style.color = '#000';
            noQuests.style.fontSize = '16px';
            noQuests.style.pointerEvents = 'none';
            questList.appendChild(noQuests);
            return;
        }

        // Sort quests by timestamp (newest first)
        const sortedQuests = activeQuests
            .sort((a, b) => b[1].timestamp - a[1].timestamp);

        sortedQuests.forEach(([questId, quest]) => {
            // Skip if quest is missing required properties
            if (!quest.title || !quest.description) {
                console.warn(`Skipping quest ${questId} due to missing properties`);
                return;
            }

            const questElement = document.createElement('div');
            questElement.className = 'quest-item';
            questElement.style.cssText = `
                margin-bottom: 20px;
                padding: 5px;
                color: #000;
                pointer-events: none;
            `;

            const questTitle = document.createElement('h3');
            const bullet = document.createElement('span');
            bullet.textContent = '•';
            bullet.style.cssText = `
                cursor: pointer;
                pointer-events: auto;
                margin-right: 8px;
                font-size: 20px;
                animation: glowPulse 2s infinite;
                transition: transform 0.3s ease;
            `;
            bullet.onmouseover = () => {
                bullet.style.animation = 'none';
                bullet.style.color = '#FFD700';
                bullet.style.textShadow = '0 0 8px #FFD700, 0 0 15px #FFD700, 0 0 20px #FFD700';
                bullet.style.transform = 'scale(1.2)';
            };
            bullet.onmouseout = () => {
                bullet.style.animation = 'glowPulse 2s infinite';
                bullet.style.transform = 'scale(1)';
            };
            bullet.onclick = (event) => {
                event.stopPropagation();
                this.showDetailedQuestView(questId, quest);
            };

            const titleText = document.createElement('span');
            titleText.textContent = quest.title;
            titleText.style.cssText = `
                color: #000;
                text-decoration: ${quest.isCompleted ? 'line-through' : 'none'};
                font-size: 18px;
                pointer-events: none;
            `;

            questTitle.appendChild(bullet);
            questTitle.appendChild(titleText);
            questTitle.style.cssText = `
                margin: 0 0 8px 0;
                display: flex;
                align-items: center;
            `;

            const questDescription = document.createElement('p');
            questDescription.textContent = quest.description;
            questDescription.style.cssText = `
                margin: 0;
                color: #000;
                font-size: 14px;
                line-height: 1.4;
                pointer-events: none;
            `;

            questElement.appendChild(questTitle);
            questElement.appendChild(questDescription);
            questList.appendChild(questElement);
        });
    }

    cleanup() {
        // Stop observing
        if (this.observer) {
            this.observer.disconnect();
        }

        // Save quests before cleanup
        this.saveQuests();
        
        // Remove quest log element
        if (this.questLogElement && this.questLogElement.parentNode) {
            this.questLogElement.parentNode.removeChild(this.questLogElement);
            if (this.game.domElements) {
                this.game.domElements.delete(this.questLogElement);
            }
        }
        this.questLogElement = null;

        // Remove all quest toggle buttons
        const existingButtons = document.querySelectorAll('.quest-log-toggle');
        existingButtons.forEach(button => {
            button.remove();
            if (this.game.domElements) {
                this.game.domElements.delete(button);
            }
        });
        this.toggleButton = null;
    }

    initializeInnQuest() {
        // Only add the inn quest if we're at level 9 or higher
        if (this.game.currentLevel >= 9) {
            this.addQuest(
                'inn_quest',
                'Head to the Inn',
                'Visit the local inn to rest and gather information about your journey. The innkeeper might have valuable knowledge to share.'
            );
        }
    }

    // Add new method to show/hide quest log based on game state
    updateQuestLogVisibility() {
        if (!this.toggleButton) return;

        // Check if we're in a game level by looking for the game scene
        const gameScene = document.querySelector('.game-scene');
        const isInGame = gameScene && gameScene.style.display !== 'none';

        // Only show quest log during gameplay
        if (isInGame) {
            this.toggleButton.style.display = 'block';
        } else {
            // Hide both the toggle button and quest log
            this.toggleButton.style.display = 'none';
            if (this.questLogElement) {
                this.questLogElement.style.display = 'none';
            }
            this.isQuestLogVisible = false;
        }
    }

    // Add method to handle level changes
    onLevelChange(newLevel) {
        console.log(`Level Change to ${newLevel}: Starting quest updates`);
        
        // Load saved quests first
        this.loadQuests();
        
        let questsAdded = false;
        
        // Add Lurking Silence quest at level 5
        if (newLevel === 5) {
            if (!this.quests.has('lurking_silence')) {
                console.log('Level 5: Adding Lurking Silence quest');
                this.addQuest(
                    'lurking_silence',
                    'Lurking Silence',
                    'Something hunts in the dark. Make it to town before you\'re caught.'
                );
                questsAdded = true;
            }
        }
        
        // Initialize quests based on current level
        if (newLevel >= 9) {
            // Add the Inn quest if it doesn't exist
            if (!this.quests.has('inn_quest')) {
                console.log('Level 9+: Adding Inn quest');
                this.addQuest(
                    'inn_quest',
                    'Head to the Inn',
                    'Visit the local inn to rest and gather information about your journey. The innkeeper might have valuable knowledge to share.'
                );
                questsAdded = true;
            }
        }
            
        // Add Shopkeeper quest at level 16
        if (newLevel >= 16) {
            if (!this.quests.has('shopkeepers_quest')) {
                console.log('Level 16+: Adding Shopkeeper quest');
                this.addQuest(
                    'shopkeepers_quest',
                    'Speak to the Shop Keepers',
                    'Seek out the shopkeepers—one of them may hold a clue to the Mastersmith\'s fate.'
                );
                questsAdded = true;
            }
        }

        // Complete the inn quest when meeting the innkeeper (level 11)
        if (newLevel === 11) {
            console.log('Level 11: Checking Inn quest completion');
            const innQuest = this.quests.get('inn_quest');
            if (innQuest && !innQuest.isCompleted) {
                innQuest.description = "I've met the innkeeper. They've offered me a room for the night and mentioned something about a secret door in the basement.";
                this.completeQuest('inn_quest');
            }
        }

        // Ensure Garrick's Trail quest persists if it exists
        const garrickQuest = this.quests.get('garricks_trail');
        if (garrickQuest && !garrickQuest.isCompleted) {
            console.log('Ensuring Garrick\'s Trail quest persists');
            this.quests.set('garricks_trail', {
                title: "Garrick's Trail",
                description: "Garrick is overdue from his supply run to the mountain pass. Investigate his disappearance.",
                isCompleted: false,
                timestamp: garrickQuest.timestamp
            });
        }

        // Only update glow if new quests were added
        if (!questsAdded) {
            console.log('No new quests added during level change');
            this.hasNewQuests = false;
            this.updateToggleButtonAppearance();
        }
        
        // Update the quest display
        this.updateQuestDisplay();
        console.log('Level Change quest updates completed');
    }

    showCompletedQuests() {
        // Remove existing detailed view if any
        if (this.detailedQuestView) {
            this.detailedQuestView.remove();
        }

        // Create completed quests view
        this.detailedQuestView = document.createElement('div');
        this.detailedQuestView.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 600px;
            background-image: url('./assets/Images/smedium.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            padding: 130px 40px 60px 40px;
            color: #000;
            font-family: 'MedievalSharp', cursive;
            z-index: 5001;
            cursor: pointer;
        `;

        // Add click event to close completed quests view
        this.detailedQuestView.addEventListener('click', (event) => {
            // Only close if clicking directly on the scroll background
            if (event.target === this.detailedQuestView) {
                this.detailedQuestView.remove();
                this.detailedQuestView = null;
                // Update display after closing
                this.updateQuestDisplay();
            }
        });

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            height: calc(100% - 180px);
            overflow-y: auto;
            padding: 0 20px;
            pointer-events: auto;
        `;

        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Completed Quests';
        title.style.cssText = `
            margin: 0 0 30px 0;
            color: #000;
            text-align: center;
            font-size: 24px;
            pointer-events: none;
        `;

        content.appendChild(title);

        // Get completed quests
        const completedQuests = Array.from(this.quests.entries())
            .filter(([_, quest]) => quest.isCompleted)
            .sort((a, b) => b[1].timestamp - a[1].timestamp);

        if (completedQuests.length === 0) {
            const noQuests = document.createElement('p');
            noQuests.textContent = 'No completed quests';
            noQuests.style.textAlign = 'center';
            noQuests.style.color = '#000';
            noQuests.style.fontSize = '16px';
            noQuests.style.pointerEvents = 'none';
            content.appendChild(noQuests);
        } else {
            completedQuests.forEach(([questId, quest]) => {
                const questElement = document.createElement('div');
                questElement.style.cssText = `
                    margin-bottom: 20px;
                    padding: 10px;
                    background: rgba(57, 255, 20, 0.1);
                    border: 1px solid #39ff14;
                    border-radius: 8px;
                    pointer-events: none;
                `;

                const questTitle = document.createElement('h3');
                questTitle.textContent = quest.title;
                questTitle.style.cssText = `
                    margin: 0 0 8px 0;
                    color: #000;
                    font-size: 18px;
                    text-decoration: line-through;
                    pointer-events: none;
                `;

                const questDescription = document.createElement('p');
                questDescription.textContent = quest.description;
                questDescription.style.cssText = `
                    margin: 0 0 8px 0;
                    color: #000;
                    font-size: 14px;
                    line-height: 1.4;
                    pointer-events: none;
                `;

                const completionDate = document.createElement('p');
                completionDate.textContent = `Completed: ${quest.timestamp.toLocaleString()}`;
                completionDate.style.cssText = `
                    margin: 0;
                    color: #666;
                    font-size: 12px;
                    pointer-events: none;
                `;

                questElement.appendChild(questTitle);
                questElement.appendChild(questDescription);
                questElement.appendChild(completionDate);
                content.appendChild(questElement);
            });
        }

        this.detailedQuestView.appendChild(content);
        document.body.appendChild(this.detailedQuestView);
    }
} 