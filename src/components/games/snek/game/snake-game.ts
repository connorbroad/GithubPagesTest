import { type BiimoGame } from "../../_base/biimo-game";
import { Board } from "../board/board";
import { PreyController } from "../prey/prey-controller";
import { Snake } from "../player/player";
import * as THREE from 'three';
import {UiController} from "../ui/ui.ts";
import { GameState } from "../utils/utils.ts";
import { BiimoButton } from "../../_utils/game-utils.ts";

export class SnakeGame implements BiimoGame {
    public player: Snake | undefined;
    public board: Board | undefined;
    readonly arrowKeys = [BiimoButton.Up, BiimoButton.Down, BiimoButton.Left, BiimoButton.Right];
    readonly spaceCode = BiimoButton.Start;
    score: number = 0;
    startTime: number = 0;
    finalTimeStr: string = "";
    private preyController: PreyController | undefined;
    private uiController: UiController | undefined;
    private gameIntervalId: number | undefined; // game update ticker

    // game settings
    private updateFreqMs = 250; // speed: 150-250-350
    private boardNumCellsWide = 9;
    private boardNumCellsHigh = 9;

    constructor(scene: THREE.Scene) {
        this._gameState = GameState.MainMenu;
        this.board = new Board(this.boardNumCellsWide, this.boardNumCellsHigh);
        this.player = new Snake(this, scene);
        this.preyController = new PreyController(this, scene);
        this.uiController = new UiController(scene);
        this.prepareToPlay();
        this.setUpKeyboardListener();
    }

    // state
    private _gameState: GameState = GameState.MainMenu;

    public get gameState() {
        return this._gameState;
    }

    public get onMainMenu() {
        return this._gameState == GameState.MainMenu;
    }

    public get isPlaying() {
        return this._gameState == GameState.Playing;
    }

    public get isGameOver() {
        return this._gameState == GameState.GameOver;
    }

    public get playerHasWon() {
        return this._gameState == GameState.Victorious;
    }

    public init(scene: THREE.Scene, gameWidth: number, gameHeight: number) {
        this.board?.init(scene, gameWidth, gameHeight);
    }

    // this is called from the Biimo controller
    public update(timeDeltaS: number) {
        this.preyController?.update();
        this.player?.updateThreeJs(timeDeltaS);
        this.board?.update(timeDeltaS);
    }

    // TODO: why are there two update mechanisms?
    private startUpdateLoop() {
        this.gameIntervalId = window.setInterval(
            () => this.doGameUpdate(),
            this.updateFreqMs
        );
    }

    private doGameUpdate() {
        this.player?.update();
    }

    public onPreyEaten() {
        this.score++;
        const numCellsLeft = this.board?.getUnoccupiedCells().length ?? 0;
        if (numCellsLeft > 0) this.spawnPrey();
        else this.gameOver(true);
    }

    public onPlayerDied() {
        this.gameOver(false);
    }

    private setUpKeyboardListener() {
        window.addEventListener("keydown", this.onKeyDownEvent.bind(this));
    }

    // routes the event to the right handler(s), depending on the game state
    private onKeyDownEvent(e: KeyboardEvent) {
        let snakeInput = this.getSnakeGameInput(e);
        this.handleSnakeGameInput(snakeInput);
    }

    handleBiimoInput(buttonId: BiimoButton): void {
        this.handleSnakeGameInput(buttonId);
    }

    private getSnakeGameInput(e: KeyboardEvent): BiimoButton {
        switch (e.code) {
            case "ArrowUp":
                return BiimoButton.Up;
            case "ArrowDown":
                return BiimoButton.Down;
            case "ArrowLeft":
                return BiimoButton.Left;
            case "ArrowRight":
                return BiimoButton.Right;
            case "KeyA":
                return BiimoButton.A;
            case "KeyB":
                return BiimoButton.B;
            case "Space":
                return BiimoButton.Start;
            default:
                return BiimoButton.Unknown;
        }
    }

    private handleSnakeGameInput(e: BiimoButton) {
        switch (this.gameState) {
            case GameState.MainMenu:
                if (this.arrowKeys.includes(e)) {
                    this.startGame(e);
                }
                break;
            case GameState.Playing:
                this.player?.onKeyDown(e);
                break;
            case GameState.GameOver:
            case GameState.Victorious:
                if (e == this.spaceCode) this.goToMainMenu();
                break;
        }
    }

    private startGame(e: BiimoButton) {
        this.setGameState(GameState.Playing);
        this.startTime = Date.now();
        this.player?.onKeyDown(e); // starts the snake moving in the direction pressed
        this.startUpdateLoop();
    }

    private gameOver(won: boolean) {
        this.setGameState(won ? GameState.Victorious : GameState.GameOver);
        window.clearInterval(this.gameIntervalId);

        this.finalTimeStr = ((Date.now() - this.startTime) / 1000).toFixed(2);
    }

    private goToMainMenu() {
        this.setGameState(GameState.MainMenu);
        this.prepareToPlay();
    }

    // order matters!
    private prepareToPlay() {
        this.preyController?.reset();
        this.board?.reset();
        this.player?.reset();
        this.score = 0;
        this.spawnPrey();
        this.uiController?.showUI(this.gameState);
    }

    private spawnPrey() {
        const newPrey = this.preyController?.spawnNewPrey();
        if (newPrey) this.player?.setPrey(newPrey);
    }

    private setGameState(state: GameState) {
        this._gameState = state;
        this.uiController?.showUI(state);
    }
}
