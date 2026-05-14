import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

// --- PARE TUDO: COLE SUAS CHAVES DO FIREBASE AQUI ---
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const COLORS = { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc', border: '#1e293b' };

export default function JurisPRO() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Monitora login e carrega dados exclusivos do usuário logado
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const q = query(collection(db, "processos"), where("userId", "==", currentUser.uid));
        const unsubData = onSnapshot(q, (snap) => {
          setProcessos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
        return () => unsubData();
      }
    });
    return () => unsubAuth();
  }, []);

  const handleAuth = async (type) => {
    try {
      if (type === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { alert("Erro: " + e.message); }
  };

  const novoProcesso = async () => {
    const nome = prompt("Nome do Cliente:");
    if (!nome) return;
    await addDoc(collection(db, "processos"), {
      cliente: nome,
      userId: user.uid, // O dado fica amarrado ao ID do advogado
      data: new Date().toISOString()
    });
  };

  if (loading) return <div style={s.center}>Iniciando JurisPRO Cloud...</div>;

  if (!user) {
    return (
      <div style={s.loginPage}>
        <div style={s.loginCard}>
          <div style={s.icon}>J</div>
          <h2 style={{color: COLORS.accent}}>JurisPRO Elite</h2>
          <input style={s.input} placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
          <input style={s.input} type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
          <button style={s.btn} onClick={() => handleAuth('login')}>ENTRAR</button>
          <button style={s.btnSec} onClick={() => handleAuth('signup')}>CRIAR CONTA PROFISSIONAL</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <h2 style={{color: COLORS.accent}}>JurisPRO</h2>
        <div style={{flex: 1, marginTop: '20px'}}>
          <div style={s.navActive}>📊 Dashboard Cloud</div>
        </div>
        <div style={s.userInfo}>
          <div style={{fontSize: '11px', color: '#94a3b8'}}>{user.email}</div>
          <button onClick={() => signOut(auth)} style={s.btnLogout}>Sair</button>
        </div>
      </aside>
      <main style={s.main}>
        <header style={s.header}>
          <h1>Meus Processos Cloud</h1>
          <button style={s.btn} onClick={novoProcesso}>+ NOVO PROCESSO</button>
        </header>
        <div style={s.grid}>
          {processos.map(p => (
            <div key={p.id} style={s.card}>
              <strong>{p.cliente}</strong>
              <div style={{fontSize: '12px', color: '#22c55e', marginTop: '10px'}}>✓ SINCRONIZADO</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'Inter' },
  loginPage: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loginCard: { backgroundColor: COLORS.card, padding: '40px', borderRadius: '24px', textAlign: 'center', width: '340px', border: `1px solid ${COLORS.border}` },
  icon: { width: '50px', height: '50px', backgroundColor: COLORS.accent, borderRadius: '12px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #1e293b', backgroundColor: '#000', color: '#fff' },
  btn: { padding: '12px 24px', backgroundColor: COLORS.accent, border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  btnSec: { background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer' },
  sidebar: { width: '260px', borderRight: `1px solid ${COLORS.border}`, padding: '30px', display: 'flex', flexDirection: 'column' },
  main: { flex: 1, padding: '50px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  card: { backgroundColor: COLORS.card, padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  navActive: { color: COLORS.accent, backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '15px', borderRadius: '10px' },
  btnLogout: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, marginTop: '5px' },
  userInfo: { borderTop: `1px solid ${COLORS.border}`, paddingTop: '20px' },
  center: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, color: COLORS.accent }
};