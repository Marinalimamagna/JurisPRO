import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc } from "firebase/firestore";

// CONFIGURAÇÃO DO SEU FIREBASE (MANTIDA ORIGINAL)
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

// 1. DICIONÁRIO DE IDIOMAS (NOVO - INTEGRADO AO SEU CÓDIGO)
const langData = {
  pt: {
    dash: "Dashboard BI", clients: "Clientes (CRM)", procs: "Processos & Tribunais", agenda: "Agenda & Prazos",
    fin: "Financeiro", docs: "Gerador de Docs", welcome: "Bem-vinda, Dra. Marina", newCli: "Novo Cadastro de Cliente",
    save: "CADASTRAR E GERAR HISTÓRICO", logout: "Sair (LGPD Safe)", name: "Nome Completo", registered: "Clientes Cadastrados",
    generateDoc: "Gerador Inteligente de Documentos", selectCli: "Selecione o cliente para preencher automaticamente:"
  },
  en: {
    dash: "BI Dashboard", clients: "Clients (CRM)", procs: "Lawsuits & Courts", agenda: "Schedule & Deadlines",
    fin: "Financial", docs: "Doc Generator", welcome: "Welcome, Dr. Marina", newCli: "New Client Registration",
    save: "REGISTER & GENERATE HISTORY", logout: "Logout (LGPD Safe)", name: "Full Name", registered: "Registered Clients",
    generateDoc: "Intelligent Document Generator", selectCli: "Select client for automatic pre-fill:"
  },
  es: {
    dash: "Panel de BI", clients: "Clientes (CRM)", procs: "Procesos y Tribunales", agenda: "Agenda y Plazos",
    fin: "Financiero", docs: "Generador de Docs", welcome: "Bienvenida, Dra. Marina", newCli: "Nuevo Registro de Cliente",
    save: "REGISTRAR Y GENERAR HISTORIAL", logout: "Salir (LGPD Safe)", name: "Nombre Completo", registered: "Clientes Registrados",
    generateDoc: "Generador Inteligente de Documentos", selectCli: "Seleccione el cliente para autocompletar:"
  }
};

