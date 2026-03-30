import styles from './TileGallery.module.css';

const TileGallery = ({ tiles, onAddTiles, onRemoveTile, onClearTiles, disabled }) => {
  return (
    <section className={styles.card}>
      <div className={styles.topRow}>
        <h2>2) 타일 이미지 업로드</h2>
        <button type="button" onClick={onClearTiles} disabled={disabled || !tiles.length}>
          전체 삭제
        </button>
      </div>
      <p>모자이크에 사용할 사진을 여러 장 추가하세요.</p>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png"
        onChange={onAddTiles}
        disabled={disabled}
      />
      <div className={styles.grid}>
        {tiles.map((tile) => (
          <article key={tile.id} className={styles.item}>
            <img src={tile.previewUrl} alt={tile.file.name} />
            <button type="button" onClick={() => onRemoveTile(tile.id)} disabled={disabled}>
              삭제
            </button>
          </article>
        ))}
      </div>
      {!tiles.length && <div className={styles.empty}>업로드된 타일 이미지가 없습니다.</div>}
    </section>
  );
};

export default TileGallery;
