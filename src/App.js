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
  const [menuOpen, setMenuOpen] = useState(false); // Controle do menu mobile
  const [clientes, setClientes] = useState([]);
  const [formCli, setFormCli] = useState({ nome: '', cpf: '', tel: '', email: '' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        onSnapshot(query(collection(db, "clientes"), where("advId", "==", u.uid)), (s) => 
          setClientes(s.docs.map(d => ({...d.data(), id: d.id}))));
      }
    });
    return unsub;
  }, []);

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
      {/* BOTÃO PARA ABRIR MENU NO CELULAR */}
      <button onClick={() => setMenuOpen(!menuOpen)} style={s.menuBtn}>☰</button>

      {/* SIDEBAR COM DESIGN ORIGINAL */}
      <aside style={{
        ...s.sidebar, 
        left: menuOpen ? '0' : (window.innerWidth <= 768 ? '-100%' : '0') 
      }}>
        <div style={s.brand}>JurisPRO <span style={{fontSize:'10px', color: COLORS.accent}}>v2.0</span></div>
        <nav style={s.nav}>
          <li onClick={() => {setTab('dashboard'); setMenuOpen(false)}} style={tab === 'dashboard' ? s.active : s.li}>📊 Dashboard BI</li>
          <li onClick={() => {setTab('clientes'); setMenuOpen(false)}} style={tab === 'clientes' ? s.active : s.li}>👥 Clientes (CRM)</li>
          <li onClick={() => {setTab('processos'); setMenuOpen(false)}} style={tab === 'processos' ? s.active : s.li}>⚖️ Processos</li>
          <li onClick={() => {setTab('agenda'); setMenuOpen(false)}} style={tab === 'agenda' ? s.active : s.li}>📅 Agenda</li>
          <li onClick={() => {setTab('financeiro'); setMenuOpen(false)}} style={tab === 'financeiro' ? s.active : s.li}>💰 Financeiro</li>
          <li onClick={() => {setTab('docs'); setMenuOpen(false)}} style={tab === 'docs' ? s.active : s.li}>📄 Gerador Docs</li>
        </nav>
        <button onClick={() => signOut(auth)} style={s.btnOut}>🔒 Sair</button>
      </aside>

      {/* CONTEÚDO PRINCIPAL - AGORA RESPONSIVO */}
      <main style={s.main}>
        <h2 style={{marginBottom: '30px'}}>Bem-vinda, Dra. Marina</h2>

        {tab === 'clientes' && (
          <div style={s.card}>
            <h2 style={{marginBottom:'20px'}}>Novo Cadastro de Cliente</h2>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Nome Completo" value={formCli.nome} onChange={e => setFormCli({...formCli, nome: e.target.value})} />
              <input style={s.input} placeholder="CPF / CNPJ" value={formCli.cpf} onChange={e => setFormCli({...formCli, cpf: e.target.value})} />
              <input style={s.input} placeholder="Telefone" value={formCli.tel} onChange={e => setFormCli({...formCli, tel: e.target.value})} />
              <input style={s.input} placeholder="E-mail" value={formCli.email} onChange={e => setFormCli({...formCli, email: e.target.value})} />
            </div>
            <button style={s.btnMain}>CADASTRAR E GERAR HISTÓRICO</button>
          </div>
        )}

        {tab === 'docs' && (
          <div style={s.card}>
            <h2>Gerador Inteligente de Documentos</h2>
            <select style={s.input}>{clientes.map(c => <option key={c.id}>{c.nome}</option>)}</select>
            <div style={s.docGrid}>
              <button style={s.btnDoc}>📄 Procuração</button>
              <button style={s.btnDoc}>📄 Contrato</button>
              <button style={s.btnDoc}>📄 Declaração</button>
            </div>
          </div>
        )}
        
        {['dashboard', 'processos', 'agenda', 'financeiro'].includes(tab) && (
          <div style={{textAlign:'center', marginTop:'100px'}}><h2>Módulo {tab.toUpperCase()}</h2><p>Sincronizado</p></div>
        )}
      </main>

      {/* SOMBRA AO ABRIR MENU NO CELULAR */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={s.overlay} />}
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'Segoe UI, sans-serif' },
  menuBtn: { display: window.innerWidth <= 768 ? 'block' : 'none', position: 'fixed', top: '15px', right: '15px', zIndex: 2000, background: COLORS.accent, border: 'none', borderRadius: '5px', padding: '10px 15px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' },
  sidebar: { width: '280px', backgroundColor: COLORS.card, padding: '30px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', height: '100vh', position: window.innerWidth <= 768 ? 'fixed' : 'relative', transition: '0.3s', zIndex: 1001 },
  brand: { fontSize: '22px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '40px' },
  nav: { flex: 1, listStyle: 'none', padding: 0 },
  li: { padding: '15px', cursor: 'pointer', borderRadius: '10px', marginBottom: '8px' },
  active: { padding: '15px', cursor: 'pointer', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, fontWeight: 'bold' },
  main: { flex: 1, padding: window.innerWidth <= 768 ? '70px 20px 20px' : '40px', overflowY: 'auto' },
  card: { backgroundColor: COLORS.card, padding: '30px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  input: { width: '100%', padding: '15px', margin: '10px 0', borderRadius: '10px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' },
  formGrid: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '10px' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  docGrid: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr 1fr', gap: '15px', marginTop: '20px' },
  btnDoc: { padding: '20px', backgroundColor: '#1e293b', color: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '15px', cursor: 'pointer' },
  btnOut: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', marginTop: 'auto' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000 }
};