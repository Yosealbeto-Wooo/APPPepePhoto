import React, { useState } from 'react';
import { type FilterSettings } from '../types';
import { Sliders, Wand2, Sparkles, RotateCw, EyeOff, Eraser, MousePointer2, Crop, Smile } from 'lucide-react';

interface ToolbarProps {
    settings: FilterSettings;
    updateSettings: (s: Partial<FilterSettings>) => void;
    onTextFilter: (text: string) => void;
    onRemoveBackground: () => void;
    onImproveQuality: () => void;
    isProcessing: boolean;
    onActiveTabChange?: (tab: string) => void;
    // Clone Stamp Props
    isSettingSource?: boolean;
    onToggleSetSource?: () => void;
    hasCloneSource?: boolean;
    // Crop Props
    onApplyCrop?: () => void;
    onCancelCrop?: () => void;
    // Sticker Props
    onAddSticker?: (content: string) => void;
    onApplyStickers?: () => void;
    hasStickers?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    settings,
    updateSettings,
    onTextFilter,
    onRemoveBackground,
    onImproveQuality,
    isProcessing,
    onActiveTabChange,
    isSettingSource,
    onToggleSetSource,
    hasCloneSource,
    onApplyCrop,
    onCancelCrop,
    onAddSticker,
    onApplyStickers,
    hasStickers
}) => {
    const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'ai' | 'transform' | 'retouch' | 'eraser' | 'crop' | 'stickers'>('adjust');
    const [prompt, setPrompt] = useState('');

    const handleTabChange = (tab: 'adjust' | 'filters' | 'ai' | 'transform' | 'retouch' | 'eraser' | 'crop' | 'stickers') => {
        setActiveTab(tab);
        if (onActiveTabChange) onActiveTabChange(tab);
    };

    const stickers = ["😀", "😎", "😍", "🥳", "🤔", "🤬", "💩", "🤡", "👻", "👽", "🤖", "🎃", "👍", "👎", "❤️", "🔥", "✨", "🎉"];

    const renderSlider = (
        label: string,
        value: number,
        min: number,
        max: number,
        key: keyof FilterSettings,
        unit: string = ''
    ) => (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                <span>{label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => updateSettings({ [key]: Number(e.target.value) })}
            />
        </div>
    );

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    className={`btn-icon ${activeTab === 'adjust' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'adjust' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('adjust')}
                >
                    <Sliders size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'ai' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'ai' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('ai')}
                >
                    <Wand2 size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'transform' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'transform' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('transform')}
                >
                    <RotateCw size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'retouch' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'retouch' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('retouch')}
                >
                    <EyeOff size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'eraser' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'eraser' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('eraser')}
                >
                    <Eraser size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'crop' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'crop' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('crop')}
                >
                    <Crop size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'stickers' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'stickers' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('stickers')}
                >
                    <Smile size={20} />
                </button>
            </div>

            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
                {activeTab === 'stickers' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>STICKERS</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                            {stickers.map(s => (
                                <button
                                    key={s}
                                    style={{ fontSize: '1.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: '0.25rem' }}
                                    onClick={() => onAddSticker && onAddSticker(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        {hasStickers && (
                            <button className="btn-primary" style={{ width: '100%' }} onClick={onApplyStickers}>
                                Apply Stickers
                            </button>
                        )}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Click to add. Drag to move on image. Apply to bake them in.
                        </p>
                    </div>
                )}

                {activeTab === 'adjust' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>BASIC ADJUSTMENTS</h3>
                        {renderSlider('Brightness', settings.brightness, 0, 200, 'brightness', '%')}
                        {renderSlider('Contrast', settings.contrast, 0, 200, 'contrast', '%')}
                        {renderSlider('Saturation', settings.saturation, 0, 200, 'saturation', '%')}
                        {renderSlider('Sepia', settings.sepia, 0, 100, 'sepia', '%')}
                        {renderSlider('Blur', settings.blur, 0, 20, 'blur', 'px')}
                        {renderSlider('Hue Rotate', settings.hueRotate, 0, 360, 'hueRotate', 'deg')}
                    </div>
                )}

                {activeTab === 'transform' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>TRANSFORM</h3>
                        {renderSlider('Rotate', settings.rotate, 0, 360, 'rotate', 'deg')}
                        {renderSlider('Scale', settings.scale, 0.5, 2, 'scale', 'x')}
                    </div>
                )}

                {activeTab === 'retouch' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>RETOUCH</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Click on red eyes in the image to correct them.
                        </p>
                        <div style={{ padding: '0.5rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-color)' }}>
                            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <EyeOff size={16} /> Red Eye Tool Active
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'eraser' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>MAGIC ERASER</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Clone Stamp: Pick a source area and paint over unwanted objects.
                        </p>

                        <button
                            className="btn-primary"
                            style={{
                                width: '100%',
                                marginBottom: '1rem',
                                background: isSettingSource ? 'var(--highlight)' : 'var(--primary-color)'
                            }}
                            onClick={onToggleSetSource}
                        >
                            <MousePointer2 size={16} style={{ marginRight: '0.5rem' }} />
                            {isSettingSource ? 'Tap a source point...' : 'Set Source Point'}
                        </button>

                        <div style={{ padding: '0.5rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-color)' }}>
                            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {hasCloneSource ? <Eraser size={16} /> : <MousePointer2 size={16} />}
                                {hasCloneSource ? 'Ready to Erase (Tap object)' : 'Source not set'}
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'crop' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>CROP</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Drag on the image to select crop area.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={onApplyCrop}>Apply</button>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancelCrop}>Cancel</button>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0 }}>TEXT FILTER</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. warm sunset"
                                    style={{
                                        flex: 1,
                                        background: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '0.5rem'
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && onTextFilter(prompt)}
                                />
                                <button
                                    className="btn-primary"
                                    style={{ padding: '0.5rem' }}
                                    onClick={() => onTextFilter(prompt)}
                                >
                                    <Sparkles size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--border-color)' }} />

                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0 }}>TOOLS</h3>

                        <button
                            className="btn-primary"
                            onClick={onRemoveBackground}
                            disabled={isProcessing}
                            style={{ width: '100%', position: 'relative' }}
                        >
                            {isProcessing ? 'Processing...' : 'Remove Background'}
                        </button>

                        <button
                            className="btn-primary"
                            onClick={onImproveQuality}
                            disabled={isProcessing}
                            style={{ width: '100%' }}
                        >
                            {isProcessing ? 'Processing...' : 'Improve Quality'}
                        </button>

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Note: Processing actions are irreversible and added to history.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
