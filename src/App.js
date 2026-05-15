import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnZIJ_LHfGJMivq3TuTcY2KRj4HErkZSs",
  authDomain: "cadastro-formulario-a2a77.firebaseapp.com",
  projectId: "cadastro-formulario-a2a77",
  storageBucket: "cadastro-formulario-a2a77.firebasestorage.app",
  messagingSenderId: "1030725916369",
  appId: "1:1030725916369:web:d3060e84b0d10417c9d7f0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar senha
  
  const [tab, setTab] = useState('clientes'); 
  const [clientes, setClientes] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tempProcesso, setTempProcesso] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [calcTab, setCalcTab] = useState('prazos');
  const [cData, setCData] = useState('');
  const [cDias, setCDias] = useState(15);
  const [cValor, setCValor] = useState('');
  const [cPerc, setCPerc] = useState(20);
  const [res, setRes] = useState('');

  const [iaPrompt, setIaPrompt] = useState('');
  const [iaResp, setIaResp] = useState('');

  const obterNomeUsuario = () => {
    if (!user || !user.email) return "USUÁRIO";
    const parteAntesDoArroba = user.email.split('@')[0];
    return parteAntesDoArroba.split('.')[0].toUpperCase();
  };

  const obterInicialUsuario = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "clientes"), orderBy("nome"));
      return onSnapshot(q, (s) => setClientes(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    }
  }, [user]);

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Preencha e-mail e senha.");
      return;
    }
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Conta criada com sucesso!");
      }
    } catch (e) { 
      if (e.code === 'auth/email-already-in-use') {
        alert("Esse e-mail já está cadastrado. Esqueceu sua senha?");
        setAuthMode('login'); 
      } else if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        alert("E-mail ou senha incorretos.");
      } else {
        alert("Erro na autenticação: " + e.message); 
      }
    }
  };

  const recuperarSenha = async () => {
    if (!email) {
      alert("Por favor, digite o seu e-mail no campo acima primeiro.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
    } catch (e) {
      alert("Erro ao enviar e-mail: " + e.message);
    }
  };

  const editarCliente = async (c) => {
    const n = prompt("Editar Nome:", c.nome);
    const d = prompt("Editar Documento:", c.cpf);
    if (n && d) await updateDoc(doc(db, "clientes", c.id), { nome: n, cpf: d });
  };

  const salvarProcesso = async () => {
    if (!selectedClient) return;
    await updateDoc(doc(db, "clientes", selectedClient.id), { processo: tempProcesso });
    alert("Processo vinculado com sucesso!");
    setSelectedClient({ ...selectedClient, processo: tempProcesso });
  };

  const calcularTudo = () => {
    if (calcTab === 'prazos') {
      if (!cData) return;
      let d = new Date(cData + 'T12:00:00');
      let cont = 0;
      while (cont < parseInt(cDias)) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) cont++;
      }
      setRes(`Data Fatal: ${d.toLocaleDateString('pt-BR')}`);
    } else if (calcTab === 'honorarios') {
      const valor = parseFloat(cValor);
      const total = (valor * (parseInt(cPerc) / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      setRes(`Honorários: ${total}`);
    }
  };

  if (!user) {
    return (
      <div style={s.authPage}>
        <div style={s.authCard}>
          <h1 style={{color:'#111827', marginBottom:'10px', fontSize:'36px', fontWeight:'bold', fontFamily:'serif'}}>JurisPRO</h1>
          <h3 style={{marginBottom:'20px', color:'#111827', fontWeight:'bold', fontSize:'20px'}}>
            {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
          </h3>
          <input placeholder="E-mail" value={email} type="email" style={s.input} onChange={e => setEmail(e.target.value)} />
          
          {/* Container com posição relativa para embutir o olhinho no input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              placeholder="Senha" 
              type={showPassword ? "text" : "password"} 
              value={password} 
              style={{ ...s.input, paddingRight: '45px' }} 
              onChange={e => setPassword(e.target.value)} 
            />
            <span 
              onClick={() => setShowPassword(!showPassword)} 
              style={s.eyeIcon}
            >
              {showPassword ? '👁️' : '🙈'}
            </span>
          </div>
          
          <button onClick={handleAuth} style={s.btnBlueAuth}>
            {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>

          {authMode === 'login' && (
            <p onClick={recuperarSenha} style={{...s.toggleAuth, fontSize:'12px', marginTop:'10px', color:'#ef4444'}}>
              Esqueceu sua senha? Clique aqui para recuperar
            </p>
          )}

          <p onClick={() => setAuthMode(authMode === 'login' ? 'cadastro' : 'login')} style={s.toggleAuth}>
            {authMode === 'login' ? 'Não tem conta? Cadastre-se aqui' : 'Já tem conta? Faça Login'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.body}>
      <div style={s.mobileHeader}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={s.hamburger}>☰</button>
        <span style={{fontWeight:'bold'}}>JurisPRO</span>
        <div style={s.avatarSmall}>{obterInicialUsuario()}</div>
      </div>

      <aside style={{...s.sidebar, display: menuOpen || window.innerWidth > 768 ? 'flex' : 'none'}}>
        <h1 style={s.logo}>JurisPRO</h1>
        
        <div style={s.menuLabel}>PRINCIPAL</div>
        <div onClick={() => {setTab('inicio'); setMenuOpen(false)}} style={tab === 'inicio' ? s.navA : s.nav}>🏠 Dashboard</div>
        <div onClick={() => {setTab('clientes'); setSelectedClient(null); setMenuOpen(false)}} style={tab === 'clientes' ? s.navA : s.nav}>👥 Clientes</div>
        <div onClick={() => {setTab('processos'); setMenuOpen(false)}} style={tab === 'processos' ? s.navA : s.nav}>⚖️ Processos</div>
        
        <div style={{...s.menuLabel, marginTop:'20px'}}>FERRAMENTAS</div>
        <div onClick={() => {setTab('calc'); setMenuOpen(false)}} style={tab === 'calc' ? s.navA : s.nav}>📅 Calculadoras</div>
        <div onClick={() => {setTab('ia'); setMenuOpen(false)}} style={tab === 'ia' ? s.navA : s.nav}>🤖 IA Jurídica</div>
        
        <div onClick={() => signOut(auth)} style={s.sair}>Sair da Conta</div>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <span style={s.path}>BEM-VINDA, DRA. {obterNomeUsuario()}</span>
          <div style={s.avatar}>{obterInicialUsuario()}</div>
        </header>

        <div style={s.container}>
          {tab === 'inicio' && (
            <div style={s.dashGrid}>
              <div style={s.stat}><h4>Clientes</h4><h2>{clientes.length}</h2></div>
              <div style={s.stat}><h4>Prazos</h4><h2 style={{color:'red'}}>3</h2></div>
              <div style={s.stat}><h4>Caixa</h4><h2 style={{color:'#10b981'}}>R$ 4.500</h2></div>
            </div>
          )}

          {tab === 'clientes' && !selectedClient && (
            <div style={s.card}>
              <div style={s.flex}>
                <h3 style={s.titleCard}>Gestão de Carteira</h3>
                <button onClick={async () => {
                  const n = prompt("Nome:"); const c = prompt("CPF:");
                  if(n) await addDoc(collection(db, "clientes"), {nome:n, cpf:c || 'Não informado', processo:'', data: new Date()});
                }} style={s.btnAdd}>+ NOVO CLIENTE</button>
              </div>
              {clientes.map(c => (
                <div key={c.id} style={s.row}>
                  <span><strong style={{fontSize:'16px'}}>{c.nome}</strong><br/><small style={{color:'#64748b'}}>{c.cpf}</small></span>
                  <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                    <button onClick={() => editarCliente(c)} style={s.btnIcon} title="Editar">✏️</button>
                    <button onClick={async () => { if(window.confirm("Excluir?")) await deleteDoc(doc(db, "clientes", c.id)) }} style={s.btnIcon} title="Excluir">🗑️</button>
                    <button onClick={() => { setSelectedClient(c); setTempProcesso(c.processo || ''); }} style={s.btnDossie}>ABRIR DOSSIÊ</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedClient && (
            <div style={s.card}>
              <button onClick={() => setSelectedClient(null)} style={s.back}>⬅ Voltar</button>
              <h2 style={{fontSize:'24px', fontWeight:'bold', margin:'10px 0'}}>{selectedClient.nome}</h2>
              <div style={s.infoBox}>
                <p style={{marginBottom:'15px'}}><strong>CPF:</strong> {selectedClient.cpf}</p>
                <label style={s.label}>Vincular Processo CNJ:</label>
                <div style={s.flexMobile}>
                  <input style={s.input} value={tempProcesso} onChange={(e) => setTempProcesso(e.target.value)} placeholder="0000000-00.0000.0.00.0000" />
                  <button onClick={salvarProcesso} style={s.btnBlueSmall}>SALVAR</button>
                </div>
              </div>

              <div style={{marginTop:'25px'}}>
                <div style={s.tabLine}>
                  <span onClick={() => setCalcTab('prazos')} style={calcTab === 'prazos' ? s.tabA : s.tab}>PRAZOS</span>
                  <span onClick={() => setCalcTab('honorarios')} style={calcTab === 'honorarios' ? s.tabA : s.tab}>HONORÁRIOS</span>
                </div>
                <div style={{marginTop:'20px'}}>
                  {calcTab === 'prazos' ? (
                    <><label style={s.label}>Início:</label><input type="date" style={s.input} onChange={e => setCData(e.target.value)} />
                      <label style={s.label}>Dias:</label><input type="number" style={s.input} value={cDias} onChange={e => setCDias(e.target.value)} /></>
                  ) : (
                    <><label style={s.label}>Valor:</label><input type="number" style={s.input} onChange={e => setCValor(e.target.value)} />
                      <label style={s.label}>%:</label><input type="number" style={s.input} value={cPerc} onChange={e => setCPerc(e.target.value)} /></>
                  )}
                  <button onClick={calcularTudo} style={s.btnBlue}>CALCULAR</button>
                  {res && <div style={s.res}>{res}</div>}
                </div>
              </div>
            </div>
          )}

          {tab === 'processos' && (
            <div style={s.card}>
              <h3 style={s.titleCard}>Acompanhamento Processual</h3>
              {clientes.filter(c => c.processo).length === 0 ? (
                <div style={s.placeholderBox}>Clique no cliente na aba "Clientes" para vincular um novo processo CNJ.</div>
              ) : (
                clientes.filter(c => c.processo).map(c => (
                  <div key={c.id} style={s.row}>
                    <span><strong>Nº {c.processo}</strong><br/><small style={{color:'#64748b'}}>Cliente: {c.nome}</small></span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'calc' && (
            <div style={s.card}>
              <h3 style={s.titleCard}>Calculadora de Prazos Úteis</h3>
              <div style={{marginTop:'20px'}}>
                <input type="date" style={s.input} onChange={e => setCData(e.target.value)} />
                <input type="number" placeholder="Dias" style={s.input} onChange={e => setCDias(e.target.value)} />
                <button onClick={calcularTudo} style={s.btnBlue}>CALCULAR PRAZO</button>
                {res && <div style={s.res}>{res}</div>}
              </div>
            </div>
          )}

          {tab === 'ia' && (
            <div style={s.card}>
              <h3 style={s.titleCard}>🤖 IA Jurídica</h3>
              <textarea style={{...s.input, height:'150px', marginTop:'15px'}} placeholder="Cole o texto..." onChange={e => setIaPrompt(e.target.value)} />
              <button onClick={() => {setIaResp("Analisando..."); setTimeout(()=>setIaResp("Análise: Risco de prescrição."), 1500)}} style={s.btnBlue}>ANALISAR</button>
              {iaResp && <div style={s.infoBox}>{iaResp}</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const s = {
  body: { display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif', flexDirection: window.innerWidth < 768 ? 'column' : 'row' },
  authPage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#7b7b7b' },
  authCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '15px', textAlign: 'center', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  toggleAuth: { marginTop: '15px', color: '#1d4ed8', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' },
  mobileHeader: { display: window.innerWidth < 768 ? 'flex' : 'none', padding: '15px', backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' },
  hamburger: { fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' },
  sidebar: { width: window.innerWidth < 768 ? '100%' : '250px', backgroundColor: '#111c2a', padding: '25px 15px', color: '#fff', flexDirection: 'column', position: window.innerWidth < 768 ? 'absolute' : 'relative', zIndex: 100, height: '100%' },
  logo: { fontSize: '26px', fontWeight: 'bold', marginBottom: '30px' },
  menuLabel: { fontSize: '11px', color: '#4b5563', marginBottom: '10px', fontWeight:'bold', letterSpacing:'0.5px' },
  nav: { padding: '12px 15px', cursor: 'pointer', color: '#94a3b8', borderRadius: '8px', marginBottom: '5px' },
  navA: { padding: '12px 15px', cursor: 'pointer', color: '#fff', backgroundColor: '#2563eb', borderRadius: '8px', marginBottom: '5px', fontWeight: 'bold' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  header: { display: window.innerWidth < 768 ? 'none' : 'flex', padding: '20px 40px', backgroundColor: '#fff', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', alignItems:'center' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight:'bold' },
  avatarSmall: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight:'bold' },
  container: { padding: '25px' },
  dashGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  stat: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #e5e7eb' },
  titleCard: { fontSize: '20px', fontWeight: 'bold', color: '#000' },
  row: { padding: '15px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems:'center' },
  btnDossie: { border: '1px solid #2563eb', color: '#2563eb', background: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold', fontSize: '13px' },
  btnIcon: { background: 'none', border: '1px solid #e5e7eb', padding: '5px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
  btnBlue: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop:'10px' },
  btnBlueAuth: { width: '100%', padding: '12px', backgroundColor: '#143365', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize:'16px' },
  btnBlueSmall: { padding: '10px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  flex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  flexMobile: { display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', gap: '10px' },
  tabLine: { display: 'flex', gap: '20px', borderBottom: '1px solid #e5e7eb' },
  tab: { paddingBottom: '10px', cursor: 'pointer', color: '#64748b', fontWeight:'bold', fontSize:'14px' },
  tabA: { paddingBottom: '10px', cursor: 'pointer', color: '#2563eb', borderBottom: '2px solid #2563eb', fontWeight: 'bold', fontSize:'14px' },
  res: { marginTop: '15px', padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px', textAlign: 'center', color: '#166534', fontWeight: 'bold' },
  infoBox: { padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '15px', border: '1px solid #e5e7eb' },
  placeholderBox: { padding: '25px', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', textAlign: 'center' },
  label: { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', marginTop: '10px', color: '#000' },
  back: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginBottom: '10px' },
  btnAdd: { backgroundColor: '#fff', color: '#000', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold', fontSize:'13px' },
  sair: { marginTop: 'auto', color: '#ef4444', cursor: 'pointer', padding: '15px 5px', fontSize: '13px', fontWeight: 'bold' },
  path: { fontSize: '13px', color: '#000', fontWeight:'bold' },
  eyeIcon: { position: 'absolute', right: '15px', top: '24%', transform: 'translateY(-24%)', cursor: 'pointer', fontSize: '18px', userSelect: 'none' } // Estilo do olhinho
};