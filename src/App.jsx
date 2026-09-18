import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack
} from '@mui/material';

import { textos } from './textos/textos';
import { buscarDespesas } from './servicos/apiTce';

import {
  IconeNormal,
  IconeAtencao,
  IconeErro,
  IconeFiltro,
  IconePesquisa,
  IconeExportar,
  IconeInfo
} from './icones/icones';

// Utilitários de análise
import {
  calcularTotaisGerais,
  gerarRankingFornecedores,
  gerarInsightConcentracao
} from './utilitarios/analise';

// Normalização
import { normalizarDespesas } from './utilitarios/normalizacao';

// Análises avançadas
import {
  detectarOutliersZScore,
  analisarLeiBenford,
  detectarFracionamento,
  detectarMonopolioPorOrgao
} from './utilitarios/analiseAvancada';

function App() {
  // Função para testar o processamento completo dos dados
  const testarAnalise = async () => {
    try {
      // =========================================================
      // 1. BUSCA DOS DADOS
      // =========================================================

      const resposta = await fetch(
        'https://transparencia.tce.sp.gov.br/api/json/despesas/braganca-paulista/2023/1'
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível buscar os dados do TCE-SP.');
      }

      const dadosBrutos = await resposta.json();

      console.log('=== DADOS BRUTOS ===');
      console.log(dadosBrutos);

      // =========================================================
      // 2. NORMALIZAÇÃO
      // =========================================================

      const dadosLimpos = normalizarDespesas(dadosBrutos);

      console.log('=== DADOS NORMALIZADOS ===');
      console.log(dadosLimpos);

      // =========================================================
      // 3. MOTOR PRINCIPAL DE ANÁLISE
      // =========================================================

      const totais = calcularTotaisGerais(dadosLimpos);

      const ranking = gerarRankingFornecedores(dadosLimpos);

      const insight = gerarInsightConcentracao(
        ranking,
        totais.valorTotal
      );

      console.log('=== RELATÓRIO DO MOTOR GOVTRACE ===');

      console.log(
        'Total Gasto (Geral): R$',
        totais.valorTotal.toLocaleString('pt-BR')
      );

      console.log(
        'Quantidade de Fornecedores Privados:',
        ranking.length
      );

      console.log('Mensagem:', insight.mensagemPrincipal);

      console.log('💡 Insight:', insight.insightEducativo);

      // =========================================================
      // 4. ANÁLISES AVANÇADAS
      // =========================================================

      const zScore = detectarOutliersZScore(dadosLimpos);

      const benford = analisarLeiBenford(dadosLimpos);

      const fracionamento = detectarFracionamento(dadosLimpos);

      const monopolio = detectarMonopolioPorOrgao(dadosLimpos);

      // =========================================================
      // 5. RELATÓRIO DAS ANÁLISES AVANÇADAS
      // =========================================================

      console.log('=== AUDITORIA DE CIÊNCIA DE DADOS ===');

      console.log(
        zScore.titulo,
        '->',
        zScore.insightEducativo
      );

      console.log(
        benford.titulo,
        '->',
        benford.insightEducativo
      );

      console.log(
        fracionamento.titulo,
        '->',
        fracionamento.insightEducativo
      );

      console.log(
        monopolio.titulo,
        '->',
        monopolio.insightEducativo
      );

    } catch (erro) {
      console.error('Erro durante a análise dos dados:', erro);
    }
  };

  return (
    <Container maxWidth="lg">

      <Box sx={{ py: 4 }}>

        <Typography variant="h3" component="h1" gutterBottom>
          {textos.titulo}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          {textos.subtitulo}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Button
          variant="contained"
          onClick={testarAnalise}
        >
          Testar análise dos dados
        </Button>

      </Box>

    </Container>
  );
}

export default App;