import React from 'react';
import { Layout } from './components/Layout';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { useImageEditor } from './hooks/useImageEditor';
import { processImage } from './utils/imageProcessing';

function App() {
  const {
    state,
    isProcessing,
    loadImage,
    updateSettings,
    applyTextFilter,
    handleRemoveBackground,
    handleImproveQuality,
    handleRedEyeCorrection,
    handleCloneStamp,
    handleCrop,
    handleApplyStickers,
    undo,
    redo
  } = useImageEditor();

  const [activeTab, setActiveTab] = React.useState('adjust');
  const [cloneSource, setCloneSource] = React.useState<{ x: number, y: number } | null>(null);
  const [isSettingSource, setIsSettingSource] = React.useState(false);

  /* Wrapper for stickers */
  const [stickers, setStickers] = React.useState<{ id: number, content: string, x: number, y: number, scale: number }[]>([]);

  const addSticker = (content: string) => {
    setStickers([...stickers, { id: Date.now(), content, x: 0.5, y: 0.5, scale: 1 }]);
  };

  const updateSticker = (id: number, updates: Partial<{ x: number, y: number, scale: number }>) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSticker = (id: number) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const applyStickersToCanvas = async () => {
    if (stickers.length > 0) {
      await handleApplyStickers(stickers);
      setStickers([]);
      setActiveTab('adjust');
    }
  };

  /* Crop State */
  const [crop, setCrop] = React.useState<any>();
  const [completedCrop, setCompletedCrop] = React.useState<any>(null);

  const onCropChange = (c: any, p: any) => {
    setCrop(c);
    setCompletedCrop(p);
  };

  const applyCrop = () => {
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      handleCrop(completedCrop);
      setCrop(undefined);
      setCompletedCrop(null);
      setActiveTab('adjust');
    }
  };

  const cancelCrop = () => {
    setCrop(undefined);
    setCompletedCrop(null);
    setActiveTab('adjust');
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (activeTab === 'retouch') {
      handleRedEyeCorrection(x, y);
    } else if (activeTab === 'eraser') {
      if (isSettingSource) {
        setCloneSource({ x, y });
        setIsSettingSource(false);
        // alert('Source set! Now click to clone.');
      } else {
        if (cloneSource) {
          handleCloneStamp(x, y, cloneSource.x, cloneSource.y);
        } else {
          alert('Please set a source point first by clicking "Set Source Point"');
          setIsSettingSource(true);
        }
      }
    }
  };

  const handleDownload = async () => {
    if (!state.currentImage) return;
    try {
      // Process image to apply current CSS filters to pixel data
      const processedDataUrl = await processImage(state.currentImage, state.settings);

      const link = document.createElement('a');
      link.download = `edited-${state.filename}`;
      link.href = processedDataUrl;
      link.click();
    } catch (e) {
      console.error('Download failed', e);
      alert('Failed to generate download image');
    }
  };

  return (
    <Layout
      topBar={
        <TopBar
          onUpload={loadImage}
          onDownload={handleDownload}
          onUndo={undo}
          onRedo={redo}
          canUndo={state.historyIndex > 0}
          canRedo={state.historyIndex < state.history.length - 1}
          isProcessing={isProcessing}
        />
      }
      toolbar={
        <Toolbar
          settings={state.settings}
          updateSettings={updateSettings}
          onTextFilter={applyTextFilter}
          onRemoveBackground={handleRemoveBackground}
          onImproveQuality={handleImproveQuality}
          isProcessing={isProcessing}
          onActiveTabChange={setActiveTab}
          isSettingSource={isSettingSource}
          onToggleSetSource={() => setIsSettingSource(!isSettingSource)}
          hasCloneSource={!!cloneSource}
          onApplyCrop={applyCrop}
          onCancelCrop={cancelCrop}
          onAddSticker={addSticker}
          onApplyStickers={applyStickersToCanvas}
          hasStickers={stickers.length > 0}
        />
      }
      workspace={
        <CanvasWorkspace
          imageSrc={state.currentImage}
          settings={state.settings}
          isInteractive={activeTab === 'retouch' || activeTab === 'eraser'}
          isCropping={activeTab === 'crop'}
          crop={crop}
          onCropChange={onCropChange}
          onCanvasClick={handleCanvasClick}
          stickers={stickers}
          onUpdateSticker={updateSticker}
          onRemoveSticker={removeSticker}
        />
      }
    />
  );
}

export default App;
