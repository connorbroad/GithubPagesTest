export class DiceRoller {
    public static rollD6(): number {
        return Math.floor(Math.random() * 6) + 1;
    }

    public static rollD8(): number {
        return Math.floor(Math.random() * 8) + 1;
    }

    public static rollD10(): number {
        return Math.floor(Math.random() * 10) + 1;
    }

    public static rollD12(): number {
        return Math.floor(Math.random() * 12) + 1;
    }

    public static rollD20(): number {
        return Math.floor(Math.random() * 20) + 1;
    }
}