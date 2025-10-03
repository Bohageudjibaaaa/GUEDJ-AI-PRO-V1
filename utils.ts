// This utility helps determine if text should be light or dark based on the background color.
export function getTextColorForBackground(hexColor: string): string {
    if (!hexColor.startsWith('#')) {
        // This can happen if the CSS variable isn't loaded yet.
        // We'll return a default that works on light/dark backgrounds.
        if (document.documentElement.classList.contains('dark')) {
            return '#FFFFFF';
        }
        return '#000000';
    }

    try {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Formula for luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    } catch (e) {
        console.error("Could not parse color", hexColor);
        return '#000000';
    }
}