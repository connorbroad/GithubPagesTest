import { Vector2 } from "../utils/utils";

// The movement style this class enacts goes like this:
// There are two movement request slots, one for the x axis, one for the y axis.
// These can each hold -1, 0, or 1.
// 0 means no request, otherwise a direction on that axis has been requested.
// The player can have both slots queued up. This allows the player to queue up a U-turn.
// The processor will enact both requests accordingly with respect to the current direction
// The processor will also ensure to not queue a direction request along the current axis, unless the other axis has already been requested.
export class PlayerMovementProcessor {
  private directionRequests = new Vector2();
  private currentDirection = Vector2.zero;

  constructor() {}

  public onKeyDown(e: KeyboardEvent) {
    const dirRequest = this.keyToDirection(e.key);
    const startOfGame = !this.isMoving(); // e.g. start of the game, player has no direction

    // if the key is an x axis request, only add it to the x requests if we are moving on the y axis (unless there is already a y axis request)
    if (
      dirRequest.x &&
      (startOfGame || this.movingOnYAxis() || this.directionRequests.y)
    ) {
      this.directionRequests.x = dirRequest.x;
    }
    // if the key is a y axis request, only add it to the y requests if we are moving on the x axis (unless there is already an x axis request)
    if (
      dirRequest.y &&
      (startOfGame || this.movingOnXAxis() || this.directionRequests.x)
    ) {
      this.directionRequests.y = dirRequest.y;
    }
  }

  public updateDirection(): Vector2 {
    return (this.currentDirection = this.checkForNewDirection());
  }

  public reset() {
    this.directionRequests = new Vector2();
    this.currentDirection = Vector2.zero;
  }

  private keyToDirection(key: string): Vector2 {
    switch (key) {
      case "ArrowUp":
        return Vector2.up;
      case "ArrowDown":
        return Vector2.down;
      case "ArrowLeft":
        return Vector2.left;
      case "ArrowRight":
        return Vector2.right;
      default:
        return Vector2.zero;
    }
  }

  private checkForNewDirection(): Vector2 {
    if (!this.directionRequestsPending()) return this.currentDirection;
    const canMoveAnyDirection = !this.isMoving(); // at the start of the game the player has no direction; allow any direction request
    return this.consumeRequestedDirection(canMoveAnyDirection);
  }

  private directionRequestsPending(): boolean {
    return !this.directionRequests.equals(Vector2.zero);
  }

  private consumeRequestedDirection(anyDirectionAllowed: boolean): Vector2 {
    // if we are moving on the x axis, check for y axis requests
    if (anyDirectionAllowed || this.movingOnXAxis()) {
      if (this.directionRequests.y) {
        const requestedDir = new Vector2(0, this.directionRequests.y);
        this.directionRequests.y = 0; //consume
        return requestedDir;
      }
    }

    // if we are moving on the y axis, check for x axis requests
    if (anyDirectionAllowed || this.movingOnYAxis()) {
      if (this.directionRequests.x) {
        const requestedDir = new Vector2(this.directionRequests.x, 0);
        this.directionRequests.x = 0; //consume
        return requestedDir;
      }
    }

    return Vector2.zero;
  }

  private isMoving(): boolean {
    return !this.currentDirection.equals(Vector2.zero);
  }

  private movingOnXAxis(): boolean {
    return this.currentDirection.x != 0;
  }

  private movingOnYAxis(): boolean {
    return this.currentDirection.y != 0;
  }
}
