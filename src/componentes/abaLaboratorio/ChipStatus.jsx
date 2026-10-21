import { Chip } from '@mui/material';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

/**
 * Status de uma cena em linguagem neutra: "Destaque estatístico" diz só que
 * o número se comporta diferente da maioria — não é um veredito.
 * Texto + ícone, nunca só cor (WCAG 1.4.1).
 */
export default function ChipStatus({ destaque, sx }) {
  return (
    <Chip
      icon={destaque ? <InsightsRoundedIcon /> : <CheckCircleOutlineRoundedIcon />}
      label={destaque ? 'Destaque estatístico' : 'Dentro do esperado'}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.75rem',
        height: 26,
        color: destaque ? '#92400E' : '#166534',
        bgcolor: destaque ? '#FEF3C7' : '#DCFCE7',
        '& .MuiChip-icon': { color: 'inherit', fontSize: 16 },
        ...sx,
      }}
    />
  );
}
