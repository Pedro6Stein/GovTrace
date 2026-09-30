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
        startIcon={<HelpOutlineRoundedIcon sx={{ fontSize: '1.125rem !important' }} />}
        endIcon={
          <ExpandMoreRoundedIcon
            sx={{
              transition: 'transform 0.25s ease',
              transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        }
        sx={{
          minHeight: 44, // Área de toque confortável (WCAG 2.5.8 pede ≥ 24px; 44px é o padrão iOS/Android)
          px: 1.25,
          ml: -1.25,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'primary.main',
          '&:hover': { bgcolor: 'rgba(162, 0, 0, 0.06)' },
        }}
      >
        {aberto ? 'Ocultar explicação' : rotulo}
      </Button>

      {/* Sem unmountOnExit: o alvo do aria-controls precisa existir sempre.
          Fechado, o Collapse aplica visibility:hidden — leitores de tela ignoram. */}
      <Collapse in={aberto} timeout={280}>
        <Box
          id={idConteudo}
          sx={{
            mt: 0.5,
            p: 2,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
