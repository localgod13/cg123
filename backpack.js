import { Potion } from './potion.js';
import { Scroll } from './scroll.js';
import { ScrollOfEchoingFury } from './scrolls.js';
import { ScrollOfUnbrokenWard } from './scrolls.js';
import { ScrollOfTemporalGrace } from './scrolls.js';
import { ScrollOfArcaneDebt } from './scrolls.js';

export class Backpack {
    constructor(game) {
        this.game = game;
        this.items = new Array(16).fill(null); // 4x4 grid
        this.isOpen = false;
        this.showInventoryGrid = false;
        this.itemGrid = null;
    }

    initialize() {
        // Add one of each new scroll type to the top row
        this.items[0] = new ScrollOfEchoingFury();
        this.items[1] = new ScrollOfUnbrokenWard();
        this.items[2] = new ScrollOfTemporalGrace();
        this.items[3] = new ScrollOfArcaneDebt();
        this.addBackpackIcon();
    }

    addBackpackIcon() {
        // Remove any existing backpack icon, grid, or container for HMR support
        document.querySelectorAll('.backpack-item-grid').forEach(el => el.remove());
        document.querySelectorAll('.backpack-icon').forEach(el => el.remove());
        document.querySelectorAll('.backpack-container').forEach(el => el.remove());

        const discardPile = document.querySelector('.discard-pile');
        if (!discardPile) return;

        // Create a container for the backpack and grid
        const backpackContainer = document.createElement('div');
        backpackContainer.className = 'backpack-container';
        backpackContainer.style.position = 'absolute';
        backpackContainer.style.right = '-180px';
        backpackContainer.style.bottom = '0';
        backpackContainer.style.width = '200px';
        backpackContainer.style.height = '200px';
        backpackContainer.style.zIndex = '10';
        backpackContainer.style.pointerEvents = 'auto';
        backpackContainer.style.overflow = 'hidden';

        // Create the backpack image element
        const backpack = document.createElement('img');
        backpack.src = './assets/Images/backpack.png';
        backpack.alt = 'Backpack';
        backpack.className = 'backpack-icon';
        backpack.style.position = 'absolute';
        backpack.style.left = '0';
        backpack.style.top = '0';
        backpack.style.width = '200px';
        backpack.style.height = '200px';
        backpack.style.objectFit = 'contain';
        backpack.style.cursor = 'pointer';
        backpack.style.filter = 'drop-shadow(0 2px 8px #000a)';
        backpack.style.zIndex = '10';

        // Create the item grid overlay (4x4)
        const itemGrid = document.createElement('div');
        itemGrid.className = 'backpack-item-grid';
        itemGrid.style.position = 'absolute';
        itemGrid.style.display = 'none';
        itemGrid.style.left = '0';
        itemGrid.style.top = '0';
        itemGrid.style.width = '109px';
        itemGrid.style.height = '149px';
        itemGrid.style.pointerEvents = 'auto';
        itemGrid.style.zIndex = '20';
        itemGrid.style.left = '50%';
        itemGrid.style.transform = 'translate(-55%, 16%)';
        itemGrid.style.display = 'grid';
        itemGrid.style.gridTemplateRows = '2.5fr 1fr 1fr 1fr';
        itemGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        itemGrid.style.gap = '2px';

        // Add 16 slots (4x4)
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'backpack-item-slot';
            slot.dataset.slot = i;
            slot.style.position = 'relative';
            slot.style.width = '100%';
            slot.style.height = '100%';
            slot.style.pointerEvents = 'auto';
            slot.style.cursor = 'pointer';
            slot.style.zIndex = '1';
            itemGrid.appendChild(slot);
        }

        // Append elements to container
        backpackContainer.appendChild(backpack);
        // Store a reference to the container for later use
        this.backpackContainer = backpackContainer;
        this.backpackContainer.__game = this.game;

        // Add to discard pile instead of document body
        discardPile.parentNode.appendChild(backpackContainer);

        // Store references
        this.itemGrid = itemGrid;

        // Add click handler for backpack toggle
        backpack.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            backpack.src = this.isOpen ? './assets/Images/backpackopen.png' : './assets/Images/backpack.png';
            
