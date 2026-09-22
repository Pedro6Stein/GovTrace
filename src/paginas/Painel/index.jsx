import { useEffect, useState } from 'react';

import {
  Box,
  Container,
  Fade,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';


import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import PlagiarismRoundedIcon from '@mui/icons-material/PlagiarismRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';

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

import { buscarDespesas } from '../../servicos/apiTce';

import {
  calcularTotaisGerais,
  calcularDistribuicaoPorCategoria,
  gerarRankingFornecedores,
  gerarInsightConcentracao,
} from '../../utilitarios/analise';

import {
  detectarOutliersZScore,
  analisarLeiBenford,
  detectarFracionamento,
  detectarMonopolioPorOrgao,
} from '../../utilitarios/analiseAvancada';

// ─── Defaults dos insights quando os dados são insuficientes ─────────────────
const INSIGHTS_PADRAO = {
  concentracao: {
    alerta: false,
    mensagemPrincipal: 'Aguardando dados estruturados',
    insightEducativo:
      'Quantidade insuficiente de notas para calcular concentração de mercado.',
  },
  zScore: {
    alerta: false,
    titulo: 'Gastos Fora do Padrão',
    insightEducativo:
      'Base de dados reduzida. Impossível calcular curva normal.',
  },
  benford: {
    alerta: false,
    titulo: 'Teste de Lei de Benford',
    insightEducativo: 'Poucos registros para análise de dígito natural.',
  },
  fracionamento: {
    alerta: false,
    titulo: 'Chuva de Valores',
    insightEducativo: 'Sem anomalias repetitivas detectadas.',
  },
  monopolio: {
    alerta: false,
    titulo: 'Monopólio Departamental',
    insightEducativo: 'Não detectado.',
  },
};

// ─── Definição das 4 abas ────────────────────────────────────────────────────
const ABAS = [
  {
    id: 'cidade',
    rotulo: 'A Cidade',
    icone: AccountBalanceRoundedIcon,
    descricao: 'Visão macro dos gastos municipais',
  },
  {
    id: 'exploracao',
    rotulo: 'Exploração',
    icone: ManageSearchRoundedIcon,
    descricao: 'Fornecedores e destinatários dos recursos',
  },
  {
    id: 'auditoria',
    rotulo: 'Auditoria Algorítmica',
    icone: QueryStatsRoundedIcon,
    descricao: 'Motores de análise estatística',
  },
  {
    id: 'evidencias',
    rotulo: 'Evidências',
    icone: PlagiarismRoundedIcon,
    descricao: 'Registros brutos para rastreabilidade',
  },
];

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
  // Estado de navegação entre abas
  const [abaAtiva, setAbaAtiva] = useState(0);

  // Estado de ciclo de vida da requisição
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  // Dados brutos e derivados (calculados pelos motores)
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

    const carregarDados = async () => {
      setCarregando(true);
      setErro(false);

      try {
        const dados = await buscarDespesas(
          filtros.municipio,
          filtros.ano,
          filtros.mes,
        );

        setDadosBrutos(dados);

        if (!dados?.length) {
          setTotais({ valorTotal: 0, totalRegistros: 0 });
          setDistribuicao([]);
          setRanking([]);
          setInsights(null);
          return;
        }

        // ── Motores de análise (preservados integralmente) ──────────────────
        const calculoTotais = calcularTotaisGerais(dados);
        const novaDistribuicao = calcularDistribuicaoPorCategoria(dados);
        const novoRanking = gerarRankingFornecedores(dados);

        const novosInsights = {
          concentracao:
            gerarInsightConcentracao(novoRanking, calculoTotais.valorTotal) ||
            INSIGHTS_PADRAO.concentracao,
          zScore:
            detectarOutliersZScore(dados) || INSIGHTS_PADRAO.zScore,
          benford:
            analisarLeiBenford(dados) || INSIGHTS_PADRAO.benford,
          fracionamento:
            detectarFracionamento(dados) || INSIGHTS_PADRAO.fracionamento,
          monopolio:
            detectarMonopolioPorOrgao(dados) || INSIGHTS_PADRAO.monopolio,
        };

        setTotais(calculoTotais);
        setDistribuicao(novaDistribuicao);
        setRanking(novoRanking);
        setInsights(novosInsights);
      } catch (err) {
        console.error('[GovTrace] Falha ao buscar dados do TCE-SP:', err);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
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

  // ─── Renderização condicional do conteúdo ─────────────────────────────────
  const renderConteudo = () => {
    if (!filtros.municipio) {
      return (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 12,
            px: 4,
            borderRadius: 4,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <AccountBalanceRoundedIcon
            sx={{ fontSize: 56, color: 'primary.main', opacity: 0.4, mb: 2 }}
          />
          <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
            Selecione um município para começar
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 420, mx: 'auto' }}>
            Escolha o município, o ano e o mês acima para carregar os dados
            oficiais do Tribunal de Contas do Estado de São Paulo.
          </Typography>
        </Paper>
      );
    }

    if (carregando) {
      return (
        <Box sx={{ py: 2 }}>
          <SkeletonPainel />
        </Box>
      );
    }

    if (erro) {
      return (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 10,
            px: 4,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: '#FEF2F2',
          }}
        >
          <Typography variant="h5" color="error.main" gutterBottom fontWeight={600}>
            Não foi possível consultar os dados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            O servidor do TCE-SP pode estar temporariamente indisponível.
            Verifique sua conexão e tente novamente em alguns instantes.
          </Typography>
        </Paper>
      );
    }

    if (!dadosBrutos.length) {
      return (
        <Paper
          elevation={1}
          sx={{
            textAlign: 'center',
            py: 10,
            px: 4,
            borderRadius: 4,
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
            Sem Registros Oficiais
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
            O Tribunal de Contas (TCE-SP) ainda não disponibilizou notas fiscais
            ou empenhos para{' '}
            <strong>{filtros.municipio}</strong> no período de{' '}
            <strong>
              {filtros.mes}/{filtros.ano}
            </strong>
            . Isso é comum em meses muito recentes ou em fechamento de balanço.
          </Typography>
        </Paper>
      );
    }

    // ── Painel com abas ──────────────────────────────────────────────────────
    return (
      <Box>
        {/* Barra de abas */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={abaAtiva}
            onChange={(_, novaAba) => setAbaAtiva(novaAba)}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            aria-label="Abas de navegação do GovTrace"
            sx={{
              bgcolor: 'background.paper',
              px: { xs: 1, sm: 2 },
            }}
          >
            {ABAS.map((aba, idx) => {
              const Icone = aba.icone;
              return (
                <Tab
                  key={aba.id}
                  id={`aba-${aba.id}`}
                  aria-controls={`painel-${aba.id}`}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Icone fontSize="small" />
                      <span>{aba.rotulo}</span>
                    </Stack>
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
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Cabecalho />

      <Container
        maxWidth="lg"
        component="main"
        sx={{ flexGrow: 1, py: { xs: 2, sm: 3 } }}
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

// ─── Componente auxiliar: conteúdo provisório por aba ────────────────────────
// ATENÇÃO: O interior de cada aba é provisório e será substituído
// nas etapas seguintes da refatoração. A estrutura de rotas e
// o fluxo de dados (propsAbas) já estão conectados e prontos.
function ConteudoAba({ id, props }) {
  const estiloPlaceholder = {
    p: 4,
    borderRadius: 3,
    border: '2px dashed',
    borderColor: 'primary.light',
    bgcolor: 'background.paper',
    textAlign: 'center',
    opacity: 0.7,
  };

  switch (id) {
    case 'cidade':
      return (
        <Stack spacing={3}>
          {/* Métricas macro + insight de concentração */}
          <HeroCidade
            totais={props.totais}
            concentracao={props.insights?.concentracao}
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