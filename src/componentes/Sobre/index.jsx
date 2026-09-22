import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

/**
 * ModalSobre — Modal Institucional do GovTrace
 *
 * Apresenta a origem acadêmica, o propósito de democratização do controle social,
 * a equipe do TCC da FATEC Bragança Paulista e a metodologia de transparência.
 *
 * Props:
 *   aberto: boolean
 *   aoFechar: () => void
 */
export default function ModalSobre({ aberto, aoFechar }) {
  return (
    <Dialog
      open={aberto}
      onClose={aoFechar}
      maxWidth="md"
      fullWidth
      scroll="paper"
      TransitionComponent={Fade}
      transitionDuration={280}
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* ── Cabeçalho do Modal ────────────────────────────────────────── */}
      <DialogTitle sx={{ p: { xs: 2.5, sm: 3 }, pb: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Ícone Institucional */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, #c41230 0%, #a20000 55%, #7a0000 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(162, 0, 0, 0.28)',
              }}
            >
              <AccountBalanceRoundedIcon sx={{ fontSize: 22 }} />
            </Box>

            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'text.primary',
                  }}
                >
                  Sobre o GovTrace
                </Typography>
                <Chip
                  label="TCC · FATEC SP"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    bgcolor: 'secondary.light',
                    color: 'secondary.dark',
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25 }}
              >
                Inteligência e transparência pública para todos os cidadãos
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={aoFechar}
            size="small"
            aria-label="Fechar modal"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'rgba(162,0,0,0.04)' },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* ── Conteúdo Principal ────────────────────────────────────────── */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: 'background.default' }}>
        <Stack spacing={3.5}>
          {/* Card 1: Missão e o que é o GovTrace */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="subtitle2"
              color="primary.main"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.75rem',
                mb: 1,
              }}
            >
              Nossa Missão
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
              O <strong>GovTrace</strong> é uma plataforma de monitoramento preventivo que traduz a
              complexidade dos dados fiscais e orçamentários do <strong>Tribunal de Contas do Estado de São Paulo (TCE-SP)</strong> em
              informação clara e acessível. Nossa premissa fundamental é que qualquer pessoa — de uma criança
              em idade escolar a um auditor experiente — deve conseguir compreender como o dinheiro público do seu
              município está sendo planejado, contratado e investido.
            </Typography>
          </Box>

          {/* Card 2: Origem Acadêmica (FATEC Bragança Paulista) */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <SchoolRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography
                variant="subtitle2"
                color="primary.main"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.75rem',
                }}
              >
                Origem Acadêmica e Institucional
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
              Este projeto foi concebido e desenvolvido como <strong>Trabalho de Conclusão de Curso (TCC)</strong> do curso superior de{' '}
              <strong>Gestão da Tecnologia da Informação</strong> na{' '}
              <strong>Faculdade de Tecnologia de Bragança Paulista (FATEC Jornalista Omair Fagundes de Oliveira)</strong>,
              instituição pública do Centro Estadual de Educação Tecnológica Paula Souza (CEETEPS).
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#F8FAFC',
                border: '1px solid',
                borderColor: '#E2E8F0',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                <strong>Compromisso Científico:</strong> Todos os motores estatísticos aplicados pelo GovTrace
                baseiam-se em métodos consagrados na ciência de dados (Lei de Benford, Z-Score e Fracionamento Temporal),
                preservando neutralidade e respeito à legalidade, sem emissão de acusações ou juízos precipitados.
              </Typography>
            </Box>
          </Box>

          {/* Card 3: Pilares de Democratização e Controle Social */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.75rem',
                mb: 2,
              }}
            >
              Pilares de Transformação Social
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <VisibilityRoundedIcon sx={{ color: '#0284C7', fontSize: 24, mb: 1 }} />
                  <Typography variant="body2" fontWeight={700} color="text.primary" gutterBottom>
                    Transparência Real
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                    Ir além da simples publicação em tabelas frias, oferecendo visualizações gráficas didáticas e compreensíveis.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Diversity3RoundedIcon sx={{ color: '#059669', fontSize: 24, mb: 1 }} />
                  <Typography variant="body2" fontWeight={700} color="text.primary" gutterBottom>
                    Controle Cidadão
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                    Capacitar munícipes, associações e estudantes a participarem ativamente da fiscalização do erário público.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <QueryStatsRoundedIcon sx={{ color: '#7C3AED', fontSize: 24, mb: 1 }} />
                  <Typography variant="body2" fontWeight={700} color="text.primary" gutterBottom>
                    Análise Forense
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                    Apoiar órgãos fiscalizadores e auditorias independentes com triagem automática de pontos fora do padrão.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Card 4: Equipe e Orientação Acadêmica */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="subtitle2"
              color="primary.main"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.75rem',
                mb: 2,
              }}
            >
              Equipe do Projeto (TCC)
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                  Autores e Desenvolvedores:
                </Typography>
                <Stack spacing={0.5}>
                  {['Enzo Corcetti', 'Lucas Policene', 'Pedro Stein'].map((autor) => (
                    <Typography
                      key={autor}
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      • {autor}
                    </Typography>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                  Gestão da Tecnologia da Informação · FATEC Bragança Paulista
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                  Orientador Acadêmico:
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  Prof. Clyton José da Rosa
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                  Orientação metodológica e estruturação analítica do projeto acadêmico.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      {/* ── Ações do Rodapé do Modal ──────────────────────────────────── */}
      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.paper', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.disabled">
          © 2026 GovTrace · Projeto Acadêmico FATEC Bragança Paulista
        </Typography>

        <Button
          onClick={aoFechar}
          variant="contained"
          color="primary"
          sx={{
            minHeight: '40px',
            px: 3,
            fontWeight: 600,
          }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
