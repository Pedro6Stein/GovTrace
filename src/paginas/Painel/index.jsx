import { useEffect, useState } from 'react';

import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import Cabecalho from '../../componentes/Cabecalho';
import Rodape from '../../componentes/Rodape';
import SeletorPeriodo from '../../componentes/SeletorPeriodo';
import ResumoMacro from '../../componentes/ResumoMacro';
import DistribuicaoInvestimentos from '../../componentes/DistribuicaoInvestimentos';
import PainelAlertas from '../../componentes/PainelAlertas';
import TabelaEvidencias from '../../componentes/TabelaEvidencias';
import SkeletonPainel from '../../componentes/SkeletonPainel';

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

import { textos } from '../../textos/textos';

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
    insightEducativo:
      'Poucos registros para análise de dígito natural.',
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

export default function Painel() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [dadosBrutos, setDadosBrutos] = useState([]);
  const [totais, setTotais] = useState({
    valorTotal: 0,
    totalRegistros: 0,
  });
  const [distribuicao, setDistribuicao] = useState([]);
  const [insights, setInsights] = useState(null);

  const [filtros, setFiltros] = useState({
    municipio: 'Bragança Paulista',
    ano: '2026',
    mes: '1',
  });

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      setErro(false);

      try {
        const dados = await buscarDespesas(
          filtros.municipio,
          filtros.ano,
          filtros.mes
        );

        setDadosBrutos(dados);

        if (!dados?.length) {
          setTotais({
            valorTotal: 0,
            totalRegistros: 0,
          });

          setDistribuicao([]);
          setInsights(null);

          return;
        }

        const calculoTotais = calcularTotaisGerais(dados);
        const novaDistribuicao = calcularDistribuicaoPorCategoria(dados);
        const ranking = gerarRankingFornecedores(dados);

        const novosInsights = {
          concentracao:
            gerarInsightConcentracao(
              ranking,
              calculoTotais.valorTotal
            ) || INSIGHTS_PADRAO.concentracao,

          zScore:
            detectarOutliersZScore(dados) ||
            INSIGHTS_PADRAO.zScore,

          benford:
            analisarLeiBenford(dados) ||
            INSIGHTS_PADRAO.benford,

          fracionamento:
            detectarFracionamento(dados) ||
            INSIGHTS_PADRAO.fracionamento,

          monopolio:
            detectarMonopolioPorOrgao(dados) ||
            INSIGHTS_PADRAO.monopolio,
        };

        setTotais(calculoTotais);
        setDistribuicao(novaDistribuicao);
        setInsights(novosInsights);
      } catch (err) {
        console.error('Falha ao buscar dados:', err);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [filtros]);

  const renderConteudo = () => {
    if (carregando) {
      return (
        <Box sx={{ py: 4 }}>
          <SkeletonPainel />
        </Box>
      );
    }

    if (erro) {
      return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography color="error">
            {textos.comum.erroGeral}
          </Typography>
        </Box>
      );
    }

    if (!dadosBrutos.length) {
      return (
        <Paper
          sx={{
            textAlign: 'center',
            py: 10,
            px: 4,
            borderRadius: 4,
            boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography
            variant="h5"
            color="text.secondary"
            gutterBottom
          >
            Sem Registros Oficiais
          </Typography>

          <Typography color="text.secondary">
            O Tribunal de Contas (TCE-SP) ainda não disponibilizou
            notas fiscais ou empenhos para{' '}
            <strong>{filtros.municipio}</strong> no mês de{' '}
            <strong>
              {filtros.mes}/{filtros.ano}
            </strong>
            . Isso é comum em meses muito recentes ou em
            fechamento de balanço.
          </Typography>
        </Paper>
      );
    }

    return (
      <Stack spacing={0}>
        <ResumoMacro totais={totais} />

        <DistribuicaoInvestimentos
          distribuicao={distribuicao}
        />

        <PainelAlertas insights={insights} />

        <TabelaEvidencias despesas={dadosBrutos} />
      </Stack>
    );
  };

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
        sx={{ flexGrow: 1 }}
      >
        <SeletorPeriodo
          filtros={filtros}
          onFiltroChange={setFiltros}
        />

        {renderConteudo()}
      </Container>

      <Rodape />
    </Box>
  );
}