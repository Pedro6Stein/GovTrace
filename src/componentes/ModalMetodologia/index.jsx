import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider } from '@mui/material';
import { IconeInfo } from '../../icones/icones';

// Mesma ordem e mesmo vocabulário das cenas do Laboratório Matemático
const SECOES = [
  {
    titulo: '1. Curva Z-Score: pontos de alta amplitude',
    texto:
      'Calcula a média e o desvio padrão de todos os empenhos válidos do período (pagamentos de pessoal e repasses entre órgãos públicos ficam de fora). Cada valor recebe um Z, que diz quantos desvios padrão ele está acima da média. Empenhos com Z maior que 4 são destacados como pontos de alta amplitude. Valores grandes costumam vir de obras, repasses ou contratos anuais.',
  },
  {
    titulo: '2. Recorrência de lançamentos',
    texto:
      'Agrupa os empenhos acima de R$ 500 por credor e por valor exato. Quando o mesmo valor aparece em 5 empenhos ou mais no período, o grupo é destacado. Repetições são comuns em serviços mensais, aluguéis e parcelas.',
  },
  {
    titulo: '3. Concentração setorial',
    texto:
      'Para cada área com mais de R$ 50 mil em empenhos no período, calcula a fatia de cada credor. Quando um único credor fica com 50% ou mais do valor da área, a área é destacada. Isso pode acontecer quando poucos prestadores atendem um serviço específico.',
  },
  {
    titulo: '4. Índice CR5: participação dos 5 maiores credores',
    texto:
      'Soma o que os 5 maiores credores receberam em pagamentos e divide pelo total pago no período. Acima de 30%, a participação é destacada como elevada.',
  },
  {
    titulo: '5. Lei de Newcomb-Benford: primeiros dígitos',
    texto:
      'Em conjuntos grandes de valores financeiros reais, o dígito 1 aparece como primeiro número em cerca de 30% dos casos, e a frequência diminui até o 9 (cerca de 4,6%). A cena compara essa proporção esperada com a do município. Diferenças acima de 5 pontos percentuais em um dígito são destacadas; com menos de 100 lançamentos, a comparação não é feita.',
  },
];

export default function ModalMetodologia({ aberto, aoFechar }) {
  return (
    <Dialog open={aberto} onClose={aoFechar} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <IconeInfo color="primary" />
        Metodologia do Laboratório Matemático
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="body1" paragraph>
          O <strong>GovTrace</strong> aplica cinco métodos estatísticos conhecidos aos lançamentos
          oficiais publicados pelo TCE-SP. Os métodos descrevem como os números se comportam; eles não
          fazem juízo de valor sobre pessoas, empresas ou sobre a gestão. Um destaque estatístico é um
          ponto de partida para consulta, e a interpretação final cabe aos órgãos de controle.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Na tela do Laboratório, os credores aparecem com uma identidade anônima. O destaque é sempre o
          número do empenho, que pode ser conferido na Base de Lançamentos ou no portal do TCE-SP.
        </Typography>
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Por que as etapas não são somadas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            O TCE-SP publica uma linha para cada etapa de um mesmo empenho: quando o dinheiro é
            reservado (empenho), quando o serviço é confirmado (liquidação) e quando o dinheiro sai do
            caixa (pagamento). Somar todas as linhas contaria o mesmo valor até três vezes. Por isso o
            GovTrace usa uma base para cada pergunta: o total do mês mostra cada etapa separada; o
            ranking de fornecedores, a divisão por área e o índice CR5 usam os valores <strong>pagos</strong>;
            e os métodos estatísticos contam <strong>cada empenho uma única vez</strong>.
          </Typography>
        </Box>

        {SECOES.map((secao, i) => (
          <Box key={secao.titulo}>
            {i > 0 && <Divider />}
            <Box sx={{ my: 3.5 }}>
              <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
                {secao.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {secao.texto}
              </Typography>
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={aoFechar} variant="contained" disableElevation>
          Entendi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
