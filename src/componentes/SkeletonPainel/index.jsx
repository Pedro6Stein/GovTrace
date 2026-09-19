import { Grid, Card, CardContent, Box, Skeleton, Stack, Paper } from '@mui/material';

export default function SkeletonPainel() {
  return (
    <Box sx={{ width: '100%', animation: 'fade-in 0.5s ease-in-out' }}>
      {/* Esqueleto do Resumo Macro */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2].map((item) => (
          <Grid item xs={12} md={6} key={item}>
            <Card sx={{ borderRadius: 4, boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.02)', border: '1px solid #F1F5F9' }}>
              <CardContent sx={{ p: 4 }}>
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="60%" height={60} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Esqueleto da Distribuição de Investimentos */}
      <Card sx={{ mb: 4, borderRadius: 4, border: '1px solid #F1F5F9' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
          <Stack spacing={3}>
            {[1, 2, 3].map((item) => (
              <Box key={item}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="15%" />
                </Box>
                <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Esqueleto da Auditoria e Alertas */}
      <Box sx={{ mb: 6 }}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 4 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      </Box>
      
      {/* Esqueleto da Tabela de Evidências */}
      <Paper sx={{ width: '100%', p: 3, borderRadius: 4, border: '1px solid #F1F5F9', boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)' }}>
        <Skeleton variant="rectangular" width="30%" height={32} sx={{ mb: 3, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} variant="text" height={40} sx={{ mb: 1 }} />
        ))}
      </Paper>
    </Box>
  );
}