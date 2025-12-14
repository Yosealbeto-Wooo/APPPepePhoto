import React from 'react';
import { Download, Upload, Undo, Redo, Share2, Sparkles } from 'lucide-react';

interface TopBarProps {
    onUpload: (file: File) => void;
    onDownload: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isProcessing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
    onUpload, onDownload, onUndo, onRedo, canUndo, canRedo, isProcessing
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="glass-panel" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            margin: '1rem',
            marginBottom: 0
        }}>
            <div className="flex-center" style={{ gap: '1rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles className="text-primary" />
                    <span>PepePhoto</span>
                </h1>
            </div>

            <div className="flex-center" style={{ gap: '0.5rem' }}>
                <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={18} style={{ marginRight: '0.5rem' }} /> Upload
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

                <button className="btn-icon" onClick={onUndo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.5 }}>
                    <Undo size={20} />
                </button>
                <button className="btn-icon" onClick={onRedo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.5 }}>
                    <Redo size={20} />
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

                <button className="btn-icon" onClick={onDownload} disabled={isProcessing}>
                    <Download size={20} />
                </button>

                {/* Placeholder Share button - sharing usually requires Web Share API or backend */}
                <button className="btn-icon" onClick={() => alert('Sharing not implemented yet (requires HTTPS/Mobile)')}>
                    <Share2 size={20} />
                </button>
            </div>
        </div>
    );
};
