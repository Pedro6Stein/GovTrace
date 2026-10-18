import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
// Carregado só quando o diálogo abre (lazy no componente pai) — não pesa o
// bundle inicial do site para quem nunca clica em "Ver a prova matemática".
import 'katex/dist/katex.min.css';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import FormulaKatex from './FormulaKatex';
import { formatarMoeda, formatarPercentual } from '../../utilitarios/formatadores';

// eslint-plugin-react (que o projeto não tem) é quem ensina o ESLint a
// reconhecer <motion.span> como uso de `motion`; sem ele, uma tag cujo
// objeto começa com minúscula não conta como referência. Promover para
// PascalCase resolve o lint e é a própria recomendação do Framer Motion.
const MotionSpan = motion.span;
const MotionDiv = motion.div;

const ATRASO_ENTRE_LINHAS = 0.45; // segundos entre cada letra virar número

// Tokens oficiais de easing do Material Design 3 (m3.material.io/styles/
// motion/easing-and-duration/tokens-specs), convertidos para o array que o
// Framer Motion espera. "Decelerate" é para o que ENTRA na tela (começa
// rápido, pousa suave); "Accelerate" é para o que SAI (começa parado,
// ganha velocidade — reforça que não vai voltar).
const MD3_DECELERATE = [0.05, 0.7, 0.1, 1.0];
const MD3_ACCELERATE = [0.3, 0.0, 0.8, 0.15];

// ─── Linha "símbolo = valor", com crossfade quando revelada ─────────────────
function LinhaVariavel({ simbolo, valorFinal, revelado, indice, semAnimacao }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minHeight: 32 }}>
      <Box
        component="span"
        sx={{ minWidth: 26, fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: '1.0625rem', color: 'primary.main' }}
      >
        {simbolo}
      </Box>
      <Box component="span" sx={{ color: 'text.disabled' }}>=</Box>
      <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <AnimatePresence mode="wait" initial={false}>
          {!revelado ? (
            <MotionSpan
              key="simbolo"
              exit={semAnimacao ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: semAnimacao ? 0 : 0.2, ease: MD3_ACCELERATE }}
              style={{ display: 'inline-block', color: 'var(--mui-palette-text-disabled, #94A3B8)', fontStyle: 'italic' }}
            >
              valor ainda não revelado
            </MotionSpan>
          ) : (
            <MotionSpan
              key="valor"
              initial={semAnimacao ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: semAnimacao ? 0 : 0.4, delay: semAnimacao ? 0 : indice * ATRASO_ENTRE_LINHAS, ease: MD3_DECELERATE }}
              style={{ display: 'inline-block', fontWeight: 700, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
            >
              {valorFinal}
            </MotionSpan>
          )}
        </AnimatePresence>
      </Box>
    </Stack>
  );
}

// ─── Barra comparativa animada (usada no Benford) ────────────────────────────
function BarraComparativa({ rotulo, percentual, cor, animar, atraso, semAnimacao }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{rotulo}</Typography>
        <Typography variant="caption" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatarPercentual(percentual)}
        </Typography>
      </Stack>
      <Box sx={{ height: 10, borderRadius: '5px', bgcolor: '#EEF1F4', overflow: 'hidden' }}>
        <MotionDiv
          initial={semAnimacao ? false : { width: 0 }}
          animate={{ width: animar ? `${Math.min(percentual, 100)}%` : 0 }}
          transition={{ duration: semAnimacao ? 0 : 0.5, delay: semAnimacao ? 0 : atraso, ease: MD3_DECELERATE }}
          style={{ height: '100%', borderRadius: '5px', background: cor }}
        />
      </Box>
    </Box>
  );
}

