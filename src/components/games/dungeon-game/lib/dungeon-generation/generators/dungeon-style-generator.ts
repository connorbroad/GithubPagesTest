// duplicates increase the chance of that location
const location = [
    "Underwater",
    "Forest",
    "Forest",
    "Mountains",
    "Mountains",
    "Desert"
];

const constructionType = [
    "Natural formation",
    "Masonry"
];

const appearance = [
    "Well-maintained",
    "Decaying",
    "Abandoned",
    "Ruined",
    "Destroyed"
];

const lighting = [
    "No",
    "Organic",
    "Torch",
    "Torch",
    "Natural",
    "Magical"
];

export class DungeonFlavor {
    location: string;
    constructionType: string;
    appearance: string; // visual upkeep state
    lighting: string;
}

export class DungeonStyleGenerator {
    public static generate() {
        let style = new DungeonFlavor();
        style.location = DungeonStyleGenerator.getRandomLocation();
        style.constructionType = DungeonStyleGenerator.getRandomConstructionType();
        style.appearance = DungeonStyleGenerator.getRandomAppearance();
        style.lighting = DungeonStyleGenerator.getRandomLighting();
        return style;
    }

    private static getRandomLocation() {
        const index = Math.floor(Math.random() * location.length);

        if (index > location.length) {
            console.warn("Location index out of bounds: " + index);
            return "Location";
        }

        return location[index];
    }

    private static getRandomConstructionType() {
        const index = Math.floor(Math.random() * constructionType.length);

        if (index > constructionType.length) {
            console.warn("Construction type index out of bounds: " + index);
            return "Construction type";
        }

        return constructionType[index];
    }

    private static getRandomAppearance() {
        const index = Math.floor(Math.random() * appearance.length);

        if (index > appearance.length) {
            console.warn("Status index out of bounds: " + index);
            return "Status";
        }

        return appearance[index];
    }

    private static getRandomLighting() {
        const index = Math.floor(Math.random() * lighting.length);

        if (index > lighting.length) {
            console.warn("Lighting index out of bounds: " + index);
            return "Lighting";
        }

        return lighting[index];
    }
}