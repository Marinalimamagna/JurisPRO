import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

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
  const [tab, setTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [formCli, setFormCli] = useState({ nome: '', cpf: '', tel: '', email: '' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const q = query(collection(db, "clientes"), where("advId", "==", u.uid));
        onSnapshot(q, (s) => setClientes(s.docs.map(d => ({...d.data(), id: d.id}))));
      }
    });
    return unsub;
  }, []);

  const salvarCliente = async () => {
    if(!formCli.nome) return alert("Digite ao menos o nome!");
    try {
      await addDoc(collection(db, "clientes"), {
        ...formCli,
        advId: user.uid,
        dataCriacao: new Date().toISOString()
      });
      alert("✅ Cliente cadastrado com sucesso!");
      setFormCli({ nome: '', cpf: '', tel: '', email: '' });
    } catch (e) { alert("Erro ao salvar: " + e.message); }
  };

  if (!user) return (
    <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#000', padding:'20px'}}>
      <div style={{padding:'40px', background:COLORS.card, borderRadius:'20px', textAlign:'center', width:'100%', maxWidth:'350px', border:`1px solid ${COLORS.border}`}}>
        <h2 style={{color: COLORS.accent, marginBottom:'20px'}}>JurisPRO Elite</h2>
        <input style={s.input} placeholder="E-mail" id="em" />
        <input style={s.input} type="password" placeholder="Senha" id="ps" />
        <button style={s.btnMain} onClick={() => signInWithEmailAndPassword(auth, document.getElementById('em').value, document.getElementById('ps').value)}>ENTRAR</button>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <button onClick={() => setMenuOpen(!menuOpen)} style={s.menuBtn}>☰</button>

      <aside style={{ ...s.sidebar, left: menuOpen ? '0' : (window.innerWidth <= 768 ? '-100%' : '0') }}>
        <div style={s.brand}>JurisPRO <span style={{fontSize:'10px', color: COLORS.accent}}>v2.0</span></div>
        <nav style={s.nav}>
          <li onClick={() => {setTab('dashboard'); setMenuOpen(false)}} style={tab === 'dashboard' ? s.active : s.li}>📊 Dashboard</li>
          <li onClick={() => {setTab('clientes'); setMenuOpen(false)}} style={tab === 'clientes' ? s.active : s.li}>👥 Clientes (CRM)</li>
          <li onClick={() => {setTab('processos'); setMenuOpen(false)}} style={tab === 'processos' ? s.active : s.li}>⚖️ Processos & Tribunais</li>
          <li onClick={() => {setTab('agenda'); setMenuOpen(false)}} style={tab === 'agenda' ? s.active : s.li}>📅 Agenda & Prazos</li>
          <li onClick={() => {setTab('financeiro'); setMenuOpen(false)}} style={tab === 'financeiro' ? s.active : s.li}>💰 Financeiro</li>
        </nav>
        <button onClick={() => signOut(auth)} style={s.btnOut}>🔒 Sair</button>
      </aside>

      <main style={s.main}>
        {tab === 'dashboard' && (
          <div style={s.card}>
            <h2 style={{marginBottom:'10px'}}>Dashboard</h2>
            <p style={{color: '#94a3b8'}}>Bem-vinda de volta, Dra. Marina!</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginTop:'30px'}}>
              <div style={s.statBox}><h3>{clientes.length}</h3><p>Clientes Ativos</p></div>
              <div style={s.statBox}><h3>0</h3><p>Processos Hoje</p></div>
              <div style={s.statBox}><h3>R$ 0,00</h3><p>Honorários</p></div>
            </div>
          </div>
        )}

        {tab === 'clientes' && (
          <div style={s.card}>
            <h2 style={{marginBottom:'20px'}}>Novo Cadastro</h2>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Nome Completo" value={formCli.nome} onChange={e => setFormCli({...formCli, nome: e.target.value})} />
              <input style={s.input} placeholder="CPF / CNPJ" value={formCli.cpf} onChange={e => setFormCli({...formCli, cpf: e.target.value})} />
              <input style={s.input} placeholder="Telefone" value={formCli.tel} onChange={e => setFormCli({...formCli, tel: e.target.value})} />
              <input style={s.input} placeholder="E-mail" value={formCli.email} onChange={e => setFormCli({...formCli, email: e.target.value})} />
            </div>
            <button style={s.btnMain} onClick={salvarCliente}>SALVAR CLIENTE</button>
            
            <div style={{marginTop:'30px'}}>
              <h3 style={{marginBottom:'15px'}}>Meus Clientes</h3>
              {clientes.map(c => (
                <div key={c.id} style={s.clientItem}>
                  <div><strong>{c.nome}</strong><br/><small style={{color:'#94a3b8'}}>{c.tel} | {c.email}</small></div>
                  <div style={{color: COLORS.accent}}>➔</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === 'processos' || tab === 'agenda' || tab === 'financeiro') && (
          <div style={s.card}>
            <h2>{tab === 'processos' ? '⚖️ Processos' : tab === 'agenda' ? '📅 Agenda' : '💰 Financeiro'}</h2>
            <p style={{marginTop:'20px', color: '#94a3b8'}}>Esta tela está pronta para receber os dados dos seus {tab}.</p>
            <div style={{padding:'40px', textAlign:'center', border:`1px dashed ${COLORS.border}`, borderRadius:'10px', marginTop:'20px'}}>
              Lista de {tab} vazia.
            </div>
          </div>
        )}
      </main>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={s.overlay} />}
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'sans-serif' },
  menuBtn: { display: window.innerWidth <= 768 ? 'block' : 'none', position: 'fixed', top: '15px', left: '15px', zIndex: 2000, background: COLORS.accent, border: 'none', borderRadius: '5px', padding: '10px 12px', fontSize: '20px', cursor:'pointer' },
  sidebar: { width: '260px', backgroundColor: '#0f172a', padding: '25px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', height: '100vh', position: window.innerWidth <= 768 ? 'fixed' : 'relative', transition: '0.3s', zIndex: 1001 },
  brand: { fontSize: '22px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '40px' },
  nav: { flex: 1, listStyle: 'none', padding: 0 },
  li: { padding: '15px 12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '8px', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  active: { padding: '15px 12px', cursor: 'pointer', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center' },
  main: { flex: 1, padding: window.innerWidth <= 768 ? '80px 20px' : '60px', overflowY: 'auto' },
  card: { backgroundColor: '#0f172a', padding: '30px', borderRadius: '15px', border: `1px solid ${COLORS.border}`, maxWidth: '900px' },
  input: { width: '100%', padding: '14px', margin: '8px 0', borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff', fontSize: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '15px' },
  btnMain: { width: '100%', padding: '16px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  clientItem: { padding: '15px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statBox: { padding: '20px', background: '#000', borderRadius: '12px', border: `1px solid ${COLORS.border}`, textAlign: 'center' },
  btnOut: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 'auto' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 1000 }
};