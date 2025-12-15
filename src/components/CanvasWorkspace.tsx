import React, { useRef, useState, useEffect } from 'react';
import { ReactCompareSlider } from 'react-compare-slider';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
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

    // Zoom State
    const [zoom, setZoom] = useState<number>(1);
    const [isFit, setIsFit] = useState<boolean>(true);
    const [imgSize, setImgSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });

    // Reset zoom when image changes
    useEffect(() => {
        setIsFit(true);
        setZoom(1);
    }, [imageSrc]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setImgSize({ width: naturalWidth, height: naturalHeight });
    };

    const handleZoomIn = () => {
        setIsFit(false);
        setZoom(prev => Math.min(prev * 1.2, 5)); // Max 5x
    };

    const handleZoomOut = () => {
        setIsFit(false);
        setZoom(prev => Math.max(prev / 1.2, 0.1)); // Min 0.1x
    };

    const toggleFit = () => {
        setIsFit(prev => !prev);
        if (!isFit) setZoom(1); // Reset zoom level when going back to fit (visually)
    };

    const getContainerStyle = (): React.CSSProperties => {
        if (isFit) {
            return {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            };
        }
        return {
            display: 'block', // Block allows scrolling
            width: '100%',
            height: '100%',
            overflow: 'auto',
            textAlign: 'center' // Centers image if smaller than viewport
        };
    };

    const getImageStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            transition: 'width 0.2s, height 0.2s',
            display: 'block', // Removes space below img
            margin: isFit ? 0 : 'auto' // Center in scroll view
        };

        if (isFit) {
            return {
                ...baseStyle,
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                pointerEvents: isInteractive ? 'none' : 'auto' // Pass clicks through if interactive? 
            };
        }

        // Exact dimensions
        if (imgSize.width > 0) {
            return {
                ...baseStyle,
                width: `${imgSize.width * zoom}px`,
                height: `${imgSize.height * zoom}px`,
                maxWidth: 'none',
                maxHeight: 'none'
            };
        }

        return baseStyle;
    };


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
                    <p>No hay imagen cargada</p>
                    <p style={{ fontSize: '0.8rem' }}>Sube una imagen para comenzar a editar</p>
                </div>
            </div>
        );
    }

    const filterString = getFilterString(settings);
    const transformString = `rotate(${settings.rotate}deg) scale(${settings.scale})`;

    const ZoomControls = () => (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem',
            zIndex: 50,
            background: 'rgba(15, 23, 42, 0.8)'
        }}>
            <button className="btn-icon" onClick={handleZoomOut} title="Reducir Zoom">
                <ZoomOut size={20} />
            </button>
            <span style={{ minWidth: '3rem', textAlign: 'center', fontSize: '0.8rem', alignSelf: 'center' }}>
                {isFit ? 'Fit' : `${Math.round(zoom * 100)}%`}
            </span>
            <button className="btn-icon" onClick={handleZoomIn} title="Aumentar Zoom">
                <ZoomIn size={20} />
            </button>
            <div style={{ width: 1, background: 'var(--border-color)', margin: '0 0.25rem' }} />
            <button className="btn-icon" onClick={toggleFit} title={isFit ? "Tamaño Real (100%)" : "Ajustar a Pantalla"}>
                {isFit ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
            </button>
        </div>
    );

    if (isCropping) {
        return (
            <div className="glass-panel" style={{ flex: 1, height: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                {/* React Crop wraps the image */}
                <ReactCrop
                    crop={crop}
                    onChange={(c) => onCropChange && onCropChange(c as any, c as any)}
                    aspect={undefined}
                >
                    <img ref={imgRef} src={imageSrc} style={{ maxWidth: '80vw', maxHeight: '80vh' }} alt="Recortar Imagen" />
                </ReactCrop>
            </div>
        );
    }

    if (isInteractive || (stickers && stickers.length > 0)) {
        return (
            <div className="glass-panel" style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div
                    style={getContainerStyle()}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        ref={containerRef}
                        style={{
                            position: 'relative',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                            cursor: isInteractive ? 'crosshair' : 'default',
                            filter: filterString,
                            transform: transformString,
                            transformOrigin: 'center',
                            ...getImageStyle() // Apply sizing here
                        }}
                        onClick={handleImageClick}
                    >
                        <img
                            src={imageSrc}
                            style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
                            alt="Editando"
                            onLoad={handleImageLoad}
                        />
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
                                title="Doble clic para eliminar"
                            >
                                {s.content}
                            </div>
                        ))}
                    </div>
                </div>

                {isInteractive && (
                    <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '0.5rem', borderRadius: '0.5rem', pointerEvents: 'none', zIndex: 20 }}>
                        Toca la imagen para interactuar
                    </div>
                )}
                <ZoomControls />
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={getContainerStyle()}>
                <div style={{
                    ...getImageStyle(),
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}>
                    <ReactCompareSlider
                        itemOne={
                            <img src={imageSrc} style={{ width: '100%', height: '100%', display: 'block' }} alt="Original" />
                        }
                        itemTwo={
                            <div style={{ filter: filterString, transform: transformString, transformOrigin: 'center', width: '100%', height: '100%' }}>
                                <img src={imageSrc} style={{ width: '100%', height: '100%', display: 'block' }} alt="Después" onLoad={handleImageLoad} />
                            </div>
                        }
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                pointerEvents: 'none',
                zIndex: 40 // Below zoom controls if they overlap
            }}>
                Izq: Original • Der: Editado
            </div>

            <ZoomControls />

            {/* Hidden SVG Filter for Real-time Sharpening */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="sharpen-filter">
                        <feConvolveMatrix
                            order="3"
                            kernelMatrix={`0 -${settings.sharpen / 100} 0 -${settings.sharpen / 100} ${1 + 4 * (settings.sharpen / 100)} -${settings.sharpen / 100} 0 -${settings.sharpen / 100} 0`}
                            preserveAlpha="true"
                        />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};
