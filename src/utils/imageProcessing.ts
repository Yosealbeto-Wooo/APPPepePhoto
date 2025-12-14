import { removeBackground } from '@imgly/background-removal';
// import * as Upscaler from 'upscalerjs'; // Build failed
import { type FilterSettings, DEFAULT_SETTINGS } from '../types';

// const upscaler = new (Upscaler.default || Upscaler)();

export const removeImageBackground = async (imageSrc: string): Promise<string> => {
    const blob = await (await fetch(imageSrc)).blob();
    const pngBlob = await removeBackground(blob);
    return URL.createObjectURL(pngBlob);
};

// Convolution application for sharpening
const applyConvolution = (ctx: CanvasRenderingContext2D, width: number, height: number, kernel: number[]) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const buff = new Uint8ClampedArray(data.length);
    const kSize = Math.sqrt(kernel.length);
    const kCenter = Math.floor(kSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;
            for (let ky = 0; ky < kSize; ky++) {
                for (let kx = 0; kx < kSize; kx++) {
                    const py = y + (ky - kCenter);
                    const px = x + (kx - kCenter);
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const idx = (py * width + px) * 4;
                        const weight = kernel[ky * kSize + kx];
                        r += data[idx] * weight;
                        g += data[idx + 1] * weight;
                        b += data[idx + 2] * weight;
                    }
                }
            }
            const i = (y * width + x) * 4;
            buff[i] = r;
            buff[i + 1] = g;
            buff[i + 2] = b;
            buff[i + 3] = data[i + 3];
        }
    }

    // Copy back
    for (let i = 0; i < data.length; i++) data[i] = buff[i];
    ctx.putImageData(imageData, 0, 0);
};

export const applySharpen = async (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
    if (amount <= 0) return;
    // Simple kernel:
    // [0, -k, 0]
    // [-k, 4k+1, -k]
    // [0, -k, 0]
    // amount 0-100 -> k 0-1 roughly
    const k = amount / 100;
    const kernel = [
        0, -k, 0,
        -k, 4 * k + 1, -k,
        0, -k, 0
    ];
    applyConvolution(ctx, width, height, kernel);
};

