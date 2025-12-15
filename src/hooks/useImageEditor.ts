import { useState, useCallback } from 'react';
import { type EditorState, type FilterSettings, DEFAULT_SETTINGS } from '../types';
import { removeImageBackground, improveImageQuality, textToFilterSettings, applyRedEyeCorrection, applyCloneStamp, cropImage, applyStickers, upscaleImage } from '../utils/imageProcessing';

export const useImageEditor = () => {
    const [state, setState] = useState<EditorState>({
        originalImage: null,
        currentImage: null,
        history: [],
        historyIndex: -1,
        filename: 'image.png',
        settings: { ...DEFAULT_SETTINGS },
        dimensions: { width: 0, height: 0 },
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const pushHistory = useCallback((newImage: string) => {
        setState(prev => {
            const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), newImage];
            return {
                ...prev,
                currentImage: newImage,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, []);

    const loadImage = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
                setState({
                    originalImage: result,
                    currentImage: result,
                    history: [result],
                    historyIndex: 0,
                    filename: file.name,
                    settings: { ...DEFAULT_SETTINGS },
                    dimensions: { width: img.width, height: img.height }
                });
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    }, []);

    const updateSettings = useCallback((newSettings: Partial<FilterSettings>) => {
        setState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    }, []);

    const applyTextFilter = useCallback((prompt: string) => {
        const newSettings = textToFilterSettings(prompt);
        setState(prev => ({
            ...prev,
            settings: newSettings
        }));
    }, []);

    // Destructive Actions
    const handleRemoveBackground = useCallback(async () => {
        if (!state.currentImage) return;
        setIsProcessing(true);
        try {
            const newSrc = await removeImageBackground(state.currentImage); // using current so previous edits might be lost if we don't bake them?
            // Actually best to use original or current?
            // If we remove BG, we probably want to keep that as the new base.
            pushHistory(newSrc);
            // Reset settings because they might not apply well to new image? Or keep them?
            // Let's keep settings.
            setState(prev => ({ ...prev, originalImage: newSrc }));
        } catch (e) {
            console.error(e);
            alert('Error al eliminar el fondo');
        }
        setIsProcessing(false);
    }, [state.currentImage, pushHistory]);

    const handleImproveQuality = useCallback(async () => {
        if (!state.currentImage) return;
        setIsProcessing(true);
        try {
            const newSrc = await improveImageQuality(state.currentImage);
            pushHistory(newSrc);
            setState(prev => ({ ...prev, originalImage: newSrc }));
        } catch (e) {
            console.error(e);
            alert('Error al mejorar la calidad');
        }
        setIsProcessing(false);
    }, [state.currentImage, pushHistory]);

    const handleUpscale = useCallback(async (targetWidth: number) => {
        if (!state.currentImage) return;
        setIsProcessing(true);
        try {
            const newSrc = await upscaleImage(state.currentImage, targetWidth);
            pushHistory(newSrc);
            setState(prev => ({ ...prev, originalImage: newSrc }));
        } catch (e) {
            console.error(e);
            alert('Error al escalar la imagen');
        }
        setIsProcessing(false);
    }, [state.currentImage, pushHistory]);

    const undo = () => {
        setState(prev => {
            if (prev.historyIndex <= 0) return prev;
            const newIndex = prev.historyIndex - 1;
            return {
                ...prev,
                currentImage: prev.history[newIndex],
                historyIndex: newIndex,
                originalImage: prev.history[newIndex] // Reverting base
            };
        });
    };

    const redo = () => {
        setState(prev => {
            if (prev.historyIndex >= prev.history.length - 1) return prev;
            const newIndex = prev.historyIndex + 1;
            return {
                ...prev,
                currentImage: prev.history[newIndex],
                historyIndex: newIndex,
                originalImage: prev.history[newIndex]
            };
        });
    };

    const handleCloneStamp = useCallback(async (targetX: number, targetY: number, sourceX: number, sourceY: number, radius: number = 20) => {
        if (!state.currentImage) return;
        // Note: Clone Stamp is usually a drag operation (many points). Doing full re-render per point is slow.
        // For MVP, we might accept single clicks or we need a better stroke handling mechanism (e.g. cumulative canvas ops).
        // But given our async architecture (load img -> draw -> save), dragging will lag.
        // Optimization: We could keep a 'draft' canvas active?
        // For now, let's implement click-to-stamp (Stamp Tool) rather than Brush.
        setIsProcessing(true);
        try {
            const img = new Image();
            img.src = state.currentImage;
            await img.decode();

            const tX = targetX * img.width;
            const tY = targetY * img.height;
            const sX = sourceX * img.width;
            const sY = sourceY * img.height;

            const newSrc = await applyCloneStamp(state.currentImage, tX, tY, sX, sY, radius);
            // Don't push to history on every drag frame. Ideally only on mouse up.
            // For click-stamp, pushing to history is fine.
            pushHistory(newSrc);
            setState(prev => ({ ...prev, originalImage: newSrc }));
        } catch (e) {
            console.error(e);
        }
        setIsProcessing(false);
    }, [state.currentImage, pushHistory]);

    const handleCrop = useCallback(async (crop: { x: number, y: number, width: number, height: number }) => {
        if (!state.currentImage) return;
        setIsProcessing(true);
        try {
            const img = new Image();
            img.src = state.currentImage;
            await img.decode();
            // Assumes crop is in Pixel coordinates (Natural size)
            const newSrc = await cropImage(state.currentImage, crop);
            pushHistory(newSrc);
            setState(prev => ({ ...prev, originalImage: newSrc }));
        } catch (e) {
            console.error("Crop error", e);
        }
        setIsProcessing(false);
    }, [state.currentImage, pushHistory]);

    const handleApplyStickers = useCallback(async (stickers: { content: string, x: number, y: number, scale: number }[]) => {
        if (!state.currentImage) return;
        setIsProcessing(true);
        try {
            const newSrc = await applyStickers(state.currentImage, stickers);
            pushHistory(newSrc);
            setState(prev => ({ ...prev, originalImage: newSrc }));
        } catch (e) {
            console.error("Sticker error", e);
        }
        setIsProcessing(false);
    }, [state.currentImage, pushHistory]);

    const handleRedEyeCorrection = useCallback(async (x: number, y: number) => {
        if (!state.currentImage) return;
        setIsProcessing(true);
        try {
            // Calculate intrinsic coordinates from view coordinates
            const img = new Image();
            img.src = state.currentImage;
            await img.decode();

            // Note: The UI layer needs to provide relative coords or we calculate scaling here.
            // Assuming x,y are 0-1 normalized coords or absolute View coords?
            // Let's assume the component calculates the scale factor, or passes logic for us.
            // Better: Pass 0-1 relative coords from UI.
            const intrinsicX = x * img.width;
            const intrinsicY = y * img.height;

            const newSrc = await applyRedEyeCorrection(state.currentImage, intrinsicX, intrinsicY, 15); // radius 15px intrinsic
            pushHistory(newSrc);
            setState(prev => ({ ...prev, originalImage: newSrc }));
        } catch (e) {
            console.error(e);
        }
        setIsProcessing(false);
    }, [state.currentImage, pushHistory]);

    return {
        state,
        isProcessing,
        loadImage,
        updateSettings,
        applyTextFilter,
        handleRemoveBackground,
        handleImproveQuality,
        handleUpscale,
        handleRedEyeCorrection,
        handleCloneStamp,
        handleCrop,
        handleApplyStickers,
        undo,
        redo
    };
};
