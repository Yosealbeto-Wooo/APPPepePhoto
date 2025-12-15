import React, { useState } from 'react';
import { type FilterSettings } from '../types';
import { Sliders, Wand2, Sparkles, RotateCw, EyeOff, Eraser, MousePointer2, Crop, Smile } from 'lucide-react';

interface ToolbarProps {
    settings: FilterSettings;
    updateSettings: (s: Partial<FilterSettings>) => void;
    onTextFilter: (text: string) => void;
    onRemoveBackground: () => void;
    onImproveQuality: () => void;
    onUpscale: (width: number) => void;
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
    onUpscale,
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

    const renderSlider = (label: string, value: number, min: number, max: number, onChange: (val: number) => void, unit: string = '') => (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>{label}</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{Math.round(value)}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
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
                    title="Ajustes Básicos"
                >
                    <Sliders size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'ai' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'ai' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('ai')}
                    title="Herramientas IA"
                >
                    <Wand2 size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'transform' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'transform' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('transform')}
                    title="Transformar"
                >
                    <RotateCw size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'retouch' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'retouch' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('retouch')}
                    title="Retoque"
                >
                    <EyeOff size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'eraser' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'eraser' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('eraser')}
                    title="Borrador Mágico"
                >
                    <Eraser size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'crop' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'crop' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('crop')}
                    title="Recortar"
                >
                    <Crop size={20} />
                </button>
                <button
                    className={`btn-icon ${activeTab === 'stickers' ? 'active' : ''}`}
                    style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'stickers' ? '2px solid var(--primary-color)' : 'none' }}
                    onClick={() => handleTabChange('stickers')}
                    title="Stickers"
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
                                Aplicar Stickers
                            </button>
                        )}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Haz clic para agregar. Arrastra para mover en la imagen. Aplica para fijarlos.
                        </p>
                    </div>
                )}

                {activeTab === 'adjust' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>AJUSTES BÁSICOS</h3>
                        {renderSlider('Brillo', settings.brightness, 0, 200, (v) => updateSettings({ brightness: v }), '%')}
                        {renderSlider('Contraste', settings.contrast, 0, 200, (v) => updateSettings({ contrast: v }), '%')}
                        {renderSlider('Saturación', settings.saturation, 0, 200, (v) => updateSettings({ saturation: v }), '%')}
                        {renderSlider('Nitidez', settings.sharpen, 0, 100, (v) => updateSettings({ sharpen: v }), '%')}
                        {renderSlider('Sepia', settings.sepia, 0, 100, (v) => updateSettings({ sepia: v }), '%')}
                        {renderSlider('Desenfoque', settings.blur, 0, 20, (v) => updateSettings({ blur: v }), 'px')}
                        {renderSlider('Matiz', settings.hueRotate, 0, 360, (v) => updateSettings({ hueRotate: v }), 'deg')}
                    </div>
                )}

                {activeTab === 'transform' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>TRANSFORMAR</h3>
                        {renderSlider('Rotar', settings.rotate, 0, 360, (v) => updateSettings({ rotate: v }), 'deg')}
                        {renderSlider('Escala', settings.scale, 0.5, 2, (v) => updateSettings({ scale: v }), 'x')}
                    </div>
                )}

                {activeTab === 'retouch' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>RETOQUE</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Haz clic en los ojos rojos de la imagen para corregirlos.
                        </p>
                        <div style={{ padding: '0.5rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-color)' }}>
                            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <EyeOff size={16} /> Corrector de Ojos Rojos Activo
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'eraser' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>BORRADOR MÁGICO</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Tampón de Clonar: Elige un área de origen y pinta sobre objetos no deseados.
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
                            {isSettingSource ? 'Toca un punto de origen...' : 'Definir Punto de Origen'}
                        </button>

                        <div style={{ padding: '0.5rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-color)' }}>
                            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {hasCloneSource ? <Eraser size={16} /> : <MousePointer2 size={16} />}
                                {hasCloneSource ? 'Listo para borrar (Toca objeto)' : 'Origen no definido'}
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === 'crop' && (
                    <div>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>RECORTAR</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Arrastra sobre la imagen para seleccionar el área de recorte.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={onApplyCrop}>Aplicar</button>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancelCrop}>Cancelar</button>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0 }}>FILTRO DE TEXTO</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="ej. atardecer cálido"
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

                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0 }}>HERRAMIENTAS</h3>

                        <button
                            className="btn-primary"
                            onClick={onRemoveBackground}
                            disabled={isProcessing}
                            style={{ width: '100%', position: 'relative' }}
                        >
                            {isProcessing ? 'Procesando...' : 'Remover Fondo'}
                        </button>

                        <button
                            className="btn-primary"
                            onClick={onImproveQuality}
                            disabled={isProcessing}
                            style={{ width: '100%' }}
                        >
                            {isProcessing ? 'Procesando...' : 'Mejorar Nitidez'}
                        </button>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => onUpscale(2048)}
                                disabled={isProcessing}
                                style={{ flex: 1 }}
                            >
                                {isProcessing ? '...' : 'Mejorar a 2K'}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => onUpscale(3840)}
                                disabled={isProcessing}
                                style={{ flex: 1 }}
                            >
                                {isProcessing ? '...' : 'Mejorar a 4K'}
                            </button>
                        </div>

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Nota: Las acciones de procesamiento son irreversibles y se añaden al historial.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