            if (this.isOpen) {
                if (!this.backpackContainer.contains(this.itemGrid)) {
                    this.backpackContainer.appendChild(this.itemGrid);
                }
                this.itemGrid.style.display = 'grid';
                this.itemGrid.style.visibility = 'visible';
                this.itemGrid.style.pointerEvents = 'auto';
                if (this.showInventoryGrid) {
                    this.itemGrid.classList.add('show-inventory-grid');
                } else {
                    this.itemGrid.classList.remove('show-inventory-grid');
                }
                backpack.style.pointerEvents = 'auto';
                backpack.classList.add('no-hover');
            } else {
                if (this.backpackContainer.contains(this.itemGrid)) {
                    this.backpackContainer.removeChild(this.itemGrid);
                }
                backpack.classList.remove('no-hover');
            }
            this.renderItems();
        });

        // Render initial items
        this.renderItems();
    }

    renderItems() {
        if (!this.itemGrid) return;
        this.itemGrid.innerHTML = ''; // Clear existing items
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'backpack-item-slot';
            slot.dataset.slot = i;
            slot.style.position = 'relative';
            slot.style.width = '100%';
            slot.style.height = '100%';
            slot.style.pointerEvents = 'auto';
            slot.style.cursor = 'pointer';
            
            // Add drag and drop handlers for the slot
            slot.ondragover = (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const draggedItem = this.items[fromIndex];
                // Only allow scrolls in top row, others in bottom rows
                if ((i < 4 && draggedItem instanceof Scroll) || (i >= 4 && !(draggedItem instanceof Scroll))) {
                    slot.classList.add('drag-over');
                }
            };

            slot.ondragleave = (e) => {
                slot.classList.remove('drag-over');
            };

            slot.ondrop = (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const draggedItem = this.items[fromIndex];
                // Only allow scrolls in top row, others in bottom rows
                if ((i < 4 && draggedItem instanceof Scroll) || (i >= 4 && !(draggedItem instanceof Scroll))) {
                    slot.classList.remove('drag-over');
                    if (fromIndex !== i) {
                        // Swap or move
                        const temp = this.items[i];
                        this.items[i] = this.items[fromIndex];
                        this.items[fromIndex] = temp;
                        this.renderItems();
                    }
                }
            };
            
            if (this.items[i]) {
                if (this.items[i] instanceof Scroll) {
                    // Use the scroll's render method to get the proper container with letter overlay
                    this.items[i].render(slot);
                } else if (this.items[i] instanceof Potion) {
                    // Create container for potion
                    const container = document.createElement('div');
                    container.style.position = 'relative';
                    container.style.width = '100%';
                    container.style.height = '100%';
                    container.style.cursor = 'pointer';
                    
                    // Add the potion image
                    const potionImg = document.createElement('img');
                    potionImg.src = this.items[i].imagePath;
                    potionImg.alt = this.items[i].getDisplayName();
                    potionImg.style.width = '100%';
                    potionImg.style.height = '100%';
                    potionImg.style.objectFit = 'cover';
                    potionImg.draggable = true;
                    potionImg.dataset.slot = i;
                    container.appendChild(potionImg);

                    // Add tooltip container
                    const tooltip = document.createElement('div');
                    tooltip.className = 'potion-tooltip';
                    tooltip.style.position = 'absolute';
                    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    tooltip.style.color = 'white';
                    tooltip.style.padding = '8px 12px';
                    tooltip.style.borderRadius = '4px';
                    tooltip.style.fontSize = '14px';
                    tooltip.style.maxWidth = '200px';
                    tooltip.style.zIndex = '1000';
                    tooltip.style.display = 'none';
                    tooltip.style.pointerEvents = 'none';
                    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                    tooltip.style.border = '1px solid rgba(255, 255, 255, 0.2)';

                    // Add tooltip content
                    const name = document.createElement('div');
                    name.style.fontWeight = 'bold';
                    name.style.marginBottom = '4px';
                    name.style.color = '#ffd700';
                    name.textContent = this.items[i].getDisplayName();
                    
                    const effect = document.createElement('div');
                    effect.style.fontSize = '12px';
                    effect.style.color = '#ff6b6b';
                    effect.innerHTML = `<span style="color: #ffd700;">Effect:</span> ${this.items[i].effect || 'No effect'}`;

                    tooltip.appendChild(name);
                    tooltip.appendChild(effect);

                    // Add hover events
                    container.addEventListener('mouseenter', (e) => {
                        tooltip.style.display = 'block';
                        const rect = container.getBoundingClientRect();
                        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                        tooltip.style.transform = 'translateX(-50%)';
                    });

                    container.addEventListener('mouseleave', () => {
                        tooltip.style.display = 'none';
                    });

                    // Add tooltip to document body
                    document.body.appendChild(tooltip);

                    // Drag events
                    potionImg.ondragstart = (e) => {
                        e.dataTransfer.setData('text/plain', i);
                        container.classList.add('dragging');
                        tooltip.style.display = 'none';
                    };
                    potionImg.ondragend = (e) => {
                        container.classList.remove('dragging');
                    };

                    // Add click handler to use potion
                    container.addEventListener('click', (event) => {
                        if (event.detail === 0) return;
                        if (this.items[i].use(this.game)) {
                            // Only remove the potion if it was successfully used
                            this.items[i] = null;
                            this.renderItems();
                        }
                        tooltip.remove();
                    });

                    slot.appendChild(container);
                } else {
                    // Handle other items
                    const itemImg = document.createElement('img');
                    itemImg.src = this.items[i].imagePath;
                    itemImg.alt = this.items[i].name;
                    itemImg.style.width = '100%';
                    itemImg.style.height = '100%';
                    itemImg.style.objectFit = 'cover';
                    itemImg.draggable = true;
                    itemImg.dataset.slot = i;
                    slot.appendChild(itemImg);
                }
            }
            this.itemGrid.appendChild(slot);
        }
    }

    toggleInventoryGrid() {
        this.showInventoryGrid = !this.showInventoryGrid;
        if (this.itemGrid) {
            if (this.showInventoryGrid) {
                this.itemGrid.classList.add('show-inventory-grid');
            } else {
                this.itemGrid.classList.remove('show-inventory-grid');
            }
        }
    }

    addItem(itemType, slot) {
        // If slot is not provided, find the first available slot
        if (typeof slot === 'undefined') {
            if (itemType === 'healthpotion' || itemType === 'manapotion') {
                // Find first available slot in bottom 3 rows (4-15)
                for (let i = 4; i < 16; i++) {
                    if (!this.items[i]) {
                        slot = i;
                        break;
                    }
                }
            } else if (itemType === 'basescroll' || itemType instanceof Scroll) {
                // Find first available slot in top row (0-3)
                for (let i = 0; i < 4; i++) {
                    if (!this.items[i]) {
                        slot = i;
                        break;
                    }
                }
            }
        }
        if (typeof slot === 'undefined') return; // No available slot
        if (slot >= 0 && slot < 16) {
            // Top row (0-3): Only allow scrolls
            if (slot >= 0 && slot < 4) {
                if (itemType === 'basescroll' || itemType instanceof Scroll) {
                    this.items[slot] = itemType === 'basescroll' ? new Scroll('base') : itemType;
                } else {
                    // Ignore or show error if trying to add non-scroll to top row
                    return;
                }
            } else { // Bottom 3 rows (4-15): Only allow non-scrolls
                if (itemType === 'healthpotion') {
                    this.items[slot] = new Potion('health', 30);
                } else if (itemType === 'manapotion') {
                    this.items[slot] = new Potion('mana', 5);
                } else if (itemType instanceof Scroll || itemType === 'basescroll') {
                    // Ignore or show error if trying to add scroll to bottom rows
                    return;
                } else {
                    this.items[slot] = itemType;
                }
            }
            this.renderItems();
        }
    }

    removeItem(slot) {
        if (slot >= 0 && slot < 16) {
            this.items[slot] = null;
            this.renderItems();
        }
    }
} 