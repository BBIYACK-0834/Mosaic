import styles from './ImageUploader.module.css';

const ImageUploader = ({ previewUrl, onChange, disabled }) => {
  return (
    <section className={styles.card}>
      <h2>1) 대표 이미지 업로드</h2>
      <p>대표 이미지 1장을 업로드하세요 (jpg, jpeg, png)</p>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={onChange}
        disabled={disabled}
      />
      {previewUrl ? (
        <div className={styles.previewWrap}>
          <img src={previewUrl} alt="대표 이미지 미리보기" className={styles.previewImage} />
        </div>
      ) : (
        <div className={styles.emptyBox}>아직 대표 이미지가 없습니다.</div>
      )}
    </section>
  );
};

export default ImageUploader;
