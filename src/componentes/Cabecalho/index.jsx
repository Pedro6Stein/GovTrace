import { Box, Typography, Container } from '@mui/material';

export default function Cabecalho() {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 2, mb: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
          GovTrace
        </Typography>
        <Typography variant="body2">
          Monitoramento Preventivo para Licitações Públicas
        </Typography>
      </Container>
    </Box>
  );
}