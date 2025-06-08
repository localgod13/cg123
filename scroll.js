export class Scroll {
    constructor(type = 'base', effect = null, imagePath = './assets/Images/bpackscroll.png') {
        this.type = type; // e.g., 'base', 'fire', 'ice', etc.
        this.effect = effect; // Object containing name and execute function
        this.imagePath = imagePath;
    }

    use(game) {
        if (this.effect && typeof this.effect.execute === 'function') {
            this.effect.execute(game);
        } else {
            // Default: do nothing or show a message
            console.log('This scroll has no effect.');
        }
    }

    getDisplayName() {
        return this.type.charAt(0).toUpperCase() + this.type.slice(1) + ' Scroll';
    }

    getDescription() {
        return this.effect && this.effect.description
            ? this.effect.description
            : 'A mysterious scroll.';
    }
} 