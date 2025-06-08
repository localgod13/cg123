export class LootManager {
    constructor(game) {
        this.game = game;
        this.lootTables = {
            // Enemy-specific loot tables
            skeleton: {
                common: ['healthpotion'],
                uncommon: ['fireball'],
                weights: { common: 80, uncommon: 20 }
            },
            executioner: {
                common: ['healthpotion', 'manapotion'],
                uncommon: ['shield', 'fireball'],
                weights: { common: 70, uncommon: 30 }
            },
            flyingeye: {
                common: ['manapotion'],
                uncommon: ['fireball', 'shield'],
                rare: ['meteor_strike'],
                weights: { common: 60, uncommon: 30, rare: 10 }
            },
            werewolf: {
                common: ['healthpotion'],
                uncommon: ['fireball', 'shield'],
                rare: ['inferno'],
                weights: { common: 50, uncommon: 35, rare: 15 }
            }
        };
    }

    generateLoot(enemies) {
        const loot = {
            items: [],
            gold: 0,
            experience: 0
        };

        // Generate loot based on enemies defeated
        enemies.forEach(enemy => {
            const enemyLoot = this.generateEnemyLoot(enemy);
            loot.items.push(...enemyLoot.items);
            loot.gold += enemyLoot.gold;
            loot.experience += enemyLoot.experience;
        });

        return loot;
    }

    generateEnemyLoot(enemy) {
        const loot = {
            items: [],
            gold: 0,
            experience: 0
        };

        // Get enemy's loot table
        const enemyType = (enemy.type || enemy.constructor?.name || '').toLowerCase();
        const lootTable = this.lootTables[enemyType];
        if (!lootTable) return loot;

        // Generate items based on rarity weights
        const rarity = this.rollRarity(lootTable.weights);
        if (rarity && lootTable[rarity]) {
            const possibleItems = lootTable[rarity];
            const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            loot.items.push(item);
        }

        // Generate gold and experience based on enemy type
        switch (enemyType) {
            case 'skeleton':
                loot.gold = Math.floor(Math.random() * 5) + 3;
                loot.experience = Math.floor(Math.random() * 10) + 5;
                break;
            case 'executioner':
                loot.gold = Math.floor(Math.random() * 8) + 5;
                loot.experience = Math.floor(Math.random() * 15) + 10;
                break;
            case 'flyingeye':
                loot.gold = Math.floor(Math.random() * 10) + 8;
                loot.experience = Math.floor(Math.random() * 20) + 15;
                break;
            case 'werewolf':
                loot.gold = Math.floor(Math.random() * 12) + 10;
                loot.experience = Math.floor(Math.random() * 25) + 20;
                break;
        }

        return loot;
    }

    rollRarity(weights) {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;
        
        for (const [rarity, weight] of Object.entries(weights)) {
            roll -= weight;
            if (roll <= 0) return rarity;
        }
        
        return null;
    }

    showLootBox(loot) {
        // Create loot box container
        const lootBox = document.createElement('div');
        lootBox.className = 'loot-box';
        lootBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 340px;
            height: 260px;
            background: rgba(0, 0, 0, 0.0);
            border-radius: 16px;
            padding: 0;
            color: white;
            text-align: center;
            z-index: 2000;
            font-family: 'Cinzel', 'Times New Roman', serif;
            overflow: visible;
        `;

        // --- Rewards Panel ---
        const rewardsContainer = document.createElement('div');
        rewardsContainer.style.display = 'none';
        rewardsContainer.style.position = 'fixed';
        rewardsContainer.style.top = '24px';
        rewardsContainer.style.left = '50%';
        rewardsContainer.style.transform = 'translateX(-50%)';
        rewardsContainer.style.width = '410px';
        rewardsContainer.style.background = 'linear-gradient(135deg, rgba(30,40,30,0.98) 70%, rgba(60,80,60,0.98) 100%)';
        rewardsContainer.style.border = '2.5px solid #39ff14';
        rewardsContainer.style.borderRadius = '18px';
        rewardsContainer.style.padding = '22px 18px 18px 18px';
        rewardsContainer.style.boxShadow = '0 0 32px 8px #39ff1466, 0 4px 32px rgba(0,0,0,0.8)';
        rewardsContainer.style.zIndex = '3000';
        rewardsContainer.style.backdropFilter = 'blur(2px)';
        rewardsContainer.style.textAlign = 'center';
        rewardsContainer.style.fontFamily = 'Cinzel, Times New Roman, serif';

        // Title
        const title = document.createElement('div');
        title.textContent = 'Battle Rewards';
        title.style.fontSize = '2em';
        title.style.color = '#39ff14';
        title.style.marginBottom = '12px';
        title.style.letterSpacing = '1px';
        title.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
        rewardsContainer.appendChild(title);

        // Grid for loot
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        grid.style.gap = '14px';
        grid.style.justifyItems = 'center';
        grid.style.alignItems = 'center';
        grid.style.margin = '0 auto 18px auto';
        grid.style.minHeight = '90px';

        // Helper: icon for item type
        const getIcon = (item) => {
            if (item === 'healthpotion') return '<img src="./assets/Images/healthpotion.png" alt="Health Potion" style="width:38px;height:38px;">';
            if (item === 'manapotion') return '<img src="./assets/Images/manapotion.png" alt="Mana Potion" style="width:38px;height:38px;">';
            if (item === 'fireball') return '<img src="./assets/Images/fireballcard.png" alt="Fireball" style="width:38px;height:38px;">';
            if (item === 'shield') return '<img src="./assets/Images/shieldcard.png" alt="Shield" style="width:38px;height:38px;">';
            if (item === 'meteor_strike') return '<img src="./assets/Images/meteorcard.png" alt="Meteor Strike" style="width:38px;height:38px;">';
            if (item === 'inferno') return '<img src="./assets/Images/infernocard.png" alt="Inferno" style="width:38px;height:38px;">';
            // fallback
            return '<span style="font-size:2em;">🎁</span>';
        };

        // Count items for stacking
        const itemCounts = {};
        loot.items.forEach(item => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });
        const uniqueItems = Object.keys(itemCounts);

        // Add loot items to grid
        uniqueItems.forEach(item => {
            const cell = document.createElement('div');
            cell.style.background = 'rgba(57,255,20,0.10)';
            cell.style.border = '1.5px solid #39ff14';
            cell.style.borderRadius = '10px';
            cell.style.padding = '8px 4px 4px 4px';
            cell.style.display = 'flex';
            cell.style.flexDirection = 'column';
            cell.style.alignItems = 'center';
            cell.style.minWidth = '60px';
            cell.style.minHeight = '60px';
            cell.innerHTML = `
                <div>${getIcon(item)}</div>
                <div style="color:#fff; font-size:1em; margin-top:2px;">${item.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div style="color:#39ff14; font-size:1em; font-weight:bold;">x${itemCounts[item]}</div>
            `;
            grid.appendChild(cell);
        });

        // Gold cell
        const goldCell = document.createElement('div');
        goldCell.style.background = 'rgba(255, 215, 0, 0.10)';
        goldCell.style.border = '1.5px solid gold';
        goldCell.style.borderRadius = '10px';
        goldCell.style.padding = '8px 4px 4px 4px';
        goldCell.style.display = 'flex';
        goldCell.style.flexDirection = 'column';
        goldCell.style.alignItems = 'center';
        goldCell.style.minWidth = '60px';
        goldCell.style.minHeight = '60px';
        goldCell.innerHTML = `
            <div style="font-size:2em;">🪙</div>
            <div style="color:#fff; font-size:1em; margin-top:2px;">Gold</div>
            <div style="color:gold; font-size:1em; font-weight:bold;">+${loot.gold}</div>
        `;
        grid.appendChild(goldCell);

        // XP cell
        const xpCell = document.createElement('div');
        xpCell.style.background = 'rgba(80, 200, 255, 0.10)';
        xpCell.style.border = '1.5px solid #39ff14';
        xpCell.style.borderRadius = '10px';
        xpCell.style.padding = '8px 4px 4px 4px';
        xpCell.style.display = 'flex';
        xpCell.style.flexDirection = 'column';
        xpCell.style.alignItems = 'center';
        xpCell.style.minWidth = '60px';
        xpCell.style.minHeight = '60px';
        xpCell.innerHTML = `
            <div style="font-size:2em;">⭐</div>
            <div style="color:#fff; font-size:1em; margin-top:2px;">XP</div>
            <div style="color:#39ff14; font-size:1em; font-weight:bold;">+${loot.experience}</div>
        `;
        grid.appendChild(xpCell);

        rewardsContainer.appendChild(grid);

        // Collect button
        const collectBtn = document.createElement('button');
        collectBtn.textContent = 'Collect Rewards';
        collectBtn.style.padding = '12px 32px';
        collectBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
        collectBtn.style.color = '#b6ffb6';
        collectBtn.style.border = '2px solid #39ff14';
        collectBtn.style.borderRadius = '10px';
        collectBtn.style.cursor = 'pointer';
        collectBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
        collectBtn.style.fontSize = '1.2em';
        collectBtn.style.margin = '18px auto 0 auto';
        collectBtn.style.display = 'block';
        collectBtn.style.boxShadow = '0 0 12px #39ff1466';
        collectBtn.onmouseenter = () => {
            collectBtn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
            collectBtn.style.color = '#eaffea';
        };
        collectBtn.onmouseleave = () => {
            collectBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
            collectBtn.style.color = '#b6ffb6';
        };
        collectBtn.onclick = () => {
            loot.items.forEach(item => {
                if (item === 'healthpotion' || item === 'manapotion') {
                    this.game.backpack.addItem(item);
                }
            });
            this.game.playerGold += loot.gold;
            this.game.updateGoldUI();
            lootBox.remove();
            rewardsContainer.remove();
            this.game.continueLevelTransition();
        };
        rewardsContainer.appendChild(collectBtn);

        // --- Chest code unchanged ---
        const chestContainer = document.createElement('div');
        chestContainer.style.position = 'relative';
        chestContainer.style.width = '220px';
        chestContainer.style.height = '180px';
        chestContainer.style.margin = '30px auto 0 auto';
        chestContainer.style.display = 'block';

        const chestImg = document.createElement('img');
        chestImg.src = './assets/Images/chest.png';
        chestImg.alt = 'Loot Chest';
        chestImg.style.width = '220px';
        chestImg.style.height = '180px';
        chestImg.style.position = 'absolute';
        chestImg.style.top = '0';
        chestImg.style.left = '0';
        chestImg.style.display = 'block';
        chestImg.style.cursor = 'pointer';
        chestImg.style.transition = 'filter 0.2s';

        const openText = document.createElement('div');
        openText.textContent = 'Open';
        openText.style.position = 'absolute';
        openText.style.top = '70%';
        openText.style.left = '50%';
        openText.style.transform = 'translate(-50%, -50%)';
        openText.style.fontSize = '2em';
        openText.style.color = '#39ff14';
        openText.style.textShadow = '0 0 8px #000, 0 2px 2px #39ff14';
        openText.style.cursor = 'pointer';
        openText.style.fontWeight = 'bold';
        openText.style.letterSpacing = '2px';
        openText.style.userSelect = 'none';
        openText.style.pointerEvents = 'auto';
        openText.style.width = '100%';
        openText.style.textAlign = 'center';

        const openChest = () => {
            chestImg.src = './assets/Images/chestopen.png';
            openText.style.display = 'none';
            rewardsContainer.style.display = 'block';
            document.body.appendChild(rewardsContainer);
        };
        chestImg.addEventListener('click', openChest);
        openText.addEventListener('click', openChest);

        chestContainer.appendChild(chestImg);
        chestContainer.appendChild(openText);
        lootBox.appendChild(chestContainer);
        document.body.appendChild(lootBox);
    }
} 