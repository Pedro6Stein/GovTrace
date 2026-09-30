import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Container,
  Fade,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import PlagiarismRoundedIcon from '@mui/icons-material/PlagiarismRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import Cabecalho from '../../componentes/Cabecalho';
import Rodape from '../../componentes/Rodape';
import SeletorPeriodo from '../../componentes/SeletorPeriodo';
import SkeletonPainel from '../../componentes/SkeletonPainel';

// Aba 1 — "A Cidade"
import HeroCidade from '../../componentes/abaCidade/HeroCidade';
import GraficoDestino from '../../componentes/abaCidade/GraficoDestino';

// Aba 2 — "Exploração"
import RankingFornecedores from '../../componentes/abaExploracao/RankingFornecedores';

// Aba 3 — "Auditoria Algorítmica"
import PainelAuditoria from '../../componentes/abaAuditoria/PainelAuditoria';

// Aba 4 — "Evidências"
import TabelaEvidenciasAvancada from '../../componentes/abaEvidencias/TabelaEvidenciasAvancada';

import { buscarAnalise } from '../../servicos/apiGovtrace';
import { formatarPeriodo } from '../../utilitarios/formatadores';

// ─── Definição das 4 abas ────────────────────────────────────────────────────
// rotuloCurto: usado no celular, onde as 4 abas precisam caber lado a lado
const ABAS = [
  {
    id: 'cidade',
    rotulo: 'A Cidade',
    rotuloCurto: 'Cidade',
    icone: AccountBalanceRoundedIcon,
    descricao: 'Visão macro dos gastos municipais',
  },
  {
    id: 'exploracao',
    rotulo: 'Exploração',
    rotuloCurto: 'Explorar',
    icone: ManageSearchRoundedIcon,
    descricao: 'Fornecedores e destinatários dos recursos',
  },
  {
    id: 'auditoria',
    rotulo: 'Auditoria Algorítmica',
    rotuloCurto: 'Auditoria',
    icone: QueryStatsRoundedIcon,
    descricao: 'Motores de análise estatística',
  },
  {
    id: 'evidencias',
    rotulo: 'Evidências',
    rotuloCurto: 'Evidências',
    icone: PlagiarismRoundedIcon,
    descricao: 'Registros brutos para rastreabilidade',
  },
];

// Superfície dos estados vazios/erro — raio explícito em px: no sx do MUI,
// "borderRadius: 4" vira 4 × 16px = 64px (efeito "pílula" exagerado)
const estiloEstado = {
  textAlign: 'center',
  py: { xs: 6, sm: 10 },
  px: { xs: 2.5, sm: 4 },
  borderRadius: '20px',
};

