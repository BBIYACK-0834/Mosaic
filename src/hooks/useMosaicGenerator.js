import { useCallback, useMemo, useRef, useState } from 'react';
import { findClosestTile } from '../utils/colorUtils';
import {
  calculateAverageColor,
  computeCanvasSize,
  getCoverSourceRect,
  loadImageFromUrl,
  waitNextFrame,
} from '../utils/imageProcessing';

const CHUNK_SIZE = 80;
const PREVIEW_SCALE = {
  low: 0.45,
  medium: 0.7,
  high: 1,
};

export const useMosaicGenerator = () => {
  const outputCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [status, setStatus] = useState({
    phase: 'idle',
    message: '생성 대기 중',
    processed: 0,
    total: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultInfo, setResultInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const progressPercent = useMemo(() => {
    if (!status.total) return 0;
    return Math.round((status.processed / status.total) * 100);
  }, [status]);

  const resetResult = useCallback(() => {
    setResultInfo(null);
    setStatus({ phase: 'idle', message: '생성 대기 중', processed: 0, total: 0 });
    setErrorMessage('');

    const outputCanvas = outputCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;

    if (outputCanvas) {
      const ctx = outputCanvas.getContext('2d');
      ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    }
    if (previewCanvas) {
      const ctx = previewCanvas.getContext('2d');
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }
  }, []);

  const generateMosaic = useCallback(
    async ({ mainImageUrl, tileItems, settings }) => {
      try {
        setErrorMessage('');

        if (!mainImageUrl) {
          throw new Error('대표 이미지를 먼저 업로드해주세요.');
        }
        if (!tileItems.length) {
          throw new Error('타일 이미지를 1장 이상 업로드해주세요.');
        }

        setIsGenerating(true);
        setStatus({ phase: 'analyzing', message: '대표 이미지 분석 중', processed: 0, total: 0 });

        const mainImage = await loadImageFromUrl(mainImageUrl);

        const canvasSize = computeCanvasSize({
          image: mainImage,
          outputWidth: Number(settings.outputWidth),
          ratio: settings.outputRatio,
        });

        const outputCanvas = outputCanvasRef.current;
        const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });

        outputCanvas.width = canvasSize.width;
        outputCanvas.height = canvasSize.height;

        const sourceRect = getCoverSourceRect(
          mainImage.width,
          mainImage.height,
          canvasSize.width,
          canvasSize.height,
        );

        outputCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        outputCtx.drawImage(
          mainImage,
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sw,
          sourceRect.sh,
          0,
          0,
          canvasSize.width,
          canvasSize.height,
        );

        const tileSize = Number(settings.tileSize);
        const cols = Math.floor(canvasSize.width / tileSize);
        const rows = Math.floor(canvasSize.height / tileSize);
        const totalCells = cols * rows;

        const baseImageData = outputCtx.getImageData(0, 0, canvasSize.width, canvasSize.height);

        setStatus({
          phase: 'rendering',
          message: '모자이크 생성 중',
          processed: 0,
          total: totalCells,
        });

        const usageMap = new Map();
        const tiles = tileItems;
        let processed = 0;

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const x = col * tileSize;
            const y = row * tileSize;

            // 셀 평균 색상 계산 (원본 이미지 기준)
            let r = 0;
            let g = 0;
            let b = 0;
            let count = 0;

            for (let py = y; py < y + tileSize; py += 1) {
              for (let px = x; px < x + tileSize; px += 1) {
                const idx = (py * canvasSize.width + px) * 4;
                r += baseImageData.data[idx];
                g += baseImageData.data[idx + 1];
                b += baseImageData.data[idx + 2];
                count += 1;
              }
            }

            const targetColor = {
              r: Math.round(r / count),
              g: Math.round(g / count),
              b: Math.round(b / count),
            };

            const selectedTile = findClosestTile({
              targetColor,
              tiles,
              allowRepeat: settings.allowRepeat,
              usageMap,
            });

            if (selectedTile?.imageElement) {
              const tileRect = getCoverSourceRect(
                selectedTile.imageElement.width,
                selectedTile.imageElement.height,
                tileSize,
                tileSize,
              );

              outputCtx.drawImage(
                selectedTile.imageElement,
                tileRect.sx,
                tileRect.sy,
                tileRect.sw,
                tileRect.sh,
                x,
                y,
                tileSize,
                tileSize,
              );
            }

            processed += 1;
            if (processed % CHUNK_SIZE === 0) {
              setStatus({
                phase: 'rendering',
                message: `모자이크 생성 중 (${processed} / ${totalCells} 셀)`,
                processed,
                total: totalCells,
              });
              await waitNextFrame();
            }
          }
        }

        const previewScale = PREVIEW_SCALE[settings.previewQuality] ?? 0.7;
        const previewCanvas = previewCanvasRef.current;
        const previewCtx = previewCanvas.getContext('2d');

        previewCanvas.width = Math.max(1, Math.round(canvasSize.width * previewScale));
        previewCanvas.height = Math.max(1, Math.round(canvasSize.height * previewScale));
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(outputCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

        setResultInfo({
          sourceWidth: mainImage.width,
          sourceHeight: mainImage.height,
          tileCount: tileItems.length,
          outputWidth: canvasSize.width,
          outputHeight: canvasSize.height,
          cellCount: totalCells,
          tileSize,
        });

        setStatus({
          phase: 'done',
          message: '생성이 완료되었습니다.',
          processed: totalCells,
          total: totalCells,
        });
      } catch (error) {
        setErrorMessage(error.message || '모자이크 생성 중 오류가 발생했습니다.');
        setStatus({
          phase: 'error',
          message: '오류가 발생했습니다.',
          processed: 0,
          total: 0,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const analyzeTileImage = useCallback(async (imageUrl) => {
    const imageElement = await loadImageFromUrl(imageUrl);
    const averageColor = calculateAverageColor(imageElement);

    return { imageElement, averageColor };
  }, []);

  return {
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
  };
};
