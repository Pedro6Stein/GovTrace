import { Box, Typography, Container, Link } from '@mui/material';
import { textos } from '../../textos/textos';

export default function Rodape() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', py: 4, mt: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" paragraph>
          {textos.acessibilidade.fonteDados}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Aviso de Transparência:</strong> O GovTrace é uma ferramenta acadêmica de interpretação estatística. 
          Os dados processados podem conter inconsistências, ruídos ou erros de transcrição herdados da base original. 
          Nenhuma análise substitui a auditoria oficial. Para conferência de empenhos e pagamentos, consulte sempre a fonte primária.
        </Typography>
        <Link 
          href="https://transparencia.tce.sp.gov.br/" 
          target="_blank" 
          rel="noopener noreferrer"
          color="secondary.main"
          underline="hover"
          fontWeight={500}
        >
          Acessar Portal da Transparência do TCE-SP
        </Link>
      </Container>
    </Box>
  );
}