// ─── Estado inicial dos filtros — SEMPRE dinâmico, NUNCA hardcoded ───────────
// O SeletorPeriodo carrega as cidades do IBGE e o usuário escolhe.
// Valores iniciais vazios forçam a seleção explícita antes de qualquer fetch.
const FILTROS_INICIAIS = {
  municipio: '',
  ano: new Date().getFullYear().toString(),
  mes: (new Date().getMonth() + 1).toString(),
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Painel() {
  const tema = useTheme();
  const ehCelular = useMediaQuery(tema.breakpoints.down('sm'));

  // Estado de navegação entre abas
  const [abaAtiva, setAbaAtiva] = useState(0);

  // Estado de ciclo de vida da requisição (erro guarda a mensagem real da API)
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Dados recebidos prontos da GovTrace API (nenhum cálculo no front)
  const [dadosBrutos, setDadosBrutos] = useState([]);
  const [totais, setTotais] = useState({ valorTotal: 0, totalRegistros: 0 });
  const [distribuicao, setDistribuicao] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [insights, setInsights] = useState(null);

  // Filtros dinâmicos — municipio é vazio no início (sem hardcode)
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);

  // ─── Efeito: re-executa toda vez que os filtros mudam ──────────────────────
  useEffect(() => {
    // Não busca se o município ainda não foi selecionado
    if (!filtros.municipio) return;

    // Cancela a requisição anterior se o usuário trocar o filtro no meio
    // do carregamento — evita que uma resposta antiga sobrescreva a nova.
    const controlador = new AbortController();

    const carregarDados = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const analise = await buscarAnalise(filtros.municipio, filtros.ano, filtros.mes, {
          signal: controlador.signal,
        });

        setDadosBrutos(analise.despesas);
        setTotais(analise.totais);
        setDistribuicao(analise.distribuicao);
        setRanking(analise.ranking);
        setInsights(analise.insights);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[GovTrace] Falha ao consultar a GovTrace API:', err);
        setErro(err.message || 'Não foi possível consultar os dados.');
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    };

    carregarDados();
    return () => controlador.abort();
  }, [filtros]);

  // ─── Props compartilhadas entre as abas ────────────────────────────────────
  const propsAbas = {
    dadosBrutos,
    totais,
    distribuicao,
    ranking,
    insights,
    filtros,
  };

  // Refaz a consulta com os mesmos filtros (novo objeto dispara o useEffect)
  const tentarNovamente = () => setFiltros((atual) => ({ ...atual }));

  // ─── Renderização condicional do conteúdo ─────────────────────────────────
  const renderConteudo = () => {
    if (!filtros.municipio) {
      return (
        <Paper
          elevation={0}
          sx={{ ...estiloEstado, border: '2px dashed', borderColor: '#CBD5E1', bgcolor: 'background.paper' }}
        >
          <AccountBalanceRoundedIcon aria-hidden sx={{ fontSize: 56, color: 'primary.main', opacity: 0.5, mb: 2 }} />
          <Typography component="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Selecione um município para começar
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'text.secondary', maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
            Escolha a cidade, o ano e o mês acima para ver como o dinheiro público foi usado,
            com dados oficiais do Tribunal de Contas do Estado de São Paulo.
          </Typography>
        </Paper>
      );
    }

    if (carregando) {
      return (
        <Box role="status" aria-live="polite" sx={{ py: 1 }}>
          <Typography sx={{ mb: 2, color: 'text.secondary', fontSize: '1rem' }}>
            Consultando os dados oficiais de <strong>{filtros.municipio}</strong>… isso pode levar alguns segundos.
          </Typography>
          <SkeletonPainel />
        </Box>
      );
    }

    if (erro) {
      return (
        <Paper
          role="alert"
          elevation={0}
          sx={{ ...estiloEstado, border: '1px solid', borderColor: '#FCA5A5', bgcolor: '#FEF2F2' }}
        >
          <CloudOffRoundedIcon aria-hidden sx={{ fontSize: 48, color: 'error.main', mb: 1.5 }} />
          <Typography component="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: 'error.main', mb: 1 }}>
            Não foi possível consultar os dados
          </Typography>
          {/* Mensagem real devolvida pela GovTrace API (ex: "O TCE-SP não respondeu em 30 segundos") */}
          <Typography sx={{ fontSize: '1rem', color: 'text.primary', maxWidth: 480, mx: 'auto', lineHeight: 1.6 }}>
            {erro}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            onClick={tentarNovamente}
            sx={{ mt: 3, px: 3 }}
          >
            Tentar novamente
          </Button>
        </Paper>
      );
    }

    if (!dadosBrutos.length) {
      return (
        <Paper elevation={1} sx={estiloEstado}>
          <Typography component="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Sem registros oficiais neste período
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'text.secondary', maxWidth: 480, mx: 'auto', lineHeight: 1.6 }}>
            O Tribunal de Contas (TCE-SP) ainda não publicou empenhos de{' '}
            <strong>{filtros.municipio}</strong> para{' '}
            <strong>{formatarPeriodo(filtros.mes, filtros.ano)}</strong>.
            Isso é comum em meses muito recentes. Tente um mês anterior.
          </Typography>
        </Paper>
      );
    }

    // ── Painel com abas ──────────────────────────────────────────────────────
    return (
      <Box>
        {/* Barra de abas: no celular, 4 abas visíveis lado a lado (sem setas
            escondendo opções); do tablet em diante, ícone + rótulo completo */}
        <Paper
          elevation={0}
          sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: { xs: 2.5, sm: 3 }, overflow: 'hidden' }}
        >
          <Tabs
            value={abaAtiva}
            onChange={(_, novaAba) => setAbaAtiva(novaAba)}
            variant={ehCelular ? 'fullWidth' : 'scrollable'}
            scrollButtons={ehCelular ? false : 'auto'}
            textColor="primary"
            indicatorColor="primary"
            aria-label="Seções da análise"
            sx={{ bgcolor: 'background.paper', px: { xs: 0, sm: 2 } }}
          >
            {ABAS.map((aba) => {
              const Icone = aba.icone;
              return (
                <Tab
                  key={aba.id}
                  id={`aba-${aba.id}`}
                  aria-controls={`painel-${aba.id}`}
                  icon={<Icone fontSize="small" />}
                  iconPosition={ehCelular ? 'top' : 'start'}
                  label={ehCelular ? aba.rotuloCurto : aba.rotulo}
                  sx={
                    ehCelular
                      ? { minWidth: 0, minHeight: 64, px: 0.5, fontSize: '0.8125rem', gap: 0.5, '& .MuiTab-iconWrapper': { mb: 0 } }
                      : { minHeight: 56, gap: 1 }
                  }
                />
              );
            })}
          </Tabs>
        </Paper>

        {/* Painéis de conteúdo de cada aba */}
        {ABAS.map((aba, idx) => (
          <PainelAba
            key={aba.id}
            id={`painel-${aba.id}`}
            aria-labelledby={`aba-${aba.id}`}
            ativo={abaAtiva === idx}
          >
            <ConteudoAba id={aba.id} props={propsAbas} />
          </PainelAba>
        ))}
      </Box>
    );
  };

  // ─── Layout raiz ──────────────────────────────────────────────────────────
  // Sem "width: 100vw" nem "overflowX: hidden": 100vw inclui a barra de
  // rolagem (gera scroll horizontal no Windows) e o overflow hidden apenas
  // ESCONDIA os vazamentos — além de quebrar o position:sticky do cabeçalho.
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Atalho de teclado para pular o cabeçalho (WCAG 2.4.1) */}
      <Box
        component="a"
        href="#conteudo"
        sx={{
          position: 'absolute',
          left: 16,
          top: -100,
          zIndex: 2000,
          px: 2,
          py: 1.5,
          borderRadius: '10px',
          bgcolor: 'primary.main',
          color: '#FFFFFF',
          fontWeight: 600,
          textDecoration: 'none',
          '&:focus': { top: 16 },
        }}
      >
        Pular para o conteúdo
      </Box>

      <Cabecalho />

      <Container
        maxWidth="lg"
        component="main"
        id="conteudo"
        tabIndex={-1}
        sx={{ flexGrow: 1, py: { xs: 2.5, sm: 4 }, '&:focus': { outline: 'none' } }}
      >
        <SeletorPeriodo filtros={filtros} onFiltroChange={setFiltros} />

        {renderConteudo()}
      </Container>

      <Rodape />
    </Box>
  );
}

