export enum KnownGames {
    ScreenTest,
    Snake,
    Dungeon
}

export class ZDepthHelper {
    // Converts a layer and percentage (0-1) into a zDepth value. Higher percentage is drawn above lower percentage.
    public static getMeshZDepth(layer: GameLayer, perc: number): number {
        if (perc < 0 || perc > 1) {
            console.error("Invalid percentage for zDepth: " + perc);
            return -1;
        }

        const min = GameLayerPercentages[layer];
        const max = GameLayerPercentages[layer + 1];
        if (min === undefined || max === undefined) {
            console.error("Invalid layer for zDepth: " + layer);
            return -1;
        }

        let zDepth = min + ((max - min) * perc);
        zDepth = zDepth * CameraMaxZ;
        return zDepth;
    }
}

export enum GameLayer {
    Background,
    Game,
    UI
}
export enum GameLayerPos {
    Bottom = 0.01,
    Middle = 0.5,
    Top = 0.99
}
export const GameLayerPercentages: number[] = Array.from(
    { length: Object.keys(GameLayer).length / 2 + 1 }, // Enum keys include both names and values, so divide by 2
    (_, i) => i / (Object.keys(GameLayer).length / 2)
);
export const CameraMaxZ = 1000; // min is 0

export enum BiimoButton {
    Up = "d-pad-up-button",
    Down = "d-pad-down-button",
    Left = "d-pad-left-button",
    Right = "d-pad-right-button",
    A = "button-a",
    B = "button-b",
    Start = "button-start",
    Select = "button-select",
    Unknown = "button-unknown"
}

export function isBiimoButton(buttonId: string): buttonId is BiimoButton {
    return Object.values(BiimoButton).includes(buttonId as BiimoButton);
}

// get the BiimoButton enum value from a string, or undefined if not valid
export function getBiimoButton(buttonId: string): BiimoButton | undefined {
    if (isBiimoButton(buttonId)) {
        return buttonId as BiimoButton;
    }
    return undefined;
}