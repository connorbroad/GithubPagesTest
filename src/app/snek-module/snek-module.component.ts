import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameController } from './game/game-controller';

@Component({
  selector: 'app-snek-module',
  templateUrl: './snek-module.component.html',
  styleUrls: ['./snek-module.component.css']
})
export class SnekModuleComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas') gameCanvas: ElementRef;
  drawingContext: CanvasRenderingContext2D;
  gameControl: GameController;
  speedSetting: string = "Normal";

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initObjects();
    this.animateCanvas();
  }

  private initObjects() {
    this.drawingContext = this.gameCanvas.nativeElement.getContext('2d');
    this.gameControl = new GameController(this.drawingContext);
    this.setCanvasSize();
    this.gameCanvas.nativeElement.style.setProperty("--canvas-y", `0%`);
  }

  public setBoardSize(cellsWide: number) {
    this.gameControl.changeBoard(cellsWide);
    this.setCanvasSize();
  }

  private setCanvasSize() {
    this.gameCanvas.nativeElement.width = this.gameControl.boardSizePx;
    this.gameCanvas.nativeElement.height = this.gameControl.boardSizePx;
  }

  public setSpeed(updateMs: number) {
    this.gameControl.setSpeed(updateMs);

    switch (updateMs) {
      case 100:
        this.speedSetting = "Sanic";
        break;
      case 150:
        this.speedSetting = "Fast";
        break;
      case 250:
        this.speedSetting = "Normal";
        break;
      case 350:
        this.speedSetting = "Slow";
        break;

      default:
        this.speedSetting = "Normal";
    }
  }

  private timeLastFrame: number;
  animateCanvas(timestamp: number = 0) {
    let timeDeltaS = timestamp - this.timeLastFrame;
    this.timeLastFrame = timestamp;
    timeDeltaS /= 1000;

    const boardFloatMag: number = 5;
    let canvasY = Math.sin(Date.now() / 5000) * boardFloatMag;
    this.gameCanvas.nativeElement.style.setProperty("--canvas-y", `${canvasY}%`);

    this.drawingContext.clearRect(0, 0, this.gameControl.boardSizePx, this.gameControl.boardSizePx);
    this.gameControl.draw(timeDeltaS);
    window.requestAnimationFrame((timestamp) => this.animateCanvas(timestamp));
  }
}