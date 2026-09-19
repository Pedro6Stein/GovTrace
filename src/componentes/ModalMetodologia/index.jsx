import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider } from '@mui/material';
import { IconeInfo } from '../../icones/icones';

export default function ModalMetodologia({ aberto, aoFechar }) {
  return (
    <Dialog open={aberto} onClose={aoFechar} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <IconeInfo color="primary" />
        Metodologia de Auditoria Algorítmica
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="body1" paragraph>
          O <strong>GovTrace</strong> utiliza ciência de dados e algoritmos de complexidade linear O(n) para auditar despesas públicas. 
          O sistema não emite juízos de valor nem acusações de fraude; atua exclusivamente na identificação de anomalias matemáticas e desvios de padrão em relação à contabilidade natural.
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
            1. Lei de Benford (Newcomb-Benford)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Princípio matemático que demonstra que, em conjuntos de dados financeiros reais e orgânicos, o dígito "1" aparece como primeiro número em cerca de 30% das vezes, diminuindo logaritmicamente até ao "9" (4,6%). 
            O nosso motor analisa a frequência dos primeiros dígitos das notas fiscais. Desvios abruptos indicam forte probabilidade estatística de dados fabricados, tabelados ou intervenção humana não natural.
          </Typography>
        </Box>
        <Divider />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
            2. Z-Score (Desvio Padrão Forense)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Cálculo estatístico que mede a distância de um valor em relação à média do município. 
            O GovTrace isola a máquina pública e calcula a variância de todos os pagamentos privados. 
            Valores que ultrapassam 4 desvios padrões (Z {'>'} 4) são classificados como <em>outliers</em> extremos, merecendo auditoria manual detalhada por representarem anomalias de volume.
          </Typography>
        </Box>
        <Divider />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
            3. Fracionamento Temporal e Concentração (CR)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Utilizamos heurísticas de rastreio para identificar a injeção repetitiva de valores exatos para o mesmo CNPJ no mesmo período (indício de fuga ao limite de licitação). 
            Em paralelo, o motor de Concentração avalia o grau de dependência comercial do município em relação a um grupo restrito de fornecedores (semelhante ao Índice Herfindahl-Hirschman).
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={aoFechar} variant="contained" disableElevation>
          Compreendi a Metodologia
        </Button>
      </DialogActions>
    </Dialog>
  );
}