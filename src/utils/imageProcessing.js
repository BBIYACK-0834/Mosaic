const ANALYSIS_SIZE = 32;

export const waitNextFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

export const loadImageFromUrl = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    image.src = url;
  });

export const calculateAverageColor = (image, sampleSize = ANALYSIS_SIZE) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = sampleSize;
  canvas.height = sampleSize;

  ctx.drawImage(image, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

  let r = 0;
  let g = 0;
  let b = 0;
  const pixelCount = sampleSize * sampleSize;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount),
  };
};

export const computeCanvasSize = ({ image, outputWidth, ratio }) => {
  const width = outputWidth;

  if (ratio === 'original') {
    const height = Math.max(1, Math.round((outputWidth * image.height) / image.width));
    return { width, height };
  }

  const [rw, rh] = ratio.split(':').map(Number);
  const height = Math.max(1, Math.round((outputWidth * rh) / rw));
  return { width, height };
};

export const getCoverSourceRect = (srcWidth, srcHeight, targetWidth, targetHeight) => {
  const srcRatio = srcWidth / srcHeight;
  const targetRatio = targetWidth / targetHeight;

  if (srcRatio > targetRatio) {
    const cropWidth = srcHeight * targetRatio;
    const sx = (srcWidth - cropWidth) / 2;
    return { sx, sy: 0, sw: cropWidth, sh: srcHeight };
  }

  const cropHeight = srcWidth / targetRatio;
  const sy = (srcHeight - cropHeight) / 2;
  return { sx: 0, sy, sw: srcWidth, sh: cropHeight };
};
