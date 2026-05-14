import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";

// CONFIGURAÇÃO DO SEU FIREBASE
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

const COLORS = { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc', border: '#1e293b' };

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processos, setProcessos] = useState([]);
  const [tab, setTab] = useState('dashboard');
  
  // Estados da Calculadora
  const [valorCausa, setValorCausa] = useState('');
  const [porcentagem, setPorcentagem] = useState(20);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const q = query(collection(db, "processos"), where("userId", "==", u.uid));
        onSnapshot(q, (s) => setProcessos(s.docs.map(d => ({ ...d.data(), id: d.id }))));
      }
    });
    return unsub;
  }, []);

  const handleAuth = async (type) => {
    try {
      if (type === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { alert("Erro: " + e.message); }
  };

  // FUNÇÃO DE CADASTRO CORRIGIDA
  const salvarProcesso = async () => {
    const nome = prompt("Digite o nome do cliente para o novo processo:");
    if (!nome) return;
    
    try {
      await addDoc(collection(db, "processos"), {
        cliente: nome,
        userId: user.uid,
        status: 'Ativo',
        createdAt: serverTimestamp()
      });
      alert("✅ Processo de " + nome + " cadastrado com sucesso!");
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
  };

  if (!user) return (
    <div style={s.loginPage}>
      <div style={s.loginCard}>
        <div style={s.logoIcon}>J</div>
        <h2>JurisPRO <span style={{color: COLORS.accent}}>Elite</span></h2>
        <input style={s.input} placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
        <input style={s.input} type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
        <button style={s.btnMain} onClick={() => handleAuth('login')}>ENTRAR</button>
        <button style={s.btnSec} onClick={() => handleAuth('signup')}>Criar Conta Profissional</button>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <div style={s.brand}>JurisPRO</div>
        <nav style={s.nav}>
          <div onClick={() => setTab('dashboard')} style={tab === 'dashboard' ? s.navItemActive : s.navItem}>📊 Dashboard</div>
          <div onClick={() => setTab('processos')} style={tab === 'processos' ? s.navItemActive : s.navItem}>📁 Processos</div>
          <div onClick={() => setTab('calc')} style={tab === 'calc' ? s.navItemActive : s.navItem}>🧮 Calculadora Juiz</div>
          <div onClick={() => setTab('ia')} style={tab === 'ia' ? s.navItemActive : s.navItem}>✨ Redator IA</div>
        </nav>
        <button onClick={() => signOut(auth)} style={s.btnOut}>Sair com Segurança</button>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <h1>Bem-vinda, Dra. Marina</h1>
          <button style={s.btnMain} onClick={salvarProcesso}>+ NOVO PROCESSO</button>
        </header>

        {tab === 'dashboard' && (
          <div style={s.statsRow}>
            <div style={s.statCard}><h3>{processos.length}</h3><p>Processos Ativos</p></div>
            <div style={s.statCard}><h3>R$ {(valorCausa * (porcentagem/100)).toFixed(2)}</h3><p>Honorários Estimados</p></div>
          </div>
        )}

        {tab === 'processos' && (
          <div style={s.grid}>
            {processos.map(p => (
              <div key={p.id} style={s.procCard}>
                <div style={s.tag}>JUDICIAL</div>
                <h3>{p.cliente}</h3>
                <p style={{color: '#22c55e'}}>● Sincronizado na Nuvem</p>
              </div>
            ))}
          </div>
        )}

        {/* NOVA CALCULADORA JURÍDICA */}
        {tab === 'calc' && (
          <div style={s.cardFull}>
            <h2>🧮 Calculadora de Honorários e Prazos</h2>
            <div style={{marginTop: '20px'}}>
              <label>Valor da Causa (R$):</label>
              <input style={s.input} type="number" value={valorCausa} onChange={e => setValorCausa(e.target.value)} />
              
              <label>Porcentagem de Honorários (%):</label>
              <input style={s.input} type="number" value={porcentagem} onChange={e => setPorcentagem(e.target.value)} />
              
              <div style={s.resBox}>
                <p>Seus Honorários: <strong style={{color: COLORS.accent}}>R$ {(valorCausa * (porcentagem/100)).toFixed(2)}</strong></p>
                <p>Líquido para o Cliente: <strong>R$ {(valorCausa * (1 - porcentagem/100)).toFixed(2)}</strong></p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'sans-serif' },
  loginPage: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' },
  loginCard: { backgroundColor: COLORS.card, padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${COLORS.border}` },
  logoIcon: { width: '50px', height: '50px', backgroundColor: COLORS.accent, borderRadius: '10px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff' },
  btnMain: { padding: '12px 25px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnSec: { background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer' },
  sidebar: { width: '260px', backgroundColor: COLORS.card, padding: '30px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column' },
  brand: { fontSize: '22px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '30px' },
  nav: { flex: 1 },
  navItem: { padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px' },
  navItemActive: { padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent },
  main: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  procCard: { backgroundColor: COLORS.card, padding: '20px', borderRadius: '15px', border: `1px solid ${COLORS.border}` },
  tag: { fontSize: '10px', color: COLORS.accent, marginBottom: '10px' },
  btnOut: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  cardFull: { backgroundColor: COLORS.card, padding: '30px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  resBox: { marginTop: '20px', padding: '20px', backgroundColor: '#000', borderRadius: '10px' },
  statsRow: { display: 'flex', gap: '20px' },
  statCard: { flex: 1, backgroundColor: COLORS.card, padding: '20px', borderRadius: '15px', border: `1px solid ${COLORS.border}`, textAlign: 'center' }
};