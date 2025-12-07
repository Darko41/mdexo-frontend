import styles from './styles.module.css';

export default function AuthPrompt({ 
  message = "Već imate nalog?",
  onLogin,
  onRegister 
}) {
  return (
    <div className={styles.authSection}>
      <p className={styles.authText}>{message}</p>
      <div className={styles.authButtons}>
        <button onClick={onLogin} className={styles.loginButton}>
          Ulogujte se
        </button>
        <button onClick={onRegister} className={styles.registerButton}>
          Registrujte se
        </button>
      </div>
    </div>
  );
}