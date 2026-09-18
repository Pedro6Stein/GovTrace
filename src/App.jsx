import { Container, Typography, Box, Button, Card, CardContent, Divider, Stack } from '@mui/material';
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

// Importe as funções no topo do App.jsx
import { calcularTotaisGerais, gerarRankingFornecedores, gerarInsightConcentracao } from './utilitarios/analise';
import { normalizarDespesas } from './utilitarios/normalizacao'; // Certifique-se de importar o normalizador

// E dentro do onClick do botão de teste:
const resposta = await fetch('https://transparencia.tce.sp.gov.br/api/json/despesas/braganca-paulista/2023/1');
const dadosBrutos = await resposta.json();

// 1. O Escudo (Normaliza)
const dadosLimpos = normalizarDespesas(dadosBrutos);

// 2. O Motor Matemático (Calcula)
const totais = calcularTotaisGerais(dadosLimpos);
const ranking = gerarRankingFornecedores(dadosLimpos);
const insight = gerarInsightConcentracao(ranking, totais.valorTotal);

console.log("=== RELATÓRIO DO MOTOR GOVTRACE ===");
console.log("Total Gasto (Geral): R$", totais.valorTotal.toLocaleString('pt-BR'));
console.log("Quantidade de Fornecedores Privados:", ranking.length);
console.log(insight.mensagemPrincipal);
console.log("💡 Insight:", insight.insightEducativo);


function App() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" color="primary" gutterBottom>
        Validação do Design System
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {textos.comum.carregando} (Tela temporária para validar o tema do GovTrace)
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h2" gutterBottom>Tipografia e Cores Base</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" color="primary">Cor Institucional (Primária) - #2C5E43</Typography>
          <Typography variant="body1" color="secondary">Cor de Destaque (Secundária) - #C98B22</Typography>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Teste da variante tabular-nums para tabelas:
            </Typography>
            <Typography variant="valor" color="text.primary" sx={{ fontSize: '1.5rem' }}>
              R$ 1.234.567,89
            </Typography>
            <Typography variant="valor" color="text.primary" sx={{ fontSize: '1.5rem' }}>
              R$ 1.111.111,11
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h2" gutterBottom>Botões (Área mínima de 44px)</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconePesquisa />}
              onClick={async () => {
                console.log('Buscando dados...');
                const dados = await buscarDespesas('Bragança Paulista', '2023', '1');
                console.log('Dados Normalizados:', dados);
              }}
            >
              {textos.botoes.pesquisar}
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<IconeExportar />}>
              {textos.botoes.exportar}
            </Button>
            <Button variant="text" color="primary" startIcon={<IconeFiltro />}>
              {textos.botoes.filtrar}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h2" gutterBottom>Regra de Status (Ícone + Cor + Texto)</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
              <IconeNormal />
              <Typography fontWeight={500}>{textos.status.normal}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
              <IconeAtencao />
              <Typography fontWeight={500}>{textos.status.atencao}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
              <IconeErro />
              <Typography fontWeight={500}>{textos.status.critico}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <IconeInfo />
              <Typography fontWeight={500}>Informação</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;