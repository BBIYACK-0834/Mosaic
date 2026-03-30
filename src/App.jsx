import { useMemo, useState } from 'react';
import Header from './components/Header/Header';
import ImageUploader from './components/ImageUploader/ImageUploader';
import TileGallery from './components/TileGallery/TileGallery';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import ProgressStatus from './components/ProgressStatus/ProgressStatus';
import PreviewPanel from './components/PreviewPanel/PreviewPanel';
import { useMosaicGenerator } from './hooks/useMosaicGenerator';
import { downloadCanvasAsPng } from './utils/download';
import styles from './App.module.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const DEFAULT_SETTINGS = {
  tileSize: 16,
  allowRepeat: true,
  outputWidth: 1200,
  outputRatio: 'original',
  previewQuality: 'medium',
  matchingMode: 'rgb-average',
};

const App = () => {
  const [mainImage, setMainImage] = useState({ file: null, previewUrl: '' });
  const [tiles, setTiles] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [uiError, setUiError] = useState('');

  const {
    outputCanvasRef,
    previewCanvasRef,
    status,
    progressPercent,
    resultInfo,
    isGenerating,
    errorMessage,
    resetResult,
    generateMosaic,
    analyzeTileImage,
  } = useMosaicGenerator();



  const canGenerate = !!mainImage.previewUrl && tiles.length > 0 && !isGenerating;

  const lowTileWarning = useMemo(() => {
    if (tiles.length >= 20) return '';
    if (!tiles.length) return '';
    return '타일 이미지 수가 적어 결과 품질이 낮아질 수 있습니다. (권장: 20장 이상)';
  }, [tiles.length]);

  const onMainImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUiError('지원하지 않는 파일 형식입니다. jpg, jpeg, png 파일만 업로드하세요.');
      return;
    }

    setUiError('');
    resetResult();

    if (mainImage.previewUrl) {
      URL.revokeObjectURL(mainImage.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setMainImage({ file, previewUrl });
  };

  const onAddTiles = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      setUiError('');

      const preparedTiles = [];

      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setUiError('일부 파일은 형식이 맞지 않아 제외되었습니다. (jpg/jpeg/png만 지원)');
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        const analyzed = await analyzeTileImage(previewUrl);

        preparedTiles.push({
          id: crypto.randomUUID(),
          file,
          previewUrl,
          imageElement: analyzed.imageElement,
          averageColor: analyzed.averageColor,
        });
      }

      if (preparedTiles.length) {
        setTiles((prev) => [...prev, ...preparedTiles]);
        resetResult();
      }
    } catch (err) {
      setUiError(err.message || '타일 이미지 처리 중 오류가 발생했습니다.');
    } finally {
      event.target.value = '';
    }
  };

  const onRemoveTile = (id) => {
    setTiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
    resetResult();
  };

  const onClearTiles = () => {
    tiles.forEach((tile) => {
      if (tile.previewUrl) URL.revokeObjectURL(tile.previewUrl);
    });
    setTiles([]);
    resetResult();
  };

  const onGenerate = async () => {
    setUiError('');
    await generateMosaic({ mainImageUrl: mainImage.previewUrl, tileItems: tiles, settings });
  };

  const onResetAll = () => {
    if (mainImage.previewUrl) URL.revokeObjectURL(mainImage.previewUrl);
    tiles.forEach((tile) => tile.previewUrl && URL.revokeObjectURL(tile.previewUrl));

    setMainImage({ file: null, previewUrl: '' });
    setTiles([]);
    setSettings(DEFAULT_SETTINGS);
    setUiError('');
    resetResult();
  };

  const onDownload = () => {
    downloadCanvasAsPng(outputCanvasRef.current, 'photo-mosaic.png');
  };

  const onChangeSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.layout}>
        <section className={styles.leftColumn}>
          <ImageUploader previewUrl={mainImage.previewUrl} onChange={onMainImageChange} disabled={isGenerating} />
          <TileGallery
            tiles={tiles}
            onAddTiles={onAddTiles}
            onRemoveTile={onRemoveTile}
            onClearTiles={onClearTiles}
            disabled={isGenerating}
          />
          <SettingsPanel settings={settings} onChange={onChangeSetting} disabled={isGenerating} />

          <section className={styles.actionsCard}>
            <button type="button" onClick={onGenerate} disabled={!canGenerate}>
              모자이크 생성
            </button>
            <button type="button" onClick={onResetAll} disabled={isGenerating} className={styles.secondary}>
              전체 초기화
            </button>
          </section>

          <ProgressStatus
            status={status}
            progressPercent={progressPercent}
            errorMessage={uiError || errorMessage}
            warningMessage={lowTileWarning}
          />
        </section>

        <section className={styles.rightColumn}>
          <PreviewPanel
            mainPreviewUrl={mainImage.previewUrl}
            previewCanvasRef={previewCanvasRef}
            outputCanvasRef={outputCanvasRef}
            resultInfo={resultInfo}
            onDownload={onDownload}
          />
        </section>
      </main>
    </div>
  );
};

export default App;
