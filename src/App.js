import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

// CONFIGURAÇÃO REAL DO SEU PROJETO (ATUALIZADO)
const firebaseConfig = {
  apiKey: "AIzaSyCnZIJ_LHfGJMivq3TuTcY2KRj4HErkZSs",
  authDomain: "cadastro-formulario-a2a77.firebaseapp.com",
  projectId: "cadastro-formulario-a2a77",
  storageBucket: "cadastro-formulario-a2a77.firebasestorage.app",
  messagingSenderId: "1030725916369",
  appId: "1:1030725916369:web:d3060e84b0d10417c9d7f0",
  measurementId: "G-088BMYC75Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const COLORS = { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc', border: '#1e293b', danger: '#ef4444' };

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processos, setProcessos] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const q = query(collection(db, "processos"), where("userId", "==", currentUser.uid));
        onSnapshot(q, (snap) => {
          setProcessos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
      }
    });
    return unsub;
  }, []);

  const handleAuth = async (mode) => {
    if (!email || !password) return alert("Preencha todos os campos");
    try {
      if (mode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { alert("Erro: " + e.message); }
  };

  const addProcesso = async () => {
    const nome = prompt("Nome do Cliente:");
    if (!nome) return;
    await addDoc(collection(db, "processos"), {
      cliente: nome,
      userId: user.uid,
      data: new Date().toISOString()
    });
  };

  if (loading) return <div style={s.center}>Iniciando Sistema JurisPRO...</div>;

  if (!user) {
    return (
      <div style={s.loginPage}>
        <div style={s.loginCard}>
          <div style={s.logo}>J</div>
          <h2 style={{color: COLORS.accent}}>JurisPRO Elite</h2>
          <input style={s.input} placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
          <input style={s.input} type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
          <button style={s.btnMain} onClick={() => handleAuth('login')}>ENTRAR NO ESCRITÓRIO</button>
          <button style={s.btnSec} onClick={() => handleAuth('signup')}>Criar Conta Profissional</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <h2 style={{color: COLORS.accent}}>JurisPRO</h2>
        <div style={{flex: 1, marginTop: '30px'}}>
          <div style={s.navItem}>📊 Dashboard Cloud</div>
        </div>
        <div style={s.footerSide}>
          <div style={{fontSize: '11px', color: '#94a3b8'}}>{user.email}</div>
          <button onClick={() => signOut(auth)} style={s.btnOut}>Sair com Segurança</button>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.header}>
          <h1>Gestão de Processos Real</h1>
          <button style={s.btnMain} onClick={addProcesso}>+ NOVO CASO</button>
        </div>
        
        <div style={s.grid}>
          {processos.map(p => (
            <div key={p.id} style={s.card}>
              <div style={{fontSize: '11px', color: COLORS.accent}}>PROCESSO ATIVO</div>
              <h3 style={{margin: '10px 0'}}>{p.cliente}</h3>
              <div style={{fontSize: '12px', color: '#22c55e'}}>✓ Sincronizado na Nuvem</div>
            </div>
          ))}
          {processos.length === 0 && <p style={{color: '#94a3b8'}}>Nenhum processo no banco de dados.</p>}
        </div>
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'Inter, sans-serif' },
  loginPage: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loginCard: { backgroundColor: COLORS.card, padding: '40px', borderRadius: '24px', width: '350px', textAlign: 'center', border: `1px solid ${COLORS.border}` },
  logo: { width: '60px', height: '60px', backgroundColor: COLORS.accent, borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold', color: '#000' },
  input: { width: '100%', padding: '14px', marginBottom: '10px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' },
  btnMain: { padding: '14px 25px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnSec: { background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer' },
  sidebar: { width: '260px', backgroundColor: COLORS.card, padding: '30px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column' },
  main: { flex: 1, padding: '50px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: COLORS.card, padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  navItem: { padding: '15px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, borderRadius: '12px', fontWeight: 'bold' },
  footerSide: { borderTop: `1px solid ${COLORS.border}`, paddingTop: '20px' },
  btnOut: { background: 'none', border: 'none', color: COLORS.danger, cursor: 'pointer', padding: 0, marginTop: '5px', fontWeight: 'bold' },
  center: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, color: COLORS.accent }
};