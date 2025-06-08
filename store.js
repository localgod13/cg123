import { ScrollOfEchoingFury } from './scrolls.js';
import { ScrollOfUnbrokenWard } from './scrolls.js';
import { ScrollOfTemporalGrace } from './scrolls.js';
import { ScrollOfArcaneDebt } from './scrolls.js';
import { Potion } from './potion.js';

export class Store {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.storeElement = null;
        this.itemsForSale = [];
        this.playerInventory = [];
    }

    open(itemsForSale, playerInventory) {
        this.itemsForSale = itemsForSale;
        this.playerInventory = playerInventory;
        this.visible = true;
        this.render();
    }

    close() {
        if (this.storeElement) {
            this.storeElement.remove();
            this.storeElement = null;
        }
        this.visible = false;
    }

    render() {
        // Remove any existing store UI
        if (this.storeElement) this.storeElement.remove();
        const store = document.createElement('div');
        store.className = 'store-ui';
        store.style.position = 'fixed';
        store.style.top = '50%';
        store.style.left = '50%';
        store.style.transform = 'translate(-50%, -50%)';
        store.style.background = 'rgba(30,30,30,0.98)';
        store.style.border = '2.5px solid #39ff14';
        store.style.borderRadius = '16px';
        store.style.padding = '28px 32px 24px 32px';
        store.style.color = '#b6ffb6';
        store.style.fontFamily = 'Cinzel, Times New Roman, serif';
        store.style.fontSize = '1.1em';
        store.style.zIndex = '5000';
        store.style.boxShadow = '0 0 32px 8px #39ff1466, 0 4px 32px rgba(0,0,0,0.8)';
        store.style.maxWidth = '700px';
        store.style.textAlign = 'center';

        store.innerHTML = `
            <div style="font-size: 1.5em; color: #39ff14; margin-bottom: 18px;">Merchant</div>
            <div style="display: flex; justify-content: space-between; gap: 32px;">
                <div style="flex: 1;">
                    <div style="font-size: 1.1em; margin-bottom: 8px; color: #fff;">Items for Sale</div>
                    <div class="store-items-for-sale" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;"></div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 1.1em; margin-bottom: 8px; color: #fff;">Your Inventory</div>
                    <div class="store-player-inventory" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;"></div>
                </div>
            </div>
            <button class="store-close-btn" style="margin-top: 24px; padding: 10px 32px; font-size: 1.1em; background: linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%); color: #b6ffb6; border: 2px solid #39ff14; border-radius: 10px; cursor: pointer; font-family: Cinzel, Times New Roman, serif;">Close</button>
        `;

        // Populate items for sale
        const saleGrid = store.querySelector('.store-items-for-sale');
        this.itemsForSale.forEach((item, idx) => {
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
                <div>${item.icon ? `<img src="${item.icon}" style="width:38px;height:38px;">` : ''}</div>
                <div style="color:#fff; font-size:1em; margin-top:2px;">${item.name}</div>
                <div style="color:gold; font-size:1em; font-weight:bold;">${item.price} <img src='./assets/Images/gold.png' style='width:18px;vertical-align:middle;'></div>
                <button style="margin-top: 6px; padding: 4px 12px; font-size: 0.95em; background: #39ff14; color: #222; border: none; border-radius: 6px; cursor: pointer;">Buy</button>
            `;
            const buyBtn = cell.querySelector('button');
            buyBtn.onclick = () => {
                if (this.game.playerGold < item.price) {
                    alert('Not enough gold!');
                    return;
                }
                // Try to add to backpack
                const before = [...this.game.backpack.items];
                let scrollInstance;
                switch(item.type) {
                    case 'echoingFury':
                        scrollInstance = new ScrollOfEchoingFury();
                        break;
                    case 'unbrokenWard':
                        scrollInstance = new ScrollOfUnbrokenWard();
                        break;
                    case 'temporalGrace':
                        scrollInstance = new ScrollOfTemporalGrace();
                        break;
                    case 'arcaneDebt':
                        scrollInstance = new ScrollOfArcaneDebt();
                        break;
                    default:
                        scrollInstance = item.type;
                }
                this.game.backpack.addItem(scrollInstance);
                const after = this.game.backpack.items;
                if (before.join() === after.join()) {
                    alert('Backpack is full!');
                    return;
                }
                this.game.playerGold -= item.price;
                this.game.updateGoldUI();
                // Only close and reopen if not on level 17 or 18
                if (this.game.currentLevel === 17 || this.game.currentLevel === 18) {
                    // Just refresh the store UI
                    this.playerInventory = this._getPlayerInventory();
                    this.render();
                } else {
                    this.close();
                    // Reopen to refresh inventory
                    this.open(this.itemsForSale, this._getPlayerInventory());
                }
            };
            saleGrid.appendChild(cell);
        });

        // Populate player inventory
        const invGrid = store.querySelector('.store-player-inventory');
        this.playerInventory.forEach((item, idx) => {
            const cell = document.createElement('div');
            cell.style.background = 'rgba(80, 200, 255, 0.10)';
            cell.style.border = '1.5px solid #39ff14';
            cell.style.borderRadius = '10px';
            cell.style.padding = '8px 4px 4px 4px';
            cell.style.display = 'flex';
            cell.style.flexDirection = 'column';
            cell.style.alignItems = 'center';
            cell.style.minWidth = '60px';
            cell.style.minHeight = '60px';
            cell.innerHTML = `
                <div>${item.icon ? `<img src="${item.icon}" style="width:38px;height:38px;">` : ''}</div>
                <div style="color:#fff; font-size:1em; margin-top:2px;">${item.name}</div>
                <div style="color:gold; font-size:1em; font-weight:bold;">${item.price} <img src='./assets/Images/gold.png' style='width:18px;vertical-align:middle;'></div>
                <button style="margin-top: 6px; padding: 4px 12px; font-size: 0.95em; background: #39ff14; color: #222; border: none; border-radius: 6px; cursor: pointer;">Sell</button>
            `;
            const sellBtn = cell.querySelector('button');
            sellBtn.onclick = () => {
                // Remove from backpack
                if (typeof item.slot === 'number') {
                    // Verify the item still exists in the backpack before selling
                    const currentItem = this.game.backpack.items[item.slot];
                    if (!currentItem) {
                        // Item no longer exists, update UI and return
                        this.playerInventory = this._getPlayerInventory();
                        this.render();
                        return;
                    }
                    
                    // Verify the item type matches what we're trying to sell
                    if (item.type === 'healthpotion' && !(currentItem instanceof Potion && currentItem.type === 'health')) {
                        this.playerInventory = this._getPlayerInventory();
                        this.render();
                        return;
                    }
                    if (item.type === 'manapotion' && !(currentItem instanceof Potion && currentItem.type === 'mana')) {
                        this.playerInventory = this._getPlayerInventory();
                        this.render();
                        return;
                    }
                    if (item.type !== 'healthpotion' && item.type !== 'manapotion' && !(currentItem instanceof Scroll)) {
                        this.playerInventory = this._getPlayerInventory();
                        this.render();
                        return;
                    }

                    this.game.backpack.removeItem(item.slot);
                    this.game.playerGold += item.price;
                    this.game.updateGoldUI();
                    // Update the store UI without closing
                    this.playerInventory = this._getPlayerInventory();
                    this.render();
                }
            };
            invGrid.appendChild(cell);
        });

        // Close button
        store.querySelector('.store-close-btn').onclick = () => this.close();

        document.body.appendChild(store);
        this.storeElement = store;
    }

    _getPlayerInventory() {
        // Helper to get up-to-date player inventory for all items
        const playerInventory = [];
        // Check all slots (0-15)
        for (let i = 0; i < 16; i++) {
            const item = this.game.backpack.items[i];
            if (item) {
                if (item instanceof Scroll) {
                    // Handle scrolls
                    playerInventory.push({
                        name: item.getDisplayName(),
                        icon: item.imagePath,
                        price: Math.floor(item.price * 0.5), // Sell for half price
                        type: item.type,
                        slot: i
                    });
                } else if (item instanceof Potion) {
                    // Handle potions
                    if (item.type === 'health') {
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
        }
        return playerInventory;
    }
} 