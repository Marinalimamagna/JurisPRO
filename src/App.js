import React, { useState, useEffect } from 'react';

// PALETA DE CORES PREMIUM
const COLORS = {
  bg: '#020617', card: '#0f172a', accent: '#38bdf8', 
  gold: '#fbbf24', text: '#f8fafc', muted: '#94a3b8', 
  border: '#1e293b', success: '#22c55e', danger: '#ef4444'
};

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Dr. Rodrigo', office: 'Rodrigo Advocacia Premium', cargo: 'Sócio-Diretor' });
  
  // ESTADO GLOBAL DE DADOS
  const [processos, setProcessos] = useState(() => {
    const salvo = localStorage.getItem('juris_master_data');
    return salvo ? JSON.parse(salvo) : [
      { id: 1, cliente: 'Indústria Têxtil S.A', valor: 85000, area: 'Tributário', data: '2026-05-10', status: 'Ativo' },
      { id: 2, cliente: 'Condomínio Solar', valor: 12500, area: 'Cível', data: '2026-05-12', status: 'Urgente' }
    ];
  });

  const [promptIA, setPromptIA] = useState('');
  const [respostaIA, setRespostaIA] = useState('');

  useEffect(() => {
    localStorage.setItem('juris_master_data', JSON.stringify(processos));
  }, [processos]);

  // LÓGICA DE NEGÓCIO: PRAZO CPC/15 (DIAS ÚTEIS)
  const calcularPrazoFatal = (dataRef) => {
    if (!dataRef) return 'Não definido';
    let data = new Date(dataRef + 'T00:00:00');
    let diasUteis = 0;
    while (diasUteis < 15) {
      data.setDate(data.getDate() + 1);
      if (data.getDay() !== 0 && data.getDay() !== 6) diasUteis++;
    }
    return data.toLocaleDateString('pt-BR');
  };

  const totalEmCarteira = processos.reduce((a, b) => a + Number(b.valor), 0);

  // TELA DE LOGIN (SEGURANÇA)
  if (!isLogged) {
    return (
      <div style={s.loginContainer}>
        <div style={s.loginCard}>
          <div style={s.brandIconBig}>J</div>
          <h2 style={{color: COLORS.accent, marginBottom: '5px'}}>JurisPRO Ultra</h2>
          <p style={{color: COLORS.muted, fontSize: '14px'}}>Autenticação Biométrica Simulada</p>
          <div style={{marginTop: '30px', width: '100%'}}>
            <input style={s.input} type="email" placeholder="E-mail profissional" defaultValue="rodrigo@advocacia.com.br" />
            <input style={s.input} type="password" placeholder="Senha" defaultValue="********" />
            <button style={s.btnMain} onClick={() => setIsLogged(true)}>ACESSAR SISTEMA CRIPTOGRAFADO</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      {/* SIDEBAR COMPLETA */}
      <aside style={s.sidebar}>
        <div style={s.brand}><div style={s.brandIcon}>J</div> JurisPRO</div>
        <nav style={s.nav}>
          <div style={s.navLink(tab === 'dashboard')} onClick={() => setTab('dashboard')}>📊 Dashboard BI</div>
          <div style={s.navLink(tab === 'processos')} onClick={() => setTab('processos')}>📂 Gestão de Casos</div>
          <div style={s.navLink(tab === 'ia')} onClick={() => setTab('ia')}>🤖 Redator IA</div>
          <div style={s.navLink(tab === 'financeiro')} onClick={() => setTab('financeiro')}>💰 Fluxo de Caixa</div>
        </nav>
        
        <div style={s.userSection}>
          <div style={s.avatar}>R</div>
          <div style={{flex: 1}}>
            <div style={{fontSize: '13px', fontWeight: 'bold'}}>{user.name}</div>
            <div style={{fontSize: '10px', color: COLORS.success}}>PREMIUM CLOUD</div>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main style={s.content}>
        <header style={s.header}>
          <div>
            <h2 style={{margin: 0}}>{user.office}</h2>
            <div style={{display: 'flex', gap: '15px', marginTop: '5px', fontSize: '12px', color: COLORS.muted}}>
              <span>ID: #JP-2026-V11</span>
              <span>•</span>
              <span style={{color: COLORS.success}}>Status: Operacional</span>
            </div>
          </div>
          <button style={s.btnExport} onClick={() => window.print()}>EXPORTAR RELATÓRIO</button>
        </header>

        {/* VIEW: DASHBOARD */}
        {tab === 'dashboard' && (
          <div style={s.grid}>
            <StatCard label="Patrimônio sob Gestão" value={`R$ ${totalEmCarteira.toLocaleString()}`} color={COLORS.success} />
            <StatCard label="Processos Ativos" value={processos.length} color={COLORS.accent} />
            <StatCard label="Prazos Fatais" value={processos.length} color={COLORS.danger} />

            <div style={{...s.card, gridColumn: 'span 2'}}>
              <h3 style={{marginTop: 0}}>Performance de Faturamento</h3>
              <div style={s.chartArea}>
                {[30, 60, 45, 90, 100, 75, 95].map((h, i) => (
                  <div key={i} style={{...s.bar, height: `${h}%`}} title={`Semana ${i+1}`} />
                ))}
              </div>
            </div>

            <div style={s.card}>
              <h3 style={{marginTop: 0}}>Alertas IA</h3>
              <div style={s.alertMsg}>⚠️ Reclamatória #092 vence em 48h</div>
              <div style={{...s.alertMsg, borderLeftColor: COLORS.gold}}>📅 Audiência amanhã às 14h</div>
            </div>
          </div>
        )}

        {/* VIEW: GESTÃO DE PROCESSOS */}
        {tab === 'processos' && (
          <div style={s.card}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>Carteira Ativa (CPC/15)</h3>
              <button style={s.btnSmall} onClick={() => {
                const nome = prompt("Nome do Cliente:");
                const valor = prompt("Valor Honorários:");
                if(nome) setProcessos([...processos, { id: Date.now(), cliente: nome, valor: valor, area: 'Cível', data: '2026-05-14' }]);
              }}>+ ADICIONAR CASO</button>
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>CLIENTE</th>
                  <th style={s.th}>HONORÁRIOS</th>
                  <th style={s.th}>VENCIMENTO FATAL</th>
                  <th style={s.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {processos.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}><strong>{p.cliente}</strong></td>
                    <td style={s.td}>R$ {Number(p.valor).toLocaleString()}</td>
                    <td style={s.td}><span style={s.deadline}>{calcularPrazoFatal(p.data)}</span></td>
                    <td style={s.td}><span style={s.badge}>EM ANDAMENTO</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW: REDATOR IA */}
        {tab === 'ia' && (
          <div style={s.card}>
            <h3>🤖 Assistente de Peticionamento IA</h3>
            <p style={{color: COLORS.muted, fontSize: '14px'}}>A inteligência gera a estrutura jurídica pronta para revisão.</p>
            <textarea 
              style={s.textarea} 
              placeholder="Ex: Elabore uma petição inicial de cobrança baseada no Art. 784 do CPC..."
              value={promptIA}
              onChange={(e) => setPromptIA(e.target.value)}
            />
            <button style={s.btnMain} onClick={() => {
              setRespostaIA("Gerando estrutura jurídica... Aguarde.");
              setTimeout(() => setRespostaIA(`[PROCESSO FINALIZADO]\n\nOBJETO: ${promptIA}\n\nFUNDAMENTAÇÃO: Art. 319 e ss. do CPC/15.\n\nCONCLUSÃO: Requer a citação do réu para apresentar contestação no prazo legal de 15 dias úteis.`), 1500);
            }}>PROCESSAR PETIÇÃO</button>
            {respostaIA && <div style={s.iaResult}>{respostaIA}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES
const StatCard = ({label, value, color}) => (
  <div style={s.card}>
    <div style={{color: COLORS.muted, fontSize: '11px', fontWeight: 'bold'}}>{label.toUpperCase()}</div>
    <div style={{fontSize: '28px', fontWeight: 'bold', color: color, marginTop: '12px'}}>{value}</div>
  </div>
);

// CSS-IN-JS (SISTEMA DE ESTILOS PROFISSIONAIS)
const s = {
  app: { display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', sans-serif" },
  loginContainer: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  loginCard: { backgroundColor: COLORS.card, padding: '50px', borderRadius: '30px', textAlign: 'center', width: '380px', border: `1px solid ${COLORS.border}`, boxShadow: '0 0 50px rgba(56, 189, 248, 0.1)' },
  brandIconBig: { width: '70px', height: '70px', backgroundColor: COLORS.accent, color: '#fff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 20px' },
  sidebar: { width: '260px', backgroundColor: COLORS.card, borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', padding: '30px 20px' },
  brand: { fontSize: '24px', fontWeight: '800', color: COLORS.accent, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '50px' },
  brandIcon: { width: '35px', height: '35px', backgroundColor: COLORS.accent, color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nav: { flex: 1 },
  navLink: (active) => ({ padding: '14px 18px', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px', color: active ? COLORS.accent : COLORS.muted, backgroundColor: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent', fontWeight: active ? 'bold' : 'normal', transition: '0.2s', fontSize: '14px' }),
  userSection: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#000', borderRadius: '15px' },
  avatar: { width: '38px', height: '38px', backgroundColor: COLORS.gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' },
  card: { backgroundColor: COLORS.card, padding: '30px', borderRadius: '24px', border: `1px solid ${COLORS.border}` },
  chartArea: { height: '150px', display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '20px', borderBottom: `1px solid ${COLORS.border}` },
  bar: { flex: 1, backgroundColor: COLORS.accent, borderRadius: '4px 4px 0 0', opacity: 0.6 },
  alertMsg: { padding: '12px', backgroundColor: '#000', borderLeft: `4px solid ${COLORS.danger}`, borderRadius: '8px', fontSize: '12px', marginBottom: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { textAlign: 'left', padding: '15px', color: COLORS.muted, fontSize: '11px', borderBottom: `1px solid ${COLORS.border}` },
  td: { padding: '15px', borderBottom: `1px solid ${COLORS.border}`, fontSize: '13px' },
  deadline: { color: COLORS.danger, fontWeight: 'bold' },
  badge: { fontSize: '10px', padding: '4px 8px', backgroundColor: '#1e293b', borderRadius: '4px', color: COLORS.muted },
  input: { width: '100%', padding: '15px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: '#fff', marginBottom: '15px' },
  btnMain: { width: '100%', padding: '18px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnSmall: { padding: '10px 20px', backgroundColor: COLORS.accent, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnExport: { padding: '10px 20px', backgroundColor: 'transparent', color: COLORS.accent, border: `1px solid ${COLORS.accent}`, borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  textarea: { width: '100%', height: '120px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, borderRadius: '15px', color: '#fff', padding: '20px', fontSize: '14px', outline: 'none' },
  iaResult: { marginTop: '20px', padding: '20px', backgroundColor: '#020617', border: `1px dashed ${COLORS.accent}`, borderRadius: '15px', color: COLORS.accent, whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6' }
};