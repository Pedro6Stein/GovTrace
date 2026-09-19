import { Grid, Card, CardContent, Typography, Box } from '@mui/material';

export default function ResumoMacro({ totais }) {
  // Formatação segura
  const valorFormatado = totais?.valorTotal
    ? totais.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0,00';

  const qtdFormatada = totais?.totalRegistros
    ? totais.totalRegistros.toLocaleString('pt-BR')
    : '0';

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" gutterBottom>
              Total Movimentado
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h2" color="primary.main" fontWeight={700}>
                R$
              </Typography>
              <Typography variant="valor" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, color: 'primary.main', fontWeight: 700 }}>
                {valorFormatado}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" gutterBottom>
              Registros Analisados
            </Typography>
            <Typography variant="valor" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, color: 'text.primary', fontWeight: 700 }}>
              {qtdFormatada}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}