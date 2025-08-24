import { Board } from "../board/board";
import { FoodDispenser } from "../food/food-dispenser";
import { Snake } from "../player/player";

export class GameController {
    public player: Snake;
    public board: Board;
    private food: FoodDispenser;
    private gameIntervalId: number; // game update ticker
    readonly arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    readonly spaceCode = "Space";

    // game settings 
    private updateFreqMs = 250; // speed: 150-250-350
    private boardNumCellsWide = 9;
    private _boardSizePx: number;
    public get boardSizePx() { return this._boardSizePx; }

    // score stuff
    score: number = 0;
    startTime: number = 0;
    finalTimeStr: string = "";

    // state
    private _gameState: GameState = GameState.MainMenu;
    public get gameState() { return this._gameState; }
    public get onMainMenu() { return this._gameState == GameState.MainMenu; }
    public get isPlaying() { return this._gameState == GameState.Playing; }
    public get isGameOver() { return this._gameState == GameState.GameOver; }
    public get playerHasWon() { return this._gameState == GameState.Victorious; }

    constructor(private drawCtx: CanvasRenderingContext2D) {
        this._gameState = GameState.MainMenu;

        this.changeBoard(this.boardNumCellsWide);
        this.setUpKeyboardListener();
    }

    private setUpKeyboardListener() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    private onKeyDown(e: KeyboardEvent) {
        switch (this.gameState) {
            case GameState.Playing:
                this.player.onKeyDown(e);
                break;
            case GameState.MainMenu:
                if (this.arrowKeys.includes(e.key))
                    this.startGame(e);
                break;
            case GameState.GameOver:
            case GameState.Victorious:
                if (e.code == this.spaceCode)
                    this.goToMainMenu();
                break;
        }
    }

    public changeBoard(cellsWide: number) {
        this.setBoardSize(cellsWide);
        this.board = new Board(this.drawCtx, this.boardNumCellsWide, this.boardSizePx);
        this.player = new Snake(this, this.drawCtx);
        this.food = new FoodDispenser(this, this.drawCtx);
        this.prepareToPlay();
    }

    private setBoardSize(cellsWide: number) {
        this.boardNumCellsWide = cellsWide;
        this._boardSizePx = this.boardNumCellsWide * 55.5;
    }

    public setSpeed(updateMs: number) {
        this.updateFreqMs = updateMs;
    }

    public draw(timeDeltaS: number) {
        this.board.draw(timeDeltaS);
        this.food.draw(timeDeltaS);
        this.player.draw(timeDeltaS);
    }

    private startGame(e: KeyboardEvent) {
        this._gameState = GameState.Playing;
        this.startTime = Date.now();
        this.player.onKeyDown(e);
        this.startUpdateLoop();
    }

    private startUpdateLoop() {
        this.gameIntervalId = window.setInterval(() => this.doGameUpdate(), this.updateFreqMs);
    }

    private doGameUpdate() {
        this.food.update();
        this.player.update();
    }

    private gameOver(won: boolean) {
        this._gameState = won ? GameState.Victorious : GameState.GameOver;
        window.clearInterval(this.gameIntervalId);

        this.finalTimeStr = ((Date.now() - this.startTime) / 1000).toFixed(2);
    }

    private goToMainMenu() {
        this._gameState = GameState.MainMenu;
        this.prepareToPlay();
    }

    // care! order matters!
    private prepareToPlay() {
        this.food.reset();
        this.board.reset();
        this.player.reset();
        this.score = 0;
        this.spawnPrey();
    }

    public onPreyEaten() {
        this.score++;
        let numCellsLeft = this.board.getUnoccupiedCells().length;
        if (numCellsLeft > 0)
            this.spawnPrey();
        else
            this.gameOver(true);
    }

    private spawnPrey() {
        let newPrey = this.food.spawnNewPrey();
        this.player.setPrey(newPrey);
    }

    public onPlayerDied() {
        this.gameOver(false);
    }
}

enum GameState {
    MainMenu,
    Playing,
    GameOver,
    Victorious
}
