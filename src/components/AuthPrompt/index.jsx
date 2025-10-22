import styles from './styles.module.css';

export default function AuthPrompt({ 
  message = "Already have an account?",
  onLogin,
  onRegister 
}) {
  return (
    <div className={styles.authSection}>
      <p className={styles.authText}>{message}</p>
      <div className={styles.authButtons}>
        <button onClick={onLogin} className={styles.loginButton}>
          Sign In
        </button>
        <button onClick={onRegister} className={styles.registerButton}>
          Register
        </button>
      </div>
    </div>
  );
}