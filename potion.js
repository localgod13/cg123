export class Potion {
    constructor(type, amount) {
        this.type = type; // 'health' or 'mana'
        this.amount = amount; // Amount of health/mana to restore
        this.imagePath = type === 'health' ? './assets/Images/healthpotion.png' : './assets/Images/manapotion.png';
    }

    use(game) {
        if (this.type === 'health') {
            // Check if health is already full
            if (game.playerHealth >= 100) {
                game.showHealthFullNotification();
                return false; // Return false to indicate potion wasn't used
            }
            game.playerHealth = Math.min(100, game.playerHealth + this.amount);
            game.updateHealthBars();
        } else if (this.type === 'mana') {
            // Check if mana is already full
            if (game.isManaFull()) {
                game.showManaFullNotification();
                return false; // Return false to indicate potion wasn't used
            }
            game.playerResource = Math.min(game.maxResource, game.playerResource + this.amount);
            game.updateResourceBar();
        }
        return true; // Return true to indicate potion was used
    }

    getDisplayName() {
        return this.type === 'health' ? 'Health Potion' : 'Mana Potion';
    }

    getDescription() {
        return this.type === 'health' 
            ? `Restores ${this.amount} health points`
            : `Restores ${this.amount} mana points`;
    }
} 