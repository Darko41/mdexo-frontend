import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DebugAuth = () => {
  const { user, token, isAuthenticated, loading } = useContext(AuthContext);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#333', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 8px 0' }}>🔍 Auth Debug</h4>
      <p>Loading: {loading ? 'YES' : 'NO'}</p>
      <p>Authenticated: {isAuthenticated ? '✅ YES' : '❌ NO'}</p>
      <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
      <p>User: {user ? user.email : 'None'}</p>
      <p>LocalStorage: {localStorage.getItem('jwtToken') ? '✅ Token' : '❌ No Token'}</p>
      <button 
        onClick={() => {
          console.log('Current auth state:', { user, token, isAuthenticated });
          console.log('LocalStorage token:', localStorage.getItem('jwtToken'));
        }}
        style={{ background: '#666', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', marginTop: '5px' }}
      >
        Log State
      </button>
    </div>
  );
};

export default DebugAuth;