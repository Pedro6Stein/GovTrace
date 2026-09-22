import { useEffect, useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

/**
 * GraficoDestino — "Para onde foi o dinheiro?"
 *
 * Traduz o array de distribuição por categoria em barras horizontais animadas
 * com ícone identificador, rótulo textual e percentual claro.
 * Sem jargão contábil — linguagem cidadã.
 *
 * Props:
 *   distribuicao  Array<{ nome: string, valor: number, percentual: string }>
 */

// ─── Mapeamento categoria → ícone + cor ──────────────────────────────────────
// Corresponde exatamente aos retornos de regrasCategorias.js
const CATEGORIA = {
  'Saúde': {
    Icone: LocalHospitalRoundedIcon,
    cor: '#0284C7',
    fundo: '#EFF8FF',
    descricao: 'Hospitais, UBSs, medicamentos e serviços de saúde pública',
  },
  'Educação': {
    Icone: SchoolRoundedIcon,
    cor: '#7C3AED',
    fundo: '#F5F3FF',
    descricao: 'Escolas, creches, merenda escolar e material didático',
  },
  'Infraestrutura e Obras': {
    Icone: ConstructionRoundedIcon,
    cor: '#B45309',
    fundo: '#FFFBEB',
    descricao: 'Pavimentação, saneamento, obras e urbanismo',
  },
  'Assistência Social': {
    Icone: Diversity3RoundedIcon,
    cor: '#059669',
    fundo: '#F0FDF4',
    descricao: 'Programas sociais, apoio a crianças, idosos e famílias vulneráveis',
  },
  'Segurança e Trânsito': {
    Icone: ShieldRoundedIcon,
    cor: '#a20000',
    fundo: '#FEF2F2',
    descricao: 'Guarda municipal, defesa civil e controle de trânsito',
  },
  'Cultura, Esporte e Lazer': {
    Icone: PaletteRoundedIcon,
    cor: '#C98B22',
    fundo: '#FEFCE8',
    descricao: 'Eventos culturais, praças esportivas e atividades de lazer',
  },
  'Administração e Outros': {
    Icone: AccountBalanceRoundedIcon,
    cor: '#64748B',
    fundo: '#F8FAFC',
    descricao: 'Despesas administrativas, jurídicas e outros setores da máquina pública',
  },
};

const FALLBACK = {
  Icone: AccountBalanceRoundedIcon,
  cor: '#94A3B8',
  fundo: '#F8FAFC',
  descricao: 'Setor público não categorizado',
};

// ─── Formata valor monetário de forma compacta ────────────────────────────────
function fmtCompacto(v) {
  if (v >= 1_000_000)
    return 'R$ ' + (v / 1_000_000).toFixed(1).replace('.', ',') + ' mi';
  if (v >= 1_000)
    return 'R$ ' + (v / 1_000).toFixed(0) + ' mil';
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

function fmtCompleto(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Linha de categoria com barra animada ────────────────────────────────────
function LinhaCategoria({ item, animado, maxPercentual }) {
  const cfg = CATEGORIA[item.nome] || FALLBACK;
  const { Icone, cor, fundo, descricao } = cfg;
  const pct = parseFloat(item.percentual) || 0;
  // Normaliza as barras: a maior categoria ocupa 100% da área, as demais são proporcionais
  const larguraBarra = animado ? (pct / maxPercentual) * 100 : 0;

  return (
    <Tooltip
      title={`${descricao} — ${fmtCompleto(item.valor)}`}
      arrow
      placement="top"
      enterTouchDelay={0}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '180px 1fr 80px' },
          gap: { xs: 0.5, sm: 2 },
          alignItems: 'center',
          py: 1.5,
          px: { xs: 0, sm: 0 },
          cursor: 'default',
          borderRadius: 2,
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
        }}
      >
        {/* ── Ícone + nome ──────────────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: fundo,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid',
              borderColor: `${cor}22`,
            }}
          >
            <Icone sx={{ fontSize: 18, color: cor }} />
          </Box>
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.primary"
            sx={{
              lineHeight: 1.2,
              // Em mobile, linha única com overflow
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: { xs: 'nowrap', sm: 'normal' },
              maxWidth: { xs: 'calc(100% - 52px)', sm: 'none' },
            }}
          >
            {item.nome}
          </Typography>
        </Stack>

        {/* ── Barra de progresso animada ────────────────────────────── */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'block' },
            height: 10,
            bgcolor: '#F1F3F4',
            borderRadius: '5px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${larguraBarra}%`,
              bgcolor: cor,
              borderRadius: '5px',
              transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
              opacity: 0.85,
            }}
          />
        </Box>

        {/* Barra mobile (mais simples, height menor) */}
        <Box
          sx={{
            display: { xs: 'block', sm: 'none' },
            height: 6,
            bgcolor: '#F1F3F4',
            borderRadius: '3px',
            overflow: 'hidden',
            mt: 0.5,
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${larguraBarra}%`,
              bgcolor: cor,
              borderRadius: '3px',
              transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </Box>

        {/* ── Percentual + valor ────────────────────────────────────── */}
        <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ mt: { xs: 0, sm: 0 } }}>
          <Typography
            sx={{
              fontFamily: '"Roboto Mono", monospace',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: cor,
            }}
          >
            {item.percentual}%
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1 }}>
            {fmtCompacto(item.valor)}
          </Typography>
        </Stack>
      </Box>
    </Tooltip>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function GraficoDestino({ distribuicao }) {
  // Dispara a animação das barras após a montagem (evita repintura no 0%)
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Re-anima quando os dados mudam (nova consulta)
  useEffect(() => {
    setAnimado(false);
    const t = setTimeout(() => setAnimado(true), 120);
    return () => clearTimeout(t);
  }, [distribuicao]);

  if (!distribuicao || distribuicao.length === 0) return null;

  // Percentual da categoria de maior peso (normalização visual das barras)
  const maxPercentual = Math.max(...distribuicao.map((d) => parseFloat(d.percentual) || 0));

  return (
    <Card elevation={1}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
        {/* Título da seção */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Para onde foi o dinheiro?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Distribuição estimada por área social com base nos órgãos responsáveis pelos empenhos.
          </Typography>
        </Box>

        {/* Cabeçalho de colunas — apenas desktop */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'grid' },
            gridTemplateColumns: '180px 1fr 80px',
            gap: 2,
            mb: 1,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {['Área', 'Proporção do período', '%'].map((label) => (
            <Typography
              key={label}
              variant="caption"
              color="text.disabled"
              fontWeight={700}
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {label}
            </Typography>
          ))}
        </Box>

        {/* Linhas de categoria */}
        <Stack
          divider={
            <Box sx={{ height: '1px', bgcolor: 'divider', mx: { xs: 0, sm: 0 } }} />
          }
        >
          {distribuicao.map((item) => (
            <LinhaCategoria
              key={item.nome}
              item={item}
              animado={animado}
              maxPercentual={maxPercentual}
            />
          ))}
        </Stack>

        {/* Nota de rodapé */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', mt: 2.5, lineHeight: 1.5 }}
        >
          * Categorização estimada por palavra-chave no nome do órgão. Pode divergir da
          classificação oficial da Lei 4.320/64.
        </Typography>
      </CardContent>
    </Card>
  );
}
