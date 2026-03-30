export const downloadCanvasAsPng = (canvas, filename = 'photo-mosaic.png') => {
  if (!canvas) return;

  const url = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
};
