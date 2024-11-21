import { Application, Assets, TilingSprite } from 'pixi.js';

interface Tile {
    sprite: TilingSprite;
    speed: number;
}

export default () => ({
    tiles: [] as Tile[],
    app: null as Application | null,
    async init() {
        console.log("Pixi app initalizing");

        const app = new Application();
        // Intialize the application.
        await app.init({ background: '#1099bb', resizeTo: window });
        this.app = app;

        const container = document.getElementById('pixi-container');
        if (container) {
            container.appendChild(app.canvas);
            console.log("Pixi app initialized");
        } else {
            console.error("Container element not found");
        }

        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        fileInput.addEventListener('change', async (event) => {
            console.log("File input changed");
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const tile = await makeTile(file);
                app.stage.addChild(tile);
                this.tiles.push({sprite: tile, speed: 1});
            }
        });

        app.ticker.add(() => {
            this.tiles.forEach(tile => {
                tile.sprite.tilePosition.x += tile.speed;
            });
        });
    },
    moveUp(index: number) {
        if (index > 0) {
            const temp = this.tiles[index];
            this.tiles[index] = this.tiles[index - 1];
            this.tiles[index - 1] = temp;
            this.updateStage();
        }
    },
    moveDown(index: number) {
        if (index < this.tiles.length - 1) {
            const temp = this.tiles[index];
            this.tiles[index] = this.tiles[index + 1];
            this.tiles[index + 1] = temp;
            this.updateStage();
        }
    },
    updateStage() {
        const app = this.app;
        if (!app) {
            return;
        }
        app.stage.removeChildren();
        this.tiles.forEach(tile => {
            app.stage.addChild(tile.sprite);
        });
    }
})


function makeTile(file: File): Promise<TilingSprite> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = async () => {
                try {
                    const texture = await Assets.load(img.src);
                    const tilingSprite = new TilingSprite(texture, 500, 500);
                    resolve(tilingSprite);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}