// ─── Conteúdo: prova do Z-Score ──────────────────────────────────────────────
function ConteudoZScore({ dados, revelado, semAnimacao }) {
  const { estatisticas, outliers } = dados;
  const exemploOutlier = outliers?.[0];
  // Sem alerta não há outlier nomeado; ainda assim a prova funciona, usando
  // o maior valor válido do período (mesmo subconjunto usado no cálculo).
  const nomeExemplo = exemploOutlier?.fornecedorNome ?? 'o maior pagamento válido do período';
  const valorExemplo = exemploOutlier?.valor ?? estatisticas.exemploValor;

  const zCalculado = (valorExemplo - estatisticas.media) / estatisticas.desvioPadrao;
  const passouDoLimite = zCalculado > estatisticas.limite;

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
        O Z-Score mede a quantos desvios padrão um pagamento está da média de todos os pagamentos
        do período. Esta é a fórmula oficial, usada em estatística desde o século XX:
      </Typography>

      <FormulaKatex
        tex="Z = \dfrac{x - \mu}{\sigma}"
        leituraTextual="Z é igual a x menos mu, dividido por sigma."
      />

      <Stack spacing={1} sx={{ mt: 2, p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5 }}>
          Agora com os números reais de <strong>{exemploOutlier ? exemploOutlier.orgao : 'este período'}</strong>:
        </Typography>
        <LinhaVariavel simbolo="x" valorFinal={formatarMoeda(valorExemplo)} revelado={revelado} indice={0} semAnimacao={semAnimacao} />
        <LinhaVariavel simbolo="μ" valorFinal={`${formatarMoeda(estatisticas.media)} (média)`} revelado={revelado} indice={1} semAnimacao={semAnimacao} />
        <LinhaVariavel simbolo="σ" valorFinal={`${formatarMoeda(estatisticas.desvioPadrao)} (desvio padrão)`} revelado={revelado} indice={2} semAnimacao={semAnimacao} />
      </Stack>

      <AnimatePresence>
        {revelado && (
          <MotionDiv
            initial={semAnimacao ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: semAnimacao ? 0 : 3 * ATRASO_ENTRE_LINHAS + 0.2, duration: semAnimacao ? 0 : 0.4, ease: MD3_DECELERATE }}
          >
            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
              <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 'clamp(0.8125rem, 3.5vw, 1rem)', color: 'text.secondary', overflowWrap: 'break-word' }}>
                Z = ({formatarMoeda(valorExemplo)} − {formatarMoeda(estatisticas.media)}) ÷ {formatarMoeda(estatisticas.desvioPadrao)}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 'clamp(1.375rem, 6vw, 2rem)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: passouDoLimite ? '#B45309' : '#15803D' }}>
                  Z = {zCalculado.toFixed(2).replace('.', ',')}
                </Typography>
                <Chip
                  icon={passouDoLimite ? <WarningAmberRoundedIcon /> : <CheckCircleRoundedIcon />}
                  label={passouDoLimite ? `Passa do limite de ${estatisticas.limite}` : `Dentro do limite de ${estatisticas.limite}`}
                  sx={{
                    fontWeight: 700,
                    color: passouDoLimite ? '#B45309' : '#15803D',
                    bgcolor: passouDoLimite ? '#FEF3C7' : '#E8F5E9',
                    '& .MuiChip-icon': { color: 'inherit' },
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.6 }}>
                {passouDoLimite
                  ? `Por isso ${exemploOutlier ? '"' + nomeExemplo + '"' : 'este valor'} aparece como Ponto para Análise: está estatisticamente muito distante do comportamento normal da cidade neste período.`
                  : 'Dentro do limite de 4 desvios padrão, o sistema considera esse valor estatisticamente normal para a cidade neste período.'}
              </Typography>
            </Box>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Conteúdo: prova da Lei de Benford ───────────────────────────────────────
function ConteudoBenford({ dados, revelado, semAnimacao }) {
  const { frequencias, limiarDesvio, digitoSuspeito } = dados;

  // Sem alerta, demonstra o dígito com maior desvio mesmo assim — a prova
  // funciona tanto para confirmar uma anomalia quanto para mostrar que o
  // maior desvio encontrado ainda está dentro da margem aceitável.
  const digitoEscolhido = digitoSuspeito ?? frequencias.reduce((maior, f) =>
    Math.abs(f.percentualObservado - f.percentualEsperado) > Math.abs(maior.percentualObservado - maior.percentualEsperado) ? f : maior
  ).digito;

  const freq = frequencias.find((f) => f.digito === digitoEscolhido);
  const esperadoFormula = Math.log10(1 + 1 / digitoEscolhido) * 100;
  const desvio = freq.percentualObservado - freq.percentualEsperado;
  const ultrapassou = Math.abs(desvio) > limiarDesvio && desvio > 0;

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
        Em registros financeiros reais, o primeiro dígito de cada valor segue uma distribuição
        natural: dígito 1 é muito mais comum que dígito 9. A fórmula é de Frank Benford (1938):
      </Typography>

      <FormulaKatex
        tex="P(d) = \log_{10}\left(1 + \dfrac{1}{d}\right)"
        leituraTextual="A probabilidade do dígito d é igual ao logaritmo de base dez de, um mais um dividido por d."
      />

      <Stack spacing={1} sx={{ mt: 2, p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5 }}>
          Testando a fórmula com o dígito <strong>{digitoEscolhido}</strong>:
        </Typography>
        <LinhaVariavel simbolo="d" valorFinal={String(digitoEscolhido)} revelado={revelado} indice={0} semAnimacao={semAnimacao} />
        <LinhaVariavel
          simbolo="P(d)"
          valorFinal={`log₁₀(1 + 1/${digitoEscolhido}) = ${formatarPercentual(esperadoFormula)}`}
          revelado={revelado}
          indice={1}
          semAnimacao={semAnimacao}
        />
      </Stack>

      <AnimatePresence>
        {revelado && (
          <MotionDiv
            initial={semAnimacao ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: semAnimacao ? 0 : 2 * ATRASO_ENTRE_LINHAS + 0.2, duration: semAnimacao ? 0 : 0.4, ease: MD3_DECELERATE }}
          >
            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
                Agora comparando a fórmula contra os dados reais do período:
              </Typography>
              <BarraComparativa
                rotulo={`Esperado pela fórmula (dígito ${digitoEscolhido})`}
                percentual={freq.percentualEsperado}
                cor="#94A3B8"
                animar={revelado}
                atraso={2 * ATRASO_ENTRE_LINHAS + 0.3}
                semAnimacao={semAnimacao}
              />
              <BarraComparativa
                rotulo={`Observado nos ${dados.totalAnalisado.toLocaleString('pt-BR')} pagamentos analisados`}
                percentual={freq.percentualObservado}
                cor={ultrapassou ? '#B45309' : '#7C3AED'}
                animar={revelado}
                atraso={2 * ATRASO_ENTRE_LINHAS + 0.6}
                semAnimacao={semAnimacao}
              />
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                <Chip
                  icon={ultrapassou ? <WarningAmberRoundedIcon /> : <CheckCircleRoundedIcon />}
                  label={`Diferença de ${formatarPercentual(Math.abs(desvio))} (limite: ${limiarDesvio} p.p.)`}
                  sx={{
                    fontWeight: 700,
                    color: ultrapassou ? '#B45309' : '#15803D',
                    bgcolor: ultrapassou ? '#FEF3C7' : '#E8F5E9',
                    '& .MuiChip-icon': { color: 'inherit' },
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.6 }}>
                {ultrapassou
                  ? 'Essa diferença passa da margem considerada natural — um indício estatístico de que valores podem ter sido tabelados ou fracionados, não uma prova de irregularidade.'
                  : 'Essa diferença está dentro da margem considerada natural: o comportamento dos números deste período parece orgânico.'}
              </Typography>
            </Box>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function DialogoProva({ tipo, dados, aberto, aoFechar }) {
  const tema = useTheme();
  const telaCheia = useMediaQuery(tema.breakpoints.down('sm'));
  const prefersReducedMotion = useReducedMotion();
  const [revelado, setRevelado] = useState(Boolean(prefersReducedMotion));
  const [chave, setChave] = useState(0); // força o replay remontando a árvore

  // Dispara a revelação pouco depois de abrir — dá tempo de ler a fórmula
  // "crua" antes dela ganhar vida. Quem pediu movimento reduzido já começa revelado.
  useEffect(() => {
    if (!aberto || prefersReducedMotion) return;
    setRevelado(false);
    const t = setTimeout(() => setRevelado(true), 900);
    return () => clearTimeout(t);
  }, [aberto, chave, prefersReducedMotion]);

  const repetir = () => {
    setChave((c) => c + 1);
    if (prefersReducedMotion) setRevelado(true);
  };

  const titulo = tipo === 'zScore' ? 'Prova matemática — Z-Score' : 'Prova matemática — Lei de Benford';

  return (
    <Dialog
      open={aberto}
      onClose={aoFechar}
      fullScreen={telaCheia}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      aria-labelledby="titulo-prova-matematica"
    >
      <DialogTitle
        id="titulo-prova-matematica"
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 700, fontSize: '1.1875rem' }}
      >
        <ScienceRoundedIcon aria-hidden color="primary" />
        <Box component="span" sx={{ flex: 1 }}>{titulo}</Box>
        <IconButton onClick={aoFechar} aria-label="Fechar" size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2.5, sm: 3.5 } }} key={chave}>
        {tipo === 'zScore' ? (
          <ConteudoZScore dados={dados} revelado={revelado} semAnimacao={Boolean(prefersReducedMotion)} />
        ) : (
          <ConteudoBenford dados={dados} revelado={revelado} semAnimacao={Boolean(prefersReducedMotion)} />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={repetir} startIcon={<ReplayRoundedIcon />} sx={{ mr: 'auto' }}>
          Repetir animação
        </Button>
        <Button onClick={aoFechar} variant="contained" disableElevation>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