// ─── Componente auxiliar: wrapper de painel de aba com Fade ──────────────────
function PainelAba({ children, ativo, id, 'aria-labelledby': labelledBy }) {
  return (
    <Box
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      hidden={!ativo}
    >
      {ativo && (
        <Fade in={ativo} timeout={300}>
          <Box>{children}</Box>
        </Fade>
      )}
    </Box>
  );
}

// ─── Componente auxiliar: conteúdo de cada aba ───────────────────────────────
function ConteudoAba({ id, props }) {
  switch (id) {
    case 'cidade':
      return (
        <Stack spacing={{ xs: 2.5, sm: 3 }}>
          {/* Indicadores macro + concentração de mercado */}
          <HeroCidade
            totais={props.totais}
            concentracao={props.insights?.concentracao}
            filtros={props.filtros}
          />
          {/* Distribuição por área social */}
          <GraficoDestino distribuicao={props.distribuicao} />
        </Stack>
      );

    case 'exploracao':
      return (
        <RankingFornecedores
          ranking={props.ranking}
          dadosBrutos={props.dadosBrutos}
          totais={props.totais}
        />
      );

    case 'auditoria':
      return <PainelAuditoria insights={props.insights} />;

    case 'evidencias':
      return <TabelaEvidenciasAvancada despesas={props.dadosBrutos} />;

    default:
      return null;
  }
}
