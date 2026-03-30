import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <h1>포토모자이크 생성기 (MVP)</h1>
    <p>대표 이미지와 여러 장의 사진으로 브라우저에서 바로 모자이크를 만들어보세요.</p>
  </header>
);

export default Header;
