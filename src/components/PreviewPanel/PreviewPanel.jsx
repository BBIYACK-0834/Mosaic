import styles from './PreviewPanel.module.css';

const PreviewPanel = ({ mainPreviewUrl, previewCanvasRef, outputCanvasRef, resultInfo, onDownload }) => {
  return (
    <section className={styles.card}>
      <h2>결과 미리보기</h2>
      <p>생성 전에 대표 이미지와 타일 사진을 모두 업로드해야 합니다.</p>

      <div className={styles.row}>
        <article>
          <h3>원본 대표 이미지</h3>
          {mainPreviewUrl ? <img src={mainPreviewUrl} alt="원본 대표" /> : <div className={styles.empty}>없음</div>}
        </article>
        <article>
          <h3>모자이크 결과 (미리보기)</h3>
          <canvas ref={previewCanvasRef} className={styles.previewCanvas} />
        </article>
      </div>

      {resultInfo && (
        <div className={styles.infoBox}>
          <p>대표 이미지 크기: {resultInfo.sourceWidth} x {resultInfo.sourceHeight}</p>
          <p>타일 이미지 수: {resultInfo.tileCount}</p>
          <p>생성된 셀 개수: {resultInfo.cellCount}</p>
          <p>
            출력 크기: {resultInfo.outputWidth} x {resultInfo.outputHeight}
          </p>
          <p>타일 크기: {resultInfo.tileSize}px</p>
        </div>
      )}

      <button type="button" onClick={onDownload} disabled={!resultInfo} className={styles.downloadBtn}>
        PNG 다운로드
      </button>

      <canvas ref={outputCanvasRef} className={styles.hiddenCanvas} />
    </section>
  );
};

export default PreviewPanel;
