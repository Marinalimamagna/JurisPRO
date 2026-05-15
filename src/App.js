import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
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

const langData = {
  pt: { dash: "Dashboard BI", clients: "Clientes (CRM)", procs: "Processos & Tribunais", agenda: "Agenda & Prazos", fin: "Financeiro", docs: "Gerador de Docs", welcome: "Bem-vinda, Dra. Marina", save: "CADASTRAR E GERAR HISTÓRICO", logout: "Sair (LGPD Safe)" },
  en: { dash: "BI Dashboard", clients: "Clients (CRM)", procs: "Lawsuits & Courts", agenda: "Schedule & Deadlines", fin: "Financial", docs: "Doc Generator", welcome: "Welcome, Dr. Marina", save: "REGISTER & GENERATE HISTORY", logout: "Logout (Safe)" },
  es: { dash: "Panel de BI", clients: "Clientes (CRM)", procs: "Procesos y Tribunales", agenda: "Agenda y Plazos", fin: "Financiero", docs: "Generador de Docs", welcome: "Bienvenida, Dra. Marina", save: "REGISTRAR Y GENERAR HISTORIAL", logout: "Salir (Seguro)" }
};

const COLORS = { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc', border: '#1e293b', success: '#22c55e' };

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [lang, setLang] = useState('pt');
  const [menuOpen, setMenuOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [formCli, setFormCli] = useState({ nome: '', cpf: '', tel: '', email: '' });
  const t = langData[lang];

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

  const salvarCliente = async () => {
    if(!formCli.nome) return alert("Nome é obrigatório");
    await addDoc(collection(db, "clientes"), { ...formCli, advId: user.uid, data: new Date().toLocaleDateString() });
    setFormCli({ nome: '', cpf: '', tel: '', email: '' });
    alert("Sucesso!");
  };

  if (!user) return (
    <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#000'}}>
      <div style={{padding:'40px', background:COLORS.card, borderRadius:'20px', textAlign:'center', width:'100%', maxWidth:'350px', border:`1px solid ${COLORS.border}`}}>
        <h2 style={{color: COLORS.accent}}>JurisPRO Elite</h2>
        <input style={s.input} placeholder="E-mail" id="email" />
        <input style={s.input} type="password" placeholder="Senha" id="pass" />
        <button style={s.btnMain} onClick={() => signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('pass').value)}>ENTRAR</button>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <div style={s.mobileBar}>
        <div style={{color: COLORS.accent, fontWeight:'bold'}}>JurisPRO</div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={s.hamburger}>☰</button>
      </div>

      <aside style={{...s.sidebar, left: menuOpen ? '0' : (window.innerWidth <= 768 ? '-100%' : '0')}}>
        <div style={s.brand}>JurisPRO <span style={{fontSize:'10px', color: COLORS.accent}}>v2.0</span></div>
        <select onChange={(e) => setLang(e.target.value)} style={s.langSelect}>
          <option value="pt">🇧🇷 PT</option>
          <option value="en">🇺🇸 EN</option>
          <option value="es">🇪🇸 ES</option>
        </select>
        <nav style={s.nav}>
          <li onClick={() => {setTab('dashboard'); setMenuOpen(false)}} style={tab === 'dashboard' ? s.active : s.li}>📊 {t.dash}</li>
          <li onClick={() => {setTab('clientes'); setMenuOpen(false)}} style={tab === 'clientes' ? s.active : s.li}>👥 {t.clients}</li>
          <li onClick={() => {setTab('processos'); setMenuOpen(false)}} style={tab === 'processos' ? s.active : s.li}>⚖️ {t.procs}</li>
          <li onClick={() => {setTab('agenda'); setMenuOpen(false)}} style={tab === 'agenda' ? s.active : s.li}>📅 {t.agenda}</li>
          <li onClick={() => {setTab('financeiro'); setMenuOpen(false)}} style={tab === 'financeiro' ? s.active : s.li}>💰 {t.fin}</li>
          <li onClick={() => {setTab('docs'); setMenuOpen(false)}} style={tab === 'docs' ? s.active : s.li}>📄 {t.docs}</li>
        </nav>
        <button onClick={() => signOut(auth)} style={s.btnOut}>🔒 {t.logout}</button>
      </aside>

      <main style={s.main}>
        <h2 style={{marginBottom: '20px'}}>{t.welcome}</h2>

        {tab === 'clientes' && (
          <div style={s.card}>
            <h2>Novo Cadastro</h2>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Nome" value={formCli.nome} onChange={e => setFormCli({...formCli, nome: e.target.value})} />
              <input style={s.input} placeholder="CPF / CNPJ" value={formCli.cpf} onChange={e => setFormCli({...formCli, cpf: e.target.value})} />
              <input style={s.input} placeholder="Telefone" value={formCli.tel} onChange={e => setFormCli({...formCli, tel: e.target.value})} />
              <input style={s.input} placeholder="E-mail" value={formCli.email} onChange={e => setFormCli({...formCli, email: e.target.value})} />
            </div>
            <button style={s.btnMain} onClick={salvarCliente}>{t.save}</button>
          </div>
        )}

        {tab === 'docs' && (
          <div style={s.card}>
            <h2>{t.docs}</h2>
            <select style={s.input}>{clientes.map(c => <option key={c.id}>{c.nome}</option>)}</select>
            <div style={s.docGrid}>
              <button style={s.btnDoc}>📄 Procuração</button>
              <button style={s.btnDoc}>📄 Contrato</button>
              <button style={s.btnDoc}>📄 Declaração</button>
            </div>
          </div>
        )}

        {['dashboard', 'processos', 'agenda', 'financeiro'].includes(tab) && (
          <div style={s.center}><h2>Módulo {tab.toUpperCase()}</h2><p>Sincronizado</p></div>
        )}
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'Segoe UI, sans-serif' },
  mobileBar: { display: window.innerWidth <= 768 ? 'flex' : 'none', justifyContent: 'space-between', padding: '15px', background: COLORS.card, position: 'fixed', top: 0, width: '100%', zIndex: 100 },
  hamburger: { background: 'none', border: 'none', color: COLORS.accent, fontSize: '24px' },
  sidebar: { width: '280px', backgroundColor: COLORS.card, padding: '30px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', position: window.innerWidth <= 768 ? 'fixed' : 'relative', height: '100%', transition: '0.3s', zIndex: 99 },
  langSelect: { background: '#000', color: '#fff', padding: '5px', borderRadius: '5px', marginBottom: '20px', border: `1px solid ${COLORS.border}` },
  brand: { fontSize: '24px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '40px' },
  nav: { flex: 1, listStyle: 'none', padding: 0 },
  li: { padding: '15px', cursor: 'pointer', borderRadius: '10px', marginBottom: '5px' },
  active: { padding: '15px', cursor: 'pointer', borderRadius: '10px', marginBottom: '5px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, fontWeight: 'bold' },
  main: { flex: 1, padding: window.innerWidth <= 768 ? '80px 20px 20px' : '40px', overflowY: 'auto' },
  card: { backgroundColor: COLORS.card, padding: '30px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' },
  formGrid: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '15px' },
  btnMain: { width: '100%', padding: '15px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  docGrid: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr 1fr', gap: '20px', marginTop: '20px' },
  btnDoc: { padding: '20px', backgroundColor: '#1e293b', color: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '10px', cursor: 'pointer' },
  btnOut: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left' },
  center: { textAlign: 'center', marginTop: '100px' }
};