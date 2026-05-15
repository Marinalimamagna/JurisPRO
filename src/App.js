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

const THEME = { sidebar: '#0f172a', bg: '#f1f5f9', accent: '#2563eb', border: '#e2e8f0', white: '#ffffff', text: '#1e293b' };

const i18n = {
  pt: { start: "Início", clients: "Clientes", cases: "Processos", calcs: "Calculadora PRO", ia: "IA Jurídica", calc_title: "Gestor de Prazos Processuais", date_pub: "Data da Publicação", days: "Prazo (Dias)", norm: "Norma Aplicável", result: "Data Final Estimada", detail: "Memória de Cálculo", back: "Voltar", new_cli: "Novo Cliente" },
  en: { start: "Home", clients: "Clients", cases: "Lawsuits", calcs: "PRO Calculator", ia: "Legal AI", calc_title: "Procedural Deadline Manager", date_pub: "Publication Date", days: "Days", norm: "Legal Norm", result: "Estimated Due Date", detail: "Calculation Memory", back: "Back", new_cli: "Add Client" },
  es: { start: "Inicio", clients: "Clientes", cases: "Procesos", calcs: "Calculadora PRO", ia: "IA Jurídica", calc_title: "Gestor de Plazos Procesales", date_pub: "Fecha de Publicación", days: "Días", norm: "Norma Aplicable", result: "Fecha Final Estimada", detail: "Memoria de Cálculo", back: "Volver", new_cli: "Nuevo Cliente" }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [lang, setLang] = useState('pt');
  const [clientes, setClientes] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [viewCli, setViewCli] = useState(null);
  
  // Estados da Calculadora Avançada
  const [calc, setCalc] = useState({ data: '', dias: 15, tipo: 'uteis', norma: 'cpc' });
  const [resultado, setResultado] = useState(null);

  const t = i18n[lang];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        onSnapshot(query(collection(db, "clientes"), where("advId", "==", u.uid)), s => setClientes(s.docs.map(d => ({...d.data(), id: d.id}))));
        onSnapshot(query(collection(db, "processos"), where("advId", "==", u.uid)), s => setProcessos(s.docs.map(d => ({...d.data(), id: d.id}))));
      }
    });
    return unsub;
  }, []);

  const calcularPrazoElite = () => {
    if(!calc.data) return alert("Insira a data de publicação.");
    let d = new Date(calc.data);
    let diasContados = 0;
    
    // Simulação de Recesso Forense (20/12 a 20/01)
    const isRecesso = (date) => {
        const m = date.getMonth();
        const day = date.getDate();
        if (m === 11 && day >= 20) return true;
        if (m === 0 && day <= 20) return true;
        return false;
    };

    while (diasContados < calc.dias) {
      d.setDate(d.getDate() + 1);
      if (isRecesso(d)) continue; // Pula recesso
      if (calc.tipo === 'corridos') {
        diasContados++;
      } else {
        if (d.getDay() !== 0 && d.getDay() !== 6) diasContados++; // Pula FDS
      }
    }
    setResultado(d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  };

  if (!user) return <div style={s.loginWrapper}><div style={s.card}><h2>JurisPRO Login</h2><button style={s.btnMain} onClick={() => signInWithEmailAndPassword(auth, "teste@teste.com", "123456")}>Acessar Demo</button></div></div>;

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <div style={s.logo}>Juris<span>PRO</span></div>
        <nav>
          <li onClick={() => {setTab('dashboard'); setViewCli(null)}} style={tab === 'dashboard' ? s.liA : s.li}>🏠 {t.start}</li>
          <li onClick={() => {setTab('clientes'); setViewCli(null)}} style={tab === 'clientes' ? s.liA : s.li}>👥 {t.clients}</li>
          <li onClick={() => {setTab('processos'); setViewCli(null)}} style={tab === 'processos' ? s.liA : s.li}>⚖️ {t.cases}</li>
          <li onClick={() => setTab('calculadora')} style={tab === 'calculadora' ? s.liA : s.li}>🧮 {t.calcs}</li>
        </nav>
        <button onClick={() => signOut(auth)} style={s.btnOut}>Sair do Sistema</button>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <div style={s.langs}>
            {['pt', 'en', 'es'].map(l => <span key={l} onClick={() => setLang(l)} style={lang === l ? s.langA : s.lang}>{l.toUpperCase()}</span>)}
          </div>
          <div style={s.avatar}>{user.email[0].toUpperCase()}</div>
        </header>

        <div style={s.container}>
          {tab === 'dashboard' && (
            <div style={s.dashGrid}>
              <div style={s.statBox}><h4>{t.cases}</h4><h2>{processos.length}</h2></div>
              <div style={s.statBox}><h4>{t.clients}</h4><h2>{clientes.length}</h2></div>
              <div style={{...s.card, gridColumn: 'span 2'}}>
                <h3>Dra. Marina, bem-vinda ao JurisPRO</h3>
                <p>O seu sistema está pronto para as demandas de hoje.</p>
              </div>
            </div>
          )}

          {tab === 'calculadora' && (
            <div style={s.card}>
              <h2 style={{marginBottom:'20px', color:THEME.accent}}>{t.calc_title}</h2>
              <div style={s.flexGrid}>
                <div style={{flex:1}}>
                  <label style={s.label}>{t.date_pub}</label>
                  <input type="date" style={s.input} onChange={e => setCalc({...calc, data: e.target.value})} />
                </div>
                <div style={{flex:1}}>
                  <label style={s.label}>{t.days}</label>
                  <input type="number" style={s.input} value={calc.dias} onChange={e => setCalc({...calc, dias: e.target.value})} />
                </div>
              </div>
              <label style={s.label}>{t.norm}</label>
              <select style={s.input} onChange={e => setCalc({...calc, tipo: e.target.value})}>
                <option value="uteis">CPC/2015 - Dias Úteis</option>
                <option value="corridos">CPP / Dias Corridos</option>
              </select>
              <button style={s.btnMain} onClick={calcularPrazoElite}>SIMULAR PRAZO</button>
              
              {resultado && (
                <div style={s.resCard}>
                  <p style={{fontSize:'12px', color:'#64748b'}}>{t.result}</p>
                  <h2 style={{color: THEME.accent}}>{resultado}</h2>
                  <div style={s.tagRecesso}>Considerando Recesso Forense e Finais de Semana</div>
                </div>
              )}
            </div>
          )}

          {tab === 'clientes' && !viewCli && (
            <div style={s.card}>
              <div style={s.flexBetween}><h3>{t.clients}</h3><button style={s.btnSmall}>+ {t.new_cli}</button></div>
              {clientes.map(c => (
                <div key={c.id} style={s.row}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <div style={s.circle}>{c.nome[0]}</div>
                        <div><strong>{c.nome}</strong><br/><small>{c.cpf}</small></div>
                    </div>
                    <button style={s.btnGhost} onClick={() => setViewCli(c)}>Acessar Dossiê</button>
                </div>
              ))}
            </div>
          )}

          {viewCli && (
            <div style={s.card}>
                <button onClick={() => setViewCli(null)} style={s.backBtn}>⬅ {t.back}</button>
                <h2>Cliente: {viewCli.nome}</h2>
                <div style={s.infoBox}>
                    <h4>Processos Ativos</h4>
                    {processos.filter(p => p.clienteId === viewCli.id).map(p => (
                        <div key={p.id} style={s.row}>Processo Nº {p.numero}</div>
                    ))}
                </div>
            </div>
          )}

          {tab === 'processos' && (
            <div style={s.card}>
                <h3>{t.cases}</h3>
                {processos.map(p => (
                    <div key={p.id} style={s.row}><strong>{p.numero}</strong> <small>Status: Em andamento</small></div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', backgroundColor: THEME.bg, fontFamily: 'Inter, sans-serif' },
  sidebar: { width: '250px', backgroundColor: THEME.sidebar, padding: '25px', display: 'flex', flexDirection: 'column' },
  logo: { fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '40px' },
  li: { padding: '12px', color: '#94a3b8', cursor: 'pointer', listStyle: 'none', borderRadius: '8px', marginBottom: '5px' },
  liA: { padding: '12px', color: '#fff', backgroundColor: THEME.accent, fontWeight: 'bold', listStyle: 'none', borderRadius: '8px', marginBottom: '5px' },
  main: { flex: 1, overflowY: 'auto' },
  header: { padding: '15px 40px', background: '#fff', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  langs: { display: 'flex', gap: '15px' },
  lang: { cursor: 'pointer', fontSize: '12px', color: '#94a3b8' },
  langA: { cursor: 'pointer', fontSize: '12px', color: THEME.accent, fontWeight: 'bold' },
  avatar: { width: '35px', height: '35px', borderRadius: '50%', background: THEME.accent, color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  container: { padding: '35px' },
  dashGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  statBox: { background: '#fff', padding: '25px', borderRadius: '15px', border: `1px solid ${THEME.border}`, textAlign: 'center' },
  card: { background: '#fff', padding: '30px', borderRadius: '20px', border: `1px solid ${THEME.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  input: { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: `1px solid ${THEME.border}`, boxSizing: 'border-box', outline: 'none' },
  label: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  btnMain: { width: '100%', padding: '16px', background: THEME.accent, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  resCard: { marginTop: '30px', padding: '25px', background: '#eff6ff', borderRadius: '15px', border: `1px solid ${THEME.accent}`, textAlign: 'center' },
  tagRecesso: { display: 'inline-block', marginTop: '10px', padding: '5px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  row: { padding: '15px 0', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  circle: { width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: THEME.accent },
  btnGhost: { background: 'none', border: `1px solid ${THEME.accent}`, color: THEME.accent, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnSmall: { padding: '8px 16px', background: THEME.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  backBtn: { background: 'none', border: 'none', color: THEME.accent, cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' },
  infoBox: { marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' },
  flexGrid: { display: 'flex', gap: '20px' },
  loginWrapper: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' },
  btnOut: { marginTop: 'auto', background: 'none', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer' }
};