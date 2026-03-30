import styles from './SettingsPanel.module.css';

const SettingsPanel = ({ settings, onChange, disabled }) => {
  return (
    <section className={styles.card}>
      <h2>3) 설정</h2>
      <p>타일 크기가 작을수록 결과가 더 정교하지만 시간이 더 걸립니다.</p>

      <div className={styles.grid}>
        <label>
          타일 크기
          <select
            value={settings.tileSize}
            onChange={(e) => onChange('tileSize', Number(e.target.value))}
            disabled={disabled}
          >
            {[8, 12, 16, 20, 24, 32].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </label>

        <label>
          출력 가로 크기
          <select
            value={settings.outputWidth}
            onChange={(e) => onChange('outputWidth', Number(e.target.value))}
            disabled={disabled}
          >
            {[800, 1200, 1600].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </label>

        <label>
          출력 비율
          <select
            value={settings.outputRatio}
            onChange={(e) => onChange('outputRatio', e.target.value)}
            disabled={disabled}
          >
            <option value="original">원본 비율 유지</option>
            <option value="1:1">1:1</option>
            <option value="4:5">4:5</option>
            <option value="16:9">16:9</option>
          </select>
        </label>

        <label>
          미리보기 품질
          <select
            value={settings.previewQuality}
            onChange={(e) => onChange('previewQuality', e.target.value)}
            disabled={disabled}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>

        <label>
          색상 매칭 방식
          <select
            value={settings.matchingMode}
            onChange={(e) => onChange('matchingMode', e.target.value)}
            disabled={disabled}
          >
            <option value="rgb-average">RGB 평균값 거리</option>
          </select>
        </label>

        <label className={styles.toggleRow}>
          반복 사용 허용
          <input
            type="checkbox"
            checked={settings.allowRepeat}
            onChange={(e) => onChange('allowRepeat', e.target.checked)}
            disabled={disabled}
          />
        </label>
      </div>
    </section>
  );
};

export default SettingsPanel;
