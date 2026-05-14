import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

// SUAS CHAVES REAIS
const firebaseConfig = {
  apiKey: "AIzaSyCnZIJ_LHfGJMivq3TuTcY2KRj4HErkZSs",
  authDomain: "cadastro-formulario-a2a77.firebaseapp.com",
  projectId: "cadastro-formulario-a2a77",
  storageBucket: "cadastro-formulario-a2a77.firebasestorage.app",
  messagingSenderId: "1030725916369",
  appId: "1:1030725916369:web:d3060e84b0d10417c9d7f0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const COLORS = { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc', border: '#1e293b', glass: 'rgba(15, 23, 42, 0.8)' };

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processos, setProcessos] = useState([]);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        const q = query(collection(db, "processos"), where("userId", "==", u.uid));
        onSnapshot(q, (s) => setProcessos(s.docs.map(d => ({ ...d.data(), id: d.id }))));
      }
    });
    return unsub;
  }, []);

  const handleAuth = async (m) => {
    try {
      if (m === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { alert(e.message); }
  };

  const addProcesso = async () => {
    const n = prompt("Nome do Cliente:");
    if (n) await addDoc(collection(db, "processos"), { cliente: n, userId: user.uid, status: 'Ativo', data: new Date().toLocaleDateString() });
  };

  if (loading) return <div style={s.center}>Carregando JurisPRO Elite...</div>;

  if (!user) return (
    <div style={s.loginPage}>
      <div style={s.loginCard}>
        <div style={s.logoIcon}>J</div>
        <h1 style={{fontSize: '24px', marginBottom: '10px'}}>JurisPRO <span style={{color: COLORS.accent}}>Elite</span></h1>
        <p style={{color: '#94a3b8', marginBottom: '30px'}}>Acesse sua banca digital</p>
        <input style={s.input} placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
        <input style={s.input} type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
        <button style={s.btnMain} onClick={() => handleAuth('login')}>ENTRAR</button>
        <button style={s.btnSec} onClick={() => handleAuth('signup')}>Criar Conta Profissional</button>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      {/* SIDEBAR BONITA */}
      <aside style={s.sidebar}>
        <div style={s.brand}>JurisPRO</div>
        <nav style={s.nav}>
          <div onClick={() => setTab('dashboard')} style={tab === 'dashboard' ? s.navItemActive : s.navItem}>📊 Dashboard</div>
          <div onClick={() => setTab('processos')} style={tab === 'processos' ? s.navItemActive : s.navItem}>📁 Processos</div>
          <div onClick={() => setTab('ia')} style={tab === 'ia' ? s.navItemActive : s.navItem}>✨ Redator IA</div>
          <div onClick={() => setTab('ged')} style={tab === 'ged' ? s.navItemActive : s.navItem}>☁️ GED Cloud</div>
        </nav>
        <div style={s.userBox}>
          <p style={{fontSize: '11px', color: '#94a3b8'}}>{user.email}</p>
          <button onClick={() => signOut(auth)} style={s.btnOut}>Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL RECHEADO */}
      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h2 style={{margin: 0}}>Bem-vinda, Dra. Marina</h2>
            <p style={{color: '#94a3b8', fontSize: '14px'}}>Sua banca está 100% sincronizada.</p>
          </div>
          <button style={s.btnMain} onClick={addProcesso}>+ NOVO PROCESSO</button>
        </header>

        {tab === 'dashboard' && (
          <div style={s.content}>
            {/* GRÁFICOS E CARDS QUE VOCÊ GOSTAVA */}
            <div style={s.statsRow}>
              <div style={s.statCard}><h3>{processos.length}</h3><p>Casos Ativos</p></div>
              <div style={s.statCard}><h3>98%</h3><p>Eficiência</p></div>
              <div style={s.statCard}><h3>12</h3><p>Prazos/Semana</p></div>
            </div>
            
            <div style={s.chartBox}>
              <h3>Performance Mensal</h3>
              <div style={s.bars}>
                {[60, 80, 45, 90, 70, 100].map((h, i) => (
                  <div key={i} style={{...s.bar, height: `${h}%`}}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'processos' && (
          <div style={s.grid}>
            {processos.map(p => (
              <div key={p.id} style={s.procCard}>
                <div style={s.tag}>PROCESSO JUDICIAL</div>
                <h3 style={{margin: '15px 0'}}>{p.cliente}</h3>
                <div style={{fontSize: '12px', display: 'flex', justifyContent: 'space-between'}}>
                  <span>📅 {p.data}</span>
                  <span style={{color: '#22c55e'}}>● Ativo</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'ia' && (
          <div style={s.cardFull}>
            <h3>✨ Redator Jurídico IA</h3>
            <textarea style={s.textarea} placeholder="Descreva o caso para a IA redigir a petição..."></textarea>
            <button style={s.btnMain}>GERAR PETIÇÃO PROFISSIONAL</button>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'Inter, sans-serif' },
  loginPage: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle, #0f172a 0%, #000 100%)' },
  loginCard: { backgroundColor: COLORS.card, padding: '50px', borderRadius: '30px', textAlign: 'center', width: '380px', border: `1px solid ${COLORS.border}` },
  logoIcon: { width: '60px', height: '60px', backgroundColor: COLORS.accent, borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold', color: '#000' },
  input: { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff', outline: 'none' },
  btnMain: { padding: '15px 30px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  btnSec: { background: 'none', border: 'none', color: '#94a3b8', marginTop: '20px', cursor: 'pointer' },
  sidebar: { width: '280px', backgroundColor: COLORS.card, padding: '40px 20px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column' },
  brand: { fontSize: '24px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '40px', paddingLeft: '20px' },
  nav: { flex: 1 },
  navItem: { padding: '15px 20px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', transition: '0.2s' },
  navItemActive: { padding: '15px 20px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, fontWeight: 'bold' },
  main: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '30px' },
  statCard: { flex: 1, backgroundColor: COLORS.card, padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, textAlign: 'center' },
  chartBox: { backgroundColor: COLORS.card, padding: '30px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, height: '300px' },
  bars: { display: 'flex', alignItems: 'flex-end', gap: '15px', height: '200px', marginTop: '20px' },
  bar: { flex: 1, backgroundColor: COLORS.accent, borderRadius: '8px 8px 0 0', opacity: 0.8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  procCard: { backgroundColor: COLORS.card, padding: '25px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  tag: { fontSize: '10px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, padding: '5px 10px', borderRadius: '5px', width: 'fit-content' },
  userBox: { borderTop: `1px solid ${COLORS.border}`, paddingTop: '20px' },
  btnOut: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  cardFull: { backgroundColor: COLORS.card, padding: '30px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  textarea: { width: '100%', height: '200px', backgroundColor: '#000', color: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '15px', marginBottom: '20px', resize: 'none' },
  center: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, color: COLORS.accent, fontSize: '20px' }
};