import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import Cabecalho from '../../componentes/Cabecalho';
import Rodape from '../../componentes/Rodape';
import { buscarDespesas } from '../../servicos/apiTce';
import { calcularTotaisGerais } from '../../utilitarios/analise';

export default function Painel() {
  const [carregando, setCarregando] = useState(true);
  const [totais, setTotais] = useState({ valorTotal: 0, totalRegistros: 0 });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Busca fixa inicial para validarmos a estrutura (Bragança Paulista, Jan/2023)
        const dados = await buscarDespesas('Bragança Paulista', '2023', '1');
        const calculoTotais = calcularTotaisGerais(dados);
        setTotais(calculoTotais);
      } catch (erro) {
        console.error('Erro ao carregar dashboard', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Cabecalho />
      
      <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
        {carregando ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
            <CircularProgress color="primary" />
            <Typography color="text.secondary">Processando dados do TCE-SP...</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h2" gutterBottom>
              Resumo Financeiro — Janeiro/2023
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Valor Total Movimentado
                    </Typography>
                    <Typography variant="valor" sx={{ fontSize: '2rem', color: 'primary.main' }}>
                      R$ {totais.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Registros Processados
                    </Typography>
                    <Typography variant="valor" sx={{ fontSize: '2rem' }}>
                      {totais.totalRegistros}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* O bloco "O que chama atenção?" entrará aqui na próxima etapa */}
          </>
        )}
      </Container>

      <Rodape />
    </Box>
  );
}