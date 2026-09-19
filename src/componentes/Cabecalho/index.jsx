import { useState } from 'react';
import { Box, Typography, Container, Button, Stack } from '@mui/material';
import ModalMetodologia from '../ModalMetodologia';
import { IconeInfo } from '../../icones/icones';

export default function Cabecalho() {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 2, mb: 4, boxShadow: '0px 2px 10px rgba(0,0,0,0.1)' }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                GovTrace
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Monitoramento Preventivo para Licitações Públicas
              </Typography>
            </Box>
            
            <Button 
              color="inherit" 
              variant="outlined" 
              startIcon={<IconeInfo />}
              onClick={() => setModalAberto(true)}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: '#FFF' }, display: { xs: 'none', sm: 'flex' } }}
            >
              Metodologia
            </Button>
          </Stack>
        </Container>
      </Box>

      <ModalMetodologia aberto={modalAberto} aoFechar={() => setModalAberto(false)} />
    </>
  );
}