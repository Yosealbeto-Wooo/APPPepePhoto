import React, { useRef, useState } from 'react';
import { ReactCompareSlider } from 'react-compare-slider';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { type FilterSettings } from '../types';
import { getFilterString } from '../utils/imageProcessing';

interface CanvasWorkspaceProps {
    imageSrc: string | null;
    settings: FilterSettings;
    onCanvasClick?: (x: number, y: number) => void;
    isInteractive?: boolean;
    isCropping?: boolean;
    crop?: Crop;
    onCropChange?: (crop: Crop, pixelCrop: PixelCrop) => void;
    // Stickers
    stickers?: { id: number, content: string, x: number, y: number, scale: number }[];
    onUpdateSticker?: (id: number, updates: Partial<{ x: number, y: number, scale: number }>) => void;
    onRemoveSticker?: (id: number) => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
    imageSrc,
    settings,
    onCanvasClick,
    isInteractive,
    isCropping,
    crop,
    onCropChange,
    stickers,
    onUpdateSticker,
    onRemoveSticker
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingSticker, setDraggingSticker] = useState<number | null>(null);

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isInteractive || !onCanvasClick || isCropping || draggingSticker !== null) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        onCanvasClick(x, y);
    };

    const handleStickerMouseDown = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setDraggingSticker(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingSticker !== null && onUpdateSticker && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calculate new X, Y in percentage
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            // Clamp to 0-1
            const clampedX = Math.max(0, Math.min(1, x));
            const clampedY = Math.max(0, Math.min(1, y));
            onUpdateSticker(draggingSticker, { x: clampedX, y: clampedY });
        }
    };

    const handleMouseUp = () => {
        setDraggingSticker(null);
    };

    if (!imageSrc) {
        return (
            <div className="glass-panel flex-center" style={{ flex: 1, height: '100%', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <p>No image loaded</p>
                    <p style={{ fontSize: '0.8rem' }}>Upload an image to start editing</p>
                </div>
            </div>
        );
    }

    const filterString = getFilterString(settings);
    const transformString = `rotate(${settings.rotate}deg) scale(${settings.scale})`;

    if (isCropping) {
        return (
            <div className="glass-panel" style={{ flex: 1, height: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                {/* React Crop wraps the image */}
                <ReactCrop
                    crop={crop}
                    onChange={(c) => onCropChange && onCropChange(c as any, c as any)}
                    aspect={undefined}
                >
                    <img ref={imgRef} src={imageSrc} style={{ maxWidth: '80vw', maxHeight: '80vh' }} alt="Crop Source" />
                </ReactCrop>
            </div>
        );
    }

    if (isInteractive || (stickers && stickers.length > 0)) {
        return (
            <div
                className="glass-panel"
                style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    ref={containerRef}
                    style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', cursor: isInteractive ? 'crosshair' : 'default', filter: filterString, transform: transformString, transformOrigin: 'center' }}
                    onClick={handleImageClick}
                >
                    <img src={imageSrc} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', pointerEvents: 'none' }} alt="Editing" />
                    {/* Render Stickers Layer */}
                    {stickers && stickers.map(s => (
                        <div
                            key={s.id}
                            style={{
                                position: 'absolute',
                                left: `${s.x * 100}%`,
                                top: `${s.y * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: `${s.scale * 3}rem`, // Approximate sizing
                                cursor: 'move',
                                userSelect: 'none',
                                zIndex: 10
                            }}
                            onMouseDown={(e) => handleStickerMouseDown(e, s.id)}
                            onDoubleClick={(e) => { e.stopPropagation(); onRemoveSticker && onRemoveSticker(s.id); }}
                            title="Double click to remove"
                        >
                            {s.content}
                        </div>
                    ))}
                </div>
                {isInteractive && (
                    <div style={{ position: 'absolute', top: '2rem', background: 'rgba(0,0,0,0.7)', padding: '0.5rem', borderRadius: '0.5rem', pointerEvents: 'none', zIndex: 20 }}>
                        Tap image to interact
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <ReactCompareSlider
                    itemOne={
                        <img src={imageSrc} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} alt="Original" />
                    }
                    itemTwo={
                        <div style={{ filter: filterString, transform: transformString, transformOrigin: 'center' }}>
                            <img src={imageSrc} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} alt="After" />
                        </div>
                    }
                    style={{ width: '100%', height: '100%' }} // Fit to container
                />
                <div style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    pointerEvents: 'none'
                }}>
                    Left: Original • Right: Edited
                </div>
            </div>
        </div>
    );
};
