import { Card, CardContent, Typography, Box, LinearProgress, Stack } from '@mui/material';

export default function DistribuicaoInvestimentos({ distribuicao }) {
  if (!distribuicao || distribuicao.length === 0) return null;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 3 }}>
          Para onde foi o dinheiro?
        </Typography>
        
        <Stack spacing={3}>
          {distribuicao.map((item, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {item.nome}
                </Typography>
                <Typography variant="valor" color="text.secondary">
                  R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({item.percentual}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(item.percentual)} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'divider',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: index === 0 ? 'primary.main' : 'secondary.main'
                  }
                }} 
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}