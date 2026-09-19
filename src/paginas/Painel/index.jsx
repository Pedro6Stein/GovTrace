import { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Stack, Paper } from '@mui/material';
import Cabecalho from '../../componentes/Cabecalho';
import Rodape from '../../componentes/Rodape';
import SeletorPeriodo from '../../componentes/SeletorPeriodo';
import ResumoMacro from '../../componentes/ResumoMacro';
import DistribuicaoInvestimentos from '../../componentes/DistribuicaoInvestimentos';
import PainelAlertas from '../../componentes/PainelAlertas';
import { buscarDespesas } from '../../servicos/apiTce';
import TabelaEvidencias from '../../componentes/TabelaEvidencias'; 
import { 
  calcularTotaisGerais, 
  gerarRankingFornecedores, 
  gerarInsightConcentracao,
  calcularDistribuicaoPorCategoria
} from '../../utilitarios/analise';
import { 
  detectarOutliersZScore, 
  analisarLeiBenford, 
  detectarFracionamento, 
  detectarMonopolioPorOrgao 
} from '../../utilitarios/analiseAvancada';
import { textos } from '../../textos/textos';

export default function Painel() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [dadosBrutos, setDadosBrutos] = useState([]);
  const [totais, setTotais] = useState({ valorTotal: 0, totalRegistros: 0 });
  const [distribuicao, setDistribuicao] = useState([]);
  const [insights, setInsights] = useState(null);

  const [filtros, setFiltros] = useState({
    municipio: 'Bragança Paulista',
    ano: '2026',
    mes: '1'
  });

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      setErro(false);
      try {
        const dados = await buscarDespesas(filtros.municipio, filtros.ano, filtros.mes);
        setDadosBrutos(dados);
        
        if (dados && dados.length > 0) {
          const calculoTotais = calcularTotaisGerais(dados);
          setTotais(calculoTotais);
          setDistribuicao(calcularDistribuicaoPorCategoria(dados));

          const ranking = gerarRankingFornecedores(dados);
          
          // Motor Seguro: Se o cálculo retornar null (falta de dados), definimos valores de fallback
          setInsights({
            concentracao: gerarInsightConcentracao(ranking, calculoTotais.valorTotal) || { 
              alerta: false, mensagemPrincipal: "Aguardando dados estruturados", insightEducativo: "Quantidade insuficiente de notas para calcular concentração de mercado." 
            },
            zScore: detectarOutliersZScore(dados) || { alerta: false, titulo: "Gastos Fora do Padrão", insightEducativo: "Base de dados reduzida. Impossível calcular curva normal." },
            benford: analisarLeiBenford(dados) || { alerta: false, titulo: "Teste de Lei de Benford", insightEducativo: "Poucos registros para análise de dígito natural." },
            fracionamento: detectarFracionamento(dados) || { alerta: false, titulo: "Chuva de Valores", insightEducativo: "Sem anomalias repetitivas detectadas." },
            monopolio: detectarMonopolioPorOrgao(dados) || { alerta: false, titulo: "Monopólio Departamental", insightEducativo: "Não detectado." }
          });
        }
      } catch (err) {
        console.error('Falha ao buscar dados', err);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [filtros]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Cabecalho />
      
      <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
        <SeletorPeriodo filtros={filtros} onFiltroChange={setFiltros} />

        {carregando ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2 }} color="text.secondary">{textos.comum.carregando}</Typography>
          </Box>
        ) : erro ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography color="error">{textos.comum.erroGeral}</Typography>
          </Box>
        ) : dadosBrutos.length === 0 ? (
          // Interface limpa para estados sem dados (ex: Jan/2026)
          <Paper sx={{ textAlign: 'center', py: 10, borderRadius: 4, boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.02)' }}>
             <Typography variant="h5" color="text.secondary" gutterBottom>
               Sem Registros Oficiais
             </Typography>
            <Typography color="text.secondary">
               O Tribunal de Contas (TCE-SP) ainda não disponibilizou notas fiscais ou empenhos para <strong>{filtros.municipio}</strong> no mês de <strong>{filtros.mes}/{filtros.ano}</strong>. 
               Isso é comum em meses muito recentes ou em fechamento de balanço.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={0}>
            <ResumoMacro totais={totais} />
            <DistribuicaoInvestimentos distribuicao={distribuicao} />
            <PainelAlertas insights={insights} />
            <TabelaEvidencias despesas={dadosBrutos} />
          </Stack>
        )}
      </Container>
      <Rodape />
    </Box>
  );
}