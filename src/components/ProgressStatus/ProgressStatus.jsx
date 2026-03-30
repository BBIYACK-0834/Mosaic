import styles from './ProgressStatus.module.css';

const ProgressStatus = ({ status, progressPercent, errorMessage, warningMessage }) => {
  return (
    <section className={styles.card}>
      <h3>진행 상태</h3>
      <p>{status.message}</p>
      {!!status.total && (
        <>
          <progress max={status.total} value={status.processed} className={styles.progress} />
          <small>{progressPercent}%</small>
        </>
      )}
      {warningMessage && <p className={styles.warning}>⚠️ {warningMessage}</p>}
      {errorMessage && <p className={styles.error}>❌ {errorMessage}</p>}
    </section>
  );
};

export default ProgressStatus;