export const improveImageQuality = async (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No context')); return; }

            ctx.drawImage(img, 0, 0);

            // Sharpen kernel
            const kernel = [
                0, -1, 0,
                -1, 5, -1,
                0, -1, 0
            ];
            applyConvolution(ctx, canvas.width, canvas.height, kernel);

            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

// Clone Stamp Application
export const applyCloneStamp = async (
    imageSrc: string,
    targetX: number,
    targetY: number,
    sourceX: number,
    sourceY: number,
    radius: number = 20
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No context')); return; }

            ctx.drawImage(img, 0, 0);

            // We clone from source to target.
            // Circular patch
            ctx.save();
            ctx.beginPath();
            ctx.arc(targetX, targetY, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip(); // Mask to target circle

            // Draw the image again, but offset so that sourceX aligns with targetX
            // Vector: target - source
            // If we draw image at (targetX - sourceX, targetY - sourceY), then point sourceX lands at targetX.
            const offsetX = targetX - sourceX;
            const offsetY = targetY - sourceY;

            // We want to draw the 'source' area into the 'target' area.
            // Since we clipped to target area, drawing the whole image shifted will reveal the source pixels there.
            // Wait, drawImage(img, dx, dy).
            // We want the pixel at sourceX to appear at targetX.
            // If we draw image at (dx, dy), then pixel at sourceX is at sourceX + dx.
            // We want sourceX + dx = targetX  =>  dx = targetX - sourceX.
            ctx.drawImage(img, offsetX, offsetY);

            ctx.restore();
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

export const applyRedEyeCorrection = async (imageSrc: string, x: number, y: number, radius: number = 20): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No context')); return; }

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Simple Red Eye reduction: find red pixels in radius and desaturate/darken
            // x, y are coordinates relative to intrinsic image size

            const rSq = radius * radius;

            for (let py = Math.floor(y - radius); py < y + radius; py++) {
                for (let px = Math.floor(x - radius); px < x + radius; px++) {
                    if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;

                    const distSq = (px - x) * (px - x) + (py - y) * (py - y);
                    if (distSq > rSq) continue;

                    const i = (py * canvas.width + px) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Check if pixel is "red" dominance
                    if (r > g + b) { // Very crude red check
                        // Convert to grayscale/desaturate
                        const avg = (g + b) / 2;
                        data[i] = avg;
                        data[i + 1] = avg;
                        data[i + 2] = avg;
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

/**
 * Generates a CSS filter string from the settings object.
 */
export const getFilterString = (settings: FilterSettings): string => {
    let filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) grayscale(${settings.grayscale}%) sepia(${settings.sepia}%) blur(${settings.blur}px) hue-rotate(${settings.hueRotate}deg)`;
    if (settings.sharpen > 0) {
        filter += ` url(#sharpen-filter)`;
    }
    return filter;
};

/**
 * Simple "text-to-filter" heuristic engine.
 * Maps keywords to preset filter configurations.
 */
export const textToFilterSettings = (prompt: string): FilterSettings => {
    const p = prompt.toLowerCase();
    const settings = { ...DEFAULT_SETTINGS };

    // Keywords mapping
    if (p.includes('vintage') || p.includes('retro') || p.includes('old')) {
        settings.sepia = 60;
        settings.contrast = 90;
        settings.brightness = 90;
        settings.saturation = 80;
    }

    if (p.includes('warm') || p.includes('summer') || p.includes('sunset')) {
        settings.sepia = 30;
        settings.saturation = 130;
        settings.brightness = 110;
    }

    if (p.includes('cool') || p.includes('cold') || p.includes('winter')) {
        settings.hueRotate = 180; // Shift towards blue roughly (this is crude)
        settings.saturation = 90;
        settings.brightness = 110;
    }

    if (p.includes('noir') || p.includes('black') || p.includes('white') || p.includes('mono')) {
        settings.grayscale = 100;
        settings.contrast = 130;
        settings.brightness = 110;
    }

    if (p.includes('cyberpunk') || p.includes('neon') || p.includes('future')) {
        settings.saturation = 150;
        settings.contrast = 130;
        settings.hueRotate = -20;
    }

    if (p.includes('dramatic') || p.includes('dark')) {
        settings.contrast = 150;
        settings.brightness = 80;
        settings.saturation = 110;
    }

    return settings;
};

export const cropImage = async (imageSrc: string, crop: { x: number, y: number, width: number, height: number }): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = crop.width;
            canvas.height = crop.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No context')); return; }

            // Draw slice
            ctx.drawImage(
                img,
                crop.x, crop.y, crop.width, crop.height, // Source rect
                0, 0, crop.width, crop.height // Dest rect
            );
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

export const applyStickers = async (imageSrc: string, stickers: { content: string, x: number, y: number, scale: number }[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('No context')); return; }

            // Draw base image
            ctx.drawImage(img, 0, 0);

            // Draw stickers
            ctx.font = `${Math.floor(img.width * 0.1)}px serif`; // Base size relative to image
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            stickers.forEach(sticker => {
                ctx.save();
                // sticker.x and y are 0-1 normalized coordinates
                const x = sticker.x * canvas.width;
                const y = sticker.y * canvas.height;
                const size = Math.floor(canvas.width * 0.1 * sticker.scale);
                ctx.font = `${size}px serif`;
                ctx.fillText(sticker.content, x, y);
                ctx.restore();
            });

            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

/**
 * Renders the image with filters to an actual Canvas/DataURL for downloading.
 */
export const processImage = async (
    imageSrc: string,
    settings: FilterSettings
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * settings.scale;
            canvas.height = img.height * settings.scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.save();
            ctx.filter = getFilterString(settings);

            // Translate to center
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((settings.rotate * Math.PI) / 180);
            ctx.scale(settings.scale, settings.scale);

            // Draw image centered
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            ctx.restore();

            // Apply sharpen if needed (must be done after filters drawn? No, filters are CSS ctx.filter).
            // Context filter applies to drawImage.
            // But Sharpen is custom convolution. We can't apply it easily unless we GetImageData.
            // However, SVG filter is part of ctx.filter in modern browsers? 
            // ctx.filter = 'url(#id)' works if id is in DOM.
            // But for offline process/file generation, relying on DOM element reference is risky or might not work in some conditions.
            // Safer to Manual Convolve if sharpen > 0.
            // BUT: we just drew with CSS filters (brightness etc). 
            // We need to GetImageData -> Convolve -> PutImageData.
            // This is heavy but correct for download.

            if (settings.sharpen > 0) {
                applySharpen(ctx, canvas.width, canvas.height, settings.sharpen);
            }

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
        img.src = imageSrc;
    });
};
