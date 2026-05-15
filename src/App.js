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

const langData = {
  pt: { dash: "📊 Dashboard BI", clients: "👥 Clientes (CRM)", procs: "⚖️ Processos & Tribunais", agenda: "📅 Agenda & Prazos", fin: "💰 Financeiro", docs: "📄 Gerador de Docs", welcome: "Bem-vinda, Dra. Marina", save: "CADASTRAR E GERAR HISTÓRICO", logout: "Sair (LGPD Safe)" },
  en: { dash: "📊 BI Dashboard", clients: "👥 Clients (CRM)", procs: "⚖️ Lawsuits & Courts", agenda: "📅 Schedule & Deadlines", fin: "💰 Financial", docs: "📄 Doc Generator", welcome: "Welcome, Dr. Marina", save: "REGISTER & GENERATE HISTORY", logout: "Logout" },
  es: { dash: "📊 Panel BI", clients: "👥 Clientes (CRM)", procs: "⚖️ Procesos y Tribunales", agenda: "📅 Agenda y Plazos", fin: "💰 Financiero", docs: "📄 Gerador de Docs", welcome: "Bienvenida, Dra. Marina", save: "REGISTRAR Y GENERAR HISTORIAL", logout: "Salir" }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [lang, setLang] = useState('pt');
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

  const salvar = async () => {
    if(!formCli.nome) return alert("Nome obrigatório");
    await addDoc(collection(db, "clientes"), { ...formCli, advId: user.uid, data: new Date().toLocaleDateString() });
    setFormCli({ nome: '', cpf: '', tel: '', email: '' });
    alert("Cadastrado!");
  };

  if (!user) return (
    <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#000'}}>
      <div style={{padding:'40px', background:COLORS.card, borderRadius:'20px', textAlign:'center', width:'350px', border:`1px solid ${COLORS.border}`}}>
        <h2 style={{color: COLORS.accent, marginBottom: '20px'}}>JurisPRO Elite</h2>
        <input style={s.input} placeholder="E-mail" id="em" />
        <input style={s.input} type="password" placeholder="Senha" id="ps" />
        <button style={s.btnMain} onClick={() => signInWithEmailAndPassword(auth, document.getElementById('em').value, document.getElementById('ps').value)}>ENTRAR</button>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <div style={s.brand}>JurisPRO <span style={{fontSize:'10px', color: COLORS.accent}}>v2.0</span></div>
        <select onChange={(e) => setLang(e.target.value)} style={s.langSelect}>
          <option value="pt">BR PT</option><option value="en">US EN</option><option value="es">ES ES</option>
        </select>
        <nav style={s.nav}>
          <li onClick={() => setTab('dashboard')} style={tab === 'dashboard' ? s.active : s.li}>{t.dash}</li>
          <li onClick={() => setTab('clientes')} style={tab === 'clientes' ? s.active : s.li}>{t.clients}</li>
          <li onClick={() => setTab('processos')} style={tab === 'processos' ? s.active : s.li}>{t.procs}</li>
          <li onClick={() => setTab('agenda')} style={tab === 'agenda' ? s.active : s.li}>{t.agenda}</li>
          <li onClick={() => setTab('financeiro')} style={tab === 'financeiro' ? s.active : s.li}>{t.fin}</li>
          <li onClick={() => setTab('docs')} style={tab === 'docs' ? s.active : s.li}>{t.docs}</li>
        </nav>
        <button onClick={() => signOut(auth)} style={s.btnOut}>{t.logout}</button>
      </aside>

      <main style={s.main}>
        <h2 style={{marginBottom: '30px'}}>{t.welcome}</h2>

        {tab === 'dashboard' && <div style={s.centerCard}><h3>Módulo DASHBOARD</h3><p>Sincronizado com Nuvem Global</p></div>}
        {tab === 'processos' && <div style={s.centerCard}><h3>Módulo PROCESSOS</h3><p>Sincronizado com Nuvem Global</p></div>}
        {tab === 'agenda' && <div style={s.centerCard}><h3>Módulo Agenda & Prazos</h3><p>Sincronizado com Nuvem Global</p></div>}
        {tab === 'financeiro' && <div style={s.centerCard}><h3>Módulo FINANCEIRO</h3><p>Sincronizado com Nuvem Global</p></div>}

        {tab === 'clientes' && (
          <div style={s.card}>
            <h2 style={{marginBottom:'25px'}}>Novo Cadastro de Cliente</h2>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Nome Completo" value={formCli.nome} onChange={e => setFormCli({...formCli, nome: e.target.value})} />
              <input style={s.input} placeholder="CPF / CNPJ" value={formCli.cpf} onChange={e => setFormCli({...formCli, cpf: e.target.value})} />
              <input style={s.input} placeholder="Telefone" value={formCli.tel} onChange={e => setFormCli({...formCli, tel: e.target.value})} />
              <input style={s.input} placeholder="E-mail" value={formCli.email} onChange={e => setFormCli({...formCli, email: e.target.value})} />
            </div>
            <button style={s.btnMain} onClick={salvar}>{t.save}</button>
          </div>
        )}

        {tab === 'docs' && (
          <div style={s.card}>
            <h2 style={{marginBottom:'20px'}}>Gerador Inteligente de Documentos</h2>
            <p>Selecione o cliente:</p>
            <select style={s.input}>{clientes.map(c => <option key={c.id}>{c.nome}</option>)}</select>
            <div style={s.docGrid}>
              <button style={s.btnDoc}>📄 Procuração Ad Judicia</button>
              <button style={s.btnDoc}>📄 Contrato de Honorários</button>
              <button style={s.btnDoc}>📄 Declaração de Hipossuficiência</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'sans-serif' },
  sidebar: { width: '280px', backgroundColor: COLORS.card, padding: '30px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column' },
  brand: { fontSize: '22px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '40px' },
  langSelect: { background: '#000', color: '#fff', padding: '10px', borderRadius: '5px', marginBottom: '30px', border: `1px solid ${COLORS.border}` },
  nav: { flex: 1, listStyle: 'none', padding: 0 },
  li: { padding: '15px', cursor: 'pointer', borderRadius: '12px', marginBottom: '8px', color: '#94a3b8' },
  active: { padding: '15px', cursor: 'pointer', borderRadius: '12px', marginBottom: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: COLORS.accent, fontWeight: 'bold' },
  main: { flex: 1, padding: '50px', overflowY: 'auto' },
  card: { backgroundColor: COLORS.card, padding: '40px', borderRadius: '24px', border: `1px solid ${COLORS.border}` },
  centerCard: { textAlign: 'center', marginTop: '100px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' },
  input: { width: '100%', padding: '16px', borderRadius: '10px', border: `1px solid ${COLORS.border}`, backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  docGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' },
  btnDoc: { padding: '25px', backgroundColor: '#1e293b', color: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: '15px', cursor: 'pointer' },
  btnOut: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '10px' }
};