import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';

/**
 * ModalAcessibilidade — Declaração de acessibilidade do GovTrace
 *
 * Descreve o que foi feito, as limitações conhecidas (honestidade é parte da
 * acessibilidade) e como relatar barreiras. Tela cheia no celular.
 */

const RECURSOS = [
  ['Contraste', 'Textos com contraste mínimo de 4,5:1 e bordas de campos com 3:1 (WCAG 2.1 AA).'],
  ['Teclado', 'Use Tab para avançar entre os controles, Enter para abrir explicações e Esc para fechar janelas. O atalho "Pular para o conteúdo" aparece ao pressionar Tab no topo da página.'],
  ['Leitores de tela', 'Títulos hierárquicos, abas e explicações anunciam seu estado (aberto ou fechado). Valores abreviados são lidos por extenso.'],
  ['Toque', 'Botões e controles com área de toque de pelo menos 44 pixels.'],
  ['Zoom', 'O layout se adapta até 320 pixels de largura e a 200% de zoom, sem rolagem horizontal.'],
  ['Movimento', 'Se o seu sistema estiver configurado para reduzir animações, o GovTrace desliga as transições.'],
  ['Linguagem', 'Cada número tem uma explicação em linguagem simples no botão "Entenda este dado".'],
];

const LIMITACOES = [
  'A tabela da aba "Evidências" tem muitas colunas e pode exigir rolagem lateral em telas pequenas.',
  'A classificação das despesas por área é uma estimativa automática e pode divergir da classificação contábil oficial.',
];

export default function ModalAcessibilidade({ aberto, aoFechar }) {
  const tema = useTheme();
  const telaCheia = useMediaQuery(tema.breakpoints.down('sm'));

  return (
    <Dialog
      open={aberto}
      onClose={aoFechar}
      fullScreen={telaCheia}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      aria-labelledby="titulo-acessibilidade"
    >
      <DialogTitle
        id="titulo-acessibilidade"
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 700, fontSize: '1.25rem' }}
      >
        <AccessibilityNewRoundedIcon aria-hidden color="primary" />
        Acessibilidade
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Typography sx={{ fontSize: '1rem', lineHeight: 1.7, color: 'text.primary' }}>
          O GovTrace foi feito para que <strong>qualquer pessoa</strong>, incluindo idosos e pessoas
          com deficiência, consiga entender como o dinheiro público do seu município é usado.
          Nosso objetivo é atender às Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1),
          nível AA.
        </Typography>

        <Typography component="h3" sx={{ mt: 3, mb: 1.5, fontSize: '1.0625rem', fontWeight: 700 }}>
          O que já fizemos
        </Typography>
        <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1.5 }}>
          {RECURSOS.map(([titulo, texto]) => (
            <Box key={titulo}>
              <Typography component="dt" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{titulo}</Typography>
              <Typography component="dd" sx={{ m: 0, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.6 }}>
                {texto}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography component="h3" sx={{ mt: 3, mb: 1, fontSize: '1.0625rem', fontWeight: 700 }}>
          Limitações conhecidas
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary', '& li': { mb: 0.75, lineHeight: 1.6, fontSize: '0.9375rem' } }}>
          {LIMITACOES.map((l) => <li key={l}>{l}</li>)}
        </Box>

        <Typography component="h3" sx={{ mt: 3, mb: 1, fontSize: '1.0625rem', fontWeight: 700 }}>
          Encontrou uma barreira?
        </Typography>
        <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.6 }}>
          Conte para a equipe abrindo um relato no{' '}
          <Link
            href="https://github.com/Pedro6Stein/GovTrace/issues"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 600 }}
          >
            repositório do projeto (abre em nova aba)
          </Link>
          . Toda sugestão ajuda a tornar a fiscalização pública mais inclusiva.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={aoFechar} variant="contained" disableElevation>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
