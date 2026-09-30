import { useId, useState } from 'react';

import { Box, Button, Collapse } from '@mui/material';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

/**
 * ExplicacaoCidada — Camada didática sob demanda (Divulgação Progressiva)
 *
 * O dado numérico é o protagonista do card; a explicação em linguagem cidadã
 * fica recolhida e só aparece quando o usuário pede. Centraliza o padrão
 * "botão + Collapse" para que todos os cards se comportem da mesma forma.
 *
 * Props:
 *   rotulo     texto do botão quando recolhido (padrão: 'Entenda este dado')
 *   children   conteúdo explicativo revelado ao expandir
 */
export default function ExplicacaoCidada({ rotulo = 'Entenda este dado', children }) {
  const [aberto, setAberto] = useState(false);
  const idConteudo = useId();

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        size="small"
        variant="text"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={idConteudo}
        startIcon={<HelpOutlineRoundedIcon sx={{ fontSize: '1rem !important' }} />}
        endIcon={
          <ExpandMoreRoundedIcon
            sx={{
              transition: 'transform 0.25s ease',
              transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        }
        sx={{
          minHeight: 32,
          px: 1,
          ml: -1,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'text.secondary',
          '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
        }}
      >
        {aberto ? 'Ocultar explicação' : rotulo}
      </Button>

      <Collapse in={aberto} timeout={280} unmountOnExit>
        <Box
          id={idConteudo}
          sx={{
            mt: 1,
            p: 2,
            borderRadius: 1.5,
            bgcolor: '#F8FAFC',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