const COLORS = { bg: '#020617', card: '#0f172a', accent: '#38bdf8', text: '#f8fafc', border: '#1e293b', success: '#22c55e' };

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [clientes, setClientes] = useState([]);
  const [processos, setProcessos] = useState([]);
  
  // 2. ESTADOS DO IDIOMA E MOBILE (NOVOS)
  const [lang, setLang] = useState('pt'); // Idioma padrão
  const [menuOpen, setMenuOpen] = useState(false); // Menu mobile
  const t = langData[lang]; // Atalho para tradução

  // Seu Estado para Cadastro de Cliente (Original Mantido)
  const [formCli, setFormCli] = useState({ nome: '', cpf: '', tel: '', email: '' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Puxa Clientes (Lógica original mantida)
        onSnapshot(query(collection(db, "clientes"), where("advId", "==", u.uid)), (s) => 
          setClientes(s.docs.map(d => ({...d.data(), id: d.id}))));
        // Puxa Processos (Lógica original mantida)
        onSnapshot(query(collection(db, "processos"), where("advId", "==", u.uid)), (s) => 
          setProcessos(s.docs.map(d => ({...d.data(), id: d.id}))));
      }
    });
    return unsub;
  }, []);

  // Sua Função salvarCliente (Original Mantida)
  const salvarCliente = async () => {
    if(!formCli.nome) return alert("Nome é obrigatório");
    await addDoc(collection(db, "clientes"), { ...formCli, advId: user.uid, data: new Date().toLocaleDateString() });
    setFormCli({ nome: '', cpf: '', tel: '', email: '' });
    alert("Cliente Cadastrado e Protegido (LGPD)!"); // Mantendo sua mensagem
  };

  // Login component (Original Mantido)
  if (!user) return <Login handleAuth={(m, e, p) => m === 'login' ? signInWithEmailAndPassword(auth, e, p) : createUserWithEmailAndPassword(auth, e, p)} COLORS={COLORS} s={s} />;

  return (
    <div style={s.app}>
      {/* 3. MOBILE HEADER (NOVO) */}
      <div style={s.mobileBar}>
        <div style={{color: COLORS.accent, fontWeight:'bold'}}>JurisPRO</div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={s.hamburger}>☰</button>
      </div>

      {/* MENU LATERAL COMPLETO (Original, mas Responsivo) */}
      <aside style={{...s.sidebar, left: menuOpen ? '0' : (window.innerWidth <= 768 ? '-100%' : '0')}}>
        <div style={s.brand}>JurisPRO <span style={{fontSize:'10px', color: COLORS.accent}}>v2.0 Global</span></div>
        
        {/* 4. SELETOR DE IDIOMA (NOVO - INTEGRADO A SIDEBAR ORIGINAL) */}
        <div style={s.langSelector}>
            <label style={{fontSize:'10px', color:'#94a3b8'}}>Idioma / Language / Idioma</label>
            <select onChange={(e) => setLang(e.target.value)} style={s.langSelectInput}>
                <option value="pt">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
            </select>
        </div>

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

      {/* 5. OVERLAY MOBILE (NOVO - PARA FECHAR MENU) */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={s.overlay}></div>}

      <main style={s.main}>
        <h2 style={{marginBottom: '20px'}}>{t.welcome}</h2>

        {/* TELA DE CLIENTES (ITEM 1 ORIGINAL - MANTIDA E TRADUZIDA) */}
        {tab === 'clientes' && (
          <div style={s.card}>
            <h2>{t.newCli}</h2>
            <div style={s.formGrid}>
              <input style={s.input} placeholder={t.name} value={formCli.nome} onChange={e => setFormCli({...formCli, nome: e.target.value})} />
              <input style={s.input} placeholder="CPF / CNPJ" value={formCli.cpf} onChange={e => setFormCli({...formCli, cpf: e.target.value})} />
              <input style={s.input} placeholder="Telefone" value={formCli.tel} onChange={e => setFormCli({...formCli, tel: e.target.value})} />
              <input style={s.input} placeholder="E-mail" value={formCli.email} onChange={e => setFormCli({...formCli, email: e.target.value})} />
            </div>
            <button style={s.btnMain} onClick={salvarCliente}>{t.save}</button>
            
            <div style={{marginTop: '30px'}}>
              <h3>{t.registered}</h3>
              {clientes.map(c => (
                <div key={c.id} style={s.listCard}>
                  <strong>{c.nome}</strong> - {c.cpf} | <span style={{color: COLORS.accent}}>Acessar Área do Cliente</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TELA DE GERAÇÃO DE DOCUMENTOS (ITEM 5 ORIGINAL - MANTIDA E TRADUZIDA) */}
        {tab === 'docs' && (
          <div style={s.card}>
            <h2>{t.generateDoc}</h2>
            <p>{t.selectCli}</p>
            <select style={s.input}>
              {clientes.map(c => <option key={c.id}>{c.nome}</option>)}
            </select>
            <div style={s.docGrid}>
              <button style={s.btnDoc}>📄 Procuração Ad Judicia</button>
              <button style={s.btnDoc}>📄 Contrato de Honorários</button>
              <button style={s.btnDoc}>📄 Declaração de Hipossuficiência</button>
            </div>
          </div>
        )}

        {/* MENSAGEM DE CONSTRUÇÃO (MANTIDA E TRADUZIDA) */}
        {['dashboard', 'processos', 'agenda', 'financeiro'].includes(tab) && (
          <div style={s.center}>
            <h2>Módulo {t[tab] || tab.toUpperCase()}</h2>
            <p>Conectando APIs de Tribunais Globais...</p>
          </div>
        )}
      </main>
    </div>
  );
}

// ESTILOS PREMIUM (ORIGINAIS ADAPTADOS PARA MOBILE)
const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden' },
  // Estilos Mobile (Novos)
  mobileBar: { display: window.innerWidth <= 768 ? 'flex' : 'none', justifyContent: 'space-between', padding: '15px 20px', background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, position: 'fixed', top: 0, width: '100%', zIndex: 100 },
  hamburger: { background: 'none', border: 'none', color: COLORS.accent, fontSize: '24px', cursor: 'pointer' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 98 },
  // Sidebar Adaptada
  sidebar: { 
    width: '280px', backgroundColor: COLORS.card, padding: '30px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column',
    position: window.innerWidth <= 768 ? 'absolute' : 'relative', height: '100%', transition: '0.3s', zIndex: 99
  },
  // Seletor Idioma
  langSelector: { marginBottom: '20px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px' },
  langSelectInput: { width: '100%', padding: '8px', background: '#000', color: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '5px', marginTop: '5px' },

  brand: { fontSize: '24px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '40px' },
  nav: { flex: 1, listStyle: 'none', padding: 0 },
  li: { padding: '15px', cursor: 'pointer', borderRadius: '10px', marginBottom: '5px', transition: '0.3s' },
  active: { padding: '15px', cursor: 'pointer', borderRadius: '10px', marginBottom: '5px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, fontWeight: 'bold' },
  main: { flex: 1, padding: window.innerWidth <= 768 ? '80px 20px 20px' : '40px', overflowY: 'auto' },
  card: { backgroundColor: COLORS.card, padding: '30px', borderRadius: '20px', border: `1px solid ${COLORS.border}` },
  input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' },
  // Grid do formulário adaptável
  formGrid: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '15px' },
  btnMain: { width: '100%', padding: '15px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  listCard: { padding: '15px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' },
  // Grid de documentos adaptável
  docGrid: { display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr 1fr', gap: '20px', marginTop: '20px' },
  btnDoc: { padding: '20px', backgroundColor: '#1e293b', color: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center' },
  btnOut: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left' },
  center: { textAlign: 'center', marginTop: '100px' }
};

// COMPONENTE DE LOGIN (MANTIDO E ADAPTADO)
function Login({ handleAuth, COLORS, s }) {
  const [e, setE] = React.useState('');
  const [p, setP] = React.useState('');
  return (
    <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#000', color:'#fff', padding: '20px'}}>
      <div style={{padding:'40px', background:COLORS.card, borderRadius:'20px', textAlign:'center', width:'100%', maxWidth:'350px', border:`1px solid ${COLORS.border}`}}>
        <h2>JurisPRO Elite</h2>
        <input style={s.input} placeholder="E-mail" onChange={x => setE(x.target.value)} />
        <input style={s.input} type="password" placeholder="Senha" onChange={x => setP(x.target.value)} />
        <button style={s.btnMain} onClick={() => handleAuth('login', e, p)}>ENTRAR</button>
      </div>
    </div>
  );
}