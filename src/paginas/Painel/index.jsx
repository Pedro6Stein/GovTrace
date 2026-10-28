import { Suspense, lazy, useEffect, useRef, useState } from 'react';

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
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';

import Cabecalho from '../../componentes/Cabecalho';
import ContornoErro from '../../componentes/ContornoErro';
import Rodape from '../../componentes/Rodape';
import SeletorPeriodo from '../../componentes/SeletorPeriodo';
import CarregamentoGovTrace from '../../componentes/CarregamentoGovTrace';

// Aba 1 — "A Cidade"
import HeroCidade from '../../componentes/abaCidade/HeroCidade';
import GraficoDestino from '../../componentes/abaCidade/GraficoDestino';
import CartaoConcentracao from '../../componentes/abaCidade/CartaoConcentracao';

// Aba 2 — "Exploração"
import RankingFornecedores from '../../componentes/abaExploracao/RankingFornecedores';

// Aba 4 — "Base de Lançamentos"
import TabelaLancamentos from '../../componentes/abaLancamentos/TabelaLancamentos';

// Aba 5 — "Comparação"
import ComparacaoMunicipios from '../../componentes/abaComparacao/ComparacaoMunicipios';

import { buscarAnalise } from '../../servicos/apiGovtrace';
import { formatarPeriodo } from '../../utilitarios/formatadores';

// Aba 3 — "Laboratório Matemático" (lazy: as cenas animadas trazem o
// Framer Motion, que não precisa pesar o carregamento inicial do site)
const PainelLaboratorio = lazy(() => import('../../componentes/abaLaboratorio/PainelLaboratorio'));

// ─── Definição das 5 abas ────────────────────────────────────────────────────
// rotuloCurto: usado no celular. Com 5 abas, a barra passou a ser sempre
// "scrollable" (ver Tabs abaixo) — em fullWidth, 5 rótulos ficariam cramados.
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
    id: 'laboratorio',
    rotulo: 'Laboratório Matemático',
    rotuloCurto: 'Laboratório',
    icone: ScienceRoundedIcon,
    descricao: 'Cenas animadas sobre os padrões estatísticos do período',
  },
  {
    id: 'lancamentos',
    rotulo: 'Base de Lançamentos',
    rotuloCurto: 'Lançamentos',
    icone: ReceiptLongRoundedIcon,
    descricao: 'Registros oficiais do TCE-SP, um a um',
  },
  {
    id: 'comparacao',
    rotulo: 'Comparação',
    rotuloCurto: 'Comparar',
    icone: CompareArrowsRoundedIcon,
    descricao: 'Compare dois municípios lado a lado',
  },
];

const INDICE_LANCAMENTOS = ABAS.findIndex((aba) => aba.id === 'lancamentos');

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
  const refAbas = useRef(null);

  // Empenho em foco: os registros de um fornecedor (Exploração) ou a própria
  // Base de Lançamentos pedem, e a Base abre já filtrada por esse número
  const [empenhoEmFoco, setEmpenhoEmFoco] = useState(null);

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
      setEmpenhoEmFoco(null);

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

  const localizarEmpenho = (documento) => {
    setEmpenhoEmFoco(documento);
    setAbaAtiva(INDICE_LANCAMENTOS);
    const movimentoReduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    refAbas.current?.scrollIntoView({ behavior: movimentoReduzido ? 'auto' : 'smooth', block: 'start' });
  };

  const trocarAba = (_, novaAba) => {
    setAbaAtiva(novaAba);
    setEmpenhoEmFoco(null);
  };

  // ─── Props compartilhadas entre as abas ────────────────────────────────────
  const propsAbas = {
    dadosBrutos,
    totais,
    distribuicao,
    ranking,
    insights,
    filtros,
    empenhoEmFoco,
    aoLocalizarEmpenho: localizarEmpenho,
    aoLimparEmpenho: () => setEmpenhoEmFoco(null),
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
        <CarregamentoGovTrace
          titulo={`Consultando os dados oficiais de ${filtros.municipio}. Isso pode levar alguns segundos.`}
        />
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
        {/* Barra de abas: scrollable em qualquer largura — com 5 abas,
            fullWidth deixaria os rótulos cramados no celular. As setas de
            rolagem só aparecem quando a barra realmente não cabe. */}
        <Paper
          ref={refAbas}
          elevation={0}
          // scrollMarginTop: o cabeçalho é sticky e cobriria a barra de abas
          sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: { xs: 2.5, sm: 3 }, overflow: 'hidden', scrollMarginTop: { xs: 72, sm: 88 } }}
        >
          <Tabs
            value={abaAtiva}
            onChange={trocarAba}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
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

function CarregandoLaboratorio() {
  return <CarregamentoGovTrace compacto titulo="Preparando o Laboratório Matemático" etapas={[]} />;
}

// ─── Componente auxiliar: conteúdo de cada aba ───────────────────────────────
function ConteudoAba({ id, props }) {
  switch (id) {
    case 'cidade':
      return (
        <Stack spacing={{ xs: 2.5, sm: 3 }}>
          {/* Painel de abertura: total do mês e números de apoio */}
          <HeroCidade
            totais={props.totais}
            concentracao={props.insights?.concentracao}
            filtros={props.filtros}
          />
          {/* Distribuição por área social */}
          <GraficoDestino distribuicao={props.distribuicao} />
          {/* Concentração nos 5 maiores (CR5) */}
          {props.insights?.concentracao && <CartaoConcentracao concentracao={props.insights.concentracao} />}
        </Stack>
      );

    case 'exploracao':
      return (
        <RankingFornecedores
          ranking={props.ranking}
          dadosBrutos={props.dadosBrutos}
          totais={props.totais}
          aoLocalizarEmpenho={props.aoLocalizarEmpenho}
        />
      );

    case 'laboratorio':
      return (
        <ContornoErro mensagem="Não foi possível abrir o Laboratório Matemático. Verifique sua conexão.">
          <Suspense fallback={<CarregandoLaboratorio />}>
            <PainelLaboratorio
              insights={props.insights}
              despesas={props.dadosBrutos}
              ranking={props.ranking}
              totais={props.totais}
              distribuicao={props.distribuicao}
              filtros={props.filtros}
            />
          </Suspense>
        </ContornoErro>
      );

    case 'lancamentos':
      return (
        <TabelaLancamentos
          despesas={props.dadosBrutos}
          empenhoEmFoco={props.empenhoEmFoco}
          aoLocalizarEmpenho={props.aoLocalizarEmpenho}
          aoLimparEmpenho={props.aoLimparEmpenho}
        />
      );

    case 'comparacao':
      return (
        <ComparacaoMunicipios
          filtros={props.filtros}
          // Repassa os dados já carregados desta cidade (se houver) para a
          // Cidade A não refazer a mesma consulta ao TCE-SP.
          dadosAtuais={
            props.dadosBrutos?.length
              ? { totais: props.totais, distribuicao: props.distribuicao, insights: props.insights }
              : null
          }
        />
      );

    default:
      return null;
  }
}
