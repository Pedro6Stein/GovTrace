import { Box, Stack, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { visuallyHidden } from '@mui/utils';

import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';
import { CORES_PALCO as C } from '../../tema/coresPalco';
import {
  formatarInteiro,
  formatarMoeda,
  formatarMoedaExtenso,
  formatarPercentual,
  formatarPeriodo,
} from '../../utilitarios/formatadores';
import { formatarEmSalariosMinimos } from '../../utilitarios/traducaoCivica';
import useContagem from '../../utilitarios/useContagem';

/**
 * HeroCidade — painel de abertura da aba "A Cidade".
 *
 * Mesma linguagem visual do Laboratório Matemático (quadro escuro com grade)
 * para a página ter uma identidade só. Hierarquia de leitura:
 *   1. Contexto  — cidade e período
 *   2. Número    — o total empenhado no mês, grande, contando até o valor real
 *   3. Escala    — o mesmo valor em salários mínimos
 *   4. Etapas    — empenhado, liquidado e pago, lado a lado (nunca somados)
 *   5. Apoio     — empenhos, maior valor único, participação dos 5 maiores
 *   6. Explicação, sob demanda, logo abaixo do painel
 *
 * Só CSS + requestAnimationFrame: é a primeira tela depois do carregamento,
 * não pode puxar o Framer Motion para o bundle inicial.
 *
 * Props:
 *   totais        { valorTotal, porEtapa, totalRegistros, totalEmpenhos, maiorPagamento }
 *   concentracao  insight CR5 da GovTrace API
 *   filtros       { municipio, ano, mes }
 */

const subir = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const tracar = keyframes`
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
`;

// O mesmo dinheiro passa pelas três etapas: elas aparecem lado a lado, nunca somadas
const ETAPAS = [
  { chave: 'empenhado', rotulo: 'Empenhado', explicacao: 'reservado no orçamento', cor: C.azul },
  { chave: 'liquidado', rotulo: 'Liquidado', explicacao: 'serviço ou produto confirmado', cor: C.violeta },
  { chave: 'pago', rotulo: 'Pago', explicacao: 'saiu do caixa', cor: C.verde },
];

const entrada = (atraso) => ({ animation: `${subir} 0.6s cubic-bezier(0.05, 0.7, 0.1, 1) ${atraso}s both` });

// Grade do "quadro" + dois brilhos suaves (vermelho institucional e âmbar)
const fundoPalco = {
  bgcolor: C.fundo,
  backgroundImage: [
    'radial-gradient(circle at 88% 0%, rgba(196,18,48,0.35), transparent 42%)',
    'radial-gradient(circle at 0% 100%, rgba(255,209,102,0.12), transparent 45%)',
    `linear-gradient(${C.grade} 1px, transparent 1px)`,
    `linear-gradient(90deg, ${C.grade} 1px, transparent 1px)`,
  ].join(', '),
  backgroundSize: 'auto, auto, 28px 28px, 28px 28px',
};

function Bloco({ icone, rotulo, children, atraso }) {
  const Icone = icone;
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: '14px',
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        minWidth: 0,
        ...entrada(atraso),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: C.textoSuave }}>
        <Icone aria-hidden sx={{ fontSize: 18 }} />
        <Typography component="h3" sx={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.02em', color: C.textoSuave }}>
          {rotulo}
        </Typography>
      </Stack>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Box>
  );
}

function FaixaEtapas({ porEtapa }) {
  return (
    <Box component="section" aria-labelledby="titulo-etapas" sx={{ position: 'relative', mt: { xs: 3, sm: 3.5 }, ...entrada(0.25) }}>
      <Typography id="titulo-etapas" component="h3" sx={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.02em', color: C.textoSuave }}>
        O caminho do dinheiro no mês
      </Typography>
      <Box
        component="ol"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          mt: 1,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {ETAPAS.map((etapa) => (
          <Box
            component="li"
            key={etapa.chave}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              justifyContent: 'space-between',
              gap: { xs: 1.5, sm: 0.25 },
              px: 1.5,
              py: 1.25,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.04)',
              borderLeft: `3px solid ${etapa.cor}`,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography component="p" sx={{ fontSize: '0.875rem', fontWeight: 700, color: etapa.cor }}>
                {etapa.rotulo}
              </Typography>
              <Typography component="p" sx={{ fontSize: '0.8125rem', color: C.textoSuave, lineHeight: 1.35 }}>
                {etapa.explicacao}
              </Typography>
            </Box>
            <Typography
              component="p"
              title={formatarMoeda(porEtapa[etapa.chave] ?? 0)}
              sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', mt: { sm: 0.75 } }}
            >
              {formatarMoedaExtenso(porEtapa[etapa.chave] ?? 0)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function HeroCidade({ totais, concentracao, filtros }) {
  const valorTotal = totais?.valorTotal ?? 0;
  const valorAnimado = useContagem(valorTotal);

  if (!totais) return null;

  const { porEtapa, totalRegistros, totalEmpenhos, maiorPagamento } = totais;
  const temMaiorPagamento = maiorPagamento?.valor > 0;
  const temCR5 = concentracao?.percentual != null;

  return (
    <Box component="section" aria-labelledby="titulo-panorama">
      <Box
        sx={{
          ...fundoPalco,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '22px',
          p: { xs: 2.5, sm: 4 },
          color: C.texto,
          boxShadow: '0 18px 40px -24px rgba(15,23,42,0.55)',
        }}
      >
        {/* Rastro decorativo: a mesma linha da logo, desenhada ao abrir */}
        <Box
          component="svg"
          aria-hidden="true"
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          // Ao lado do número (área livre), nunca atrás dos blocos de texto
          sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', right: 32, top: 110, width: '42%', height: 120, opacity: 0.6, pointerEvents: 'none' }}
        >
          <Box
            component="path"
            d="M0 92 H120 L150 70 L180 104 L210 54 L240 84 L268 76 H400"
            pathLength="1"
            fill="none"
            stroke={C.amarelo}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            sx={{ strokeDasharray: 1, strokeDashoffset: 1, animation: `${tracar} 1.6s cubic-bezier(0.65, 0, 0.35, 1) 0.3s both` }}
          />
        </Box>

        {/* ── Contexto ─────────────────────────────────────────────────── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ position: 'relative', ...entrada(0) }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="titulo-panorama"
              component="h2"
              sx={{ fontSize: 'clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem)', fontWeight: 700, lineHeight: 1.2, color: '#F8FAFC' }}
            >
              Panorama de {filtros?.municipio}
            </Typography>
            {filtros?.mes && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75, color: C.textoSuave }}>
                <EventRoundedIcon aria-hidden sx={{ fontSize: 19 }} />
                <Typography sx={{ fontSize: '1rem', '&::first-letter': { textTransform: 'uppercase' } }}>
                  {formatarPeriodo(filtros.mes, filtros.ano)}
                </Typography>
              </Stack>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ px: 1.5, py: 0.75, borderRadius: '999px', border: '1px solid rgba(255,255,255,0.18)', bgcolor: 'rgba(255,255,255,0.06)', flexShrink: 0 }}
          >
            <VerifiedRoundedIcon aria-hidden sx={{ fontSize: 17, color: C.verde }} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.texto, whiteSpace: 'nowrap' }}>
              Dados oficiais do TCE-SP
            </Typography>
          </Stack>
        </Stack>

        {/* ── O número do mês ──────────────────────────────────────────── */}
        <Box sx={{ position: 'relative', mt: { xs: 3, sm: 4 }, ...entrada(0.15) }}>
          <Typography component="h3" sx={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textoSuave }}>
            Total empenhado no mês
          </Typography>
          <Typography
            component="p"
            sx={{
              mt: 0.5,
              fontSize: 'clamp(2.25rem, 1.6rem + 3.2vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
              color: '#F8FAFC',
            }}
          >
            {/* Visual: contagem animada. Leitor de tela: valor exato, sem "contar" */}
            <span aria-hidden="true">{formatarMoedaExtenso(valorAnimado)}</span>
            <Box component="span" sx={visuallyHidden}>{formatarMoeda(valorTotal)}</Box>
          </Typography>
          <Typography sx={{ mt: 1, fontSize: '0.9375rem', color: C.textoSuave }}>
            Valor exato:{' '}
            <Box component="span" sx={{ fontWeight: 600, color: C.texto, fontVariantNumeric: 'tabular-nums' }}>
              {formatarMoeda(valorTotal)}
            </Box>
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.9375rem', color: C.textoSuave }}>
            Equivale a{' '}
            <Box component="span" sx={{ fontWeight: 700, color: C.amarelo }}>
              {formatarEmSalariosMinimos(valorTotal)}
            </Box>
          </Typography>
        </Box>

        {/* ── Etapas (só quando a API já separa por etapa) ─────────────── */}
        {porEtapa && <FaixaEtapas porEtapa={porEtapa} />}

        {/* ── Blocos de apoio ──────────────────────────────────────────── */}
        <Box
          sx={{
            position: 'relative',
            mt: { xs: 3, sm: 4 },
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Bloco icone={ReceiptLongRoundedIcon} rotulo={totalEmpenhos ? 'Empenhos no período' : 'Documentos analisados'} atraso={0.35}>
            <Typography sx={{ fontSize: '1.625rem', fontWeight: 700, color: '#F8FAFC', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>
              {formatarInteiro(totalEmpenhos || totalRegistros)}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: C.textoSuave, lineHeight: 1.45 }}>
              {totalEmpenhos
                ? `Cada um contado uma vez, em ${formatarInteiro(totalRegistros)} registros oficiais do TCE-SP`
                : 'Empenhos, liquidações, pagamentos e anulações publicados pelo TCE-SP'}
            </Typography>
          </Bloco>

          {temMaiorPagamento && (
            <Bloco icone={PaymentsRoundedIcon} rotulo="Maior valor único" atraso={0.45}>
              <Typography sx={{ fontSize: '1.625rem', fontWeight: 700, color: '#F8FAFC', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>
                {formatarMoedaExtenso(maiorPagamento.valor)}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: C.textoSuave, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                {maiorPagamento.fornecedorNome && (
                  <Box component="span" sx={{ display: 'block', color: C.texto, fontWeight: 600 }}>
                    {maiorPagamento.fornecedorNome}
                  </Box>
                )}
                {[maiorPagamento.data && `Em ${maiorPagamento.data}`, maiorPagamento.documento && `Doc. ${maiorPagamento.documento}`]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Bloco>
          )}

          {temCR5 && (
            <Bloco icone={GroupsRoundedIcon} rotulo="Com os 5 maiores fornecedores" atraso={0.55}>
              <Typography sx={{ fontSize: '1.625rem', fontWeight: 700, color: concentracao.alerta ? C.amarelo : '#F8FAFC', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>
                {formatarPercentual(concentracao.percentual)}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: C.textoSuave, lineHeight: 1.45 }}>
                do dinheiro pago no mês. Detalhes no fim desta página.
              </Typography>
            </Bloco>
          )}
        </Box>
      </Box>

      {/* Explicação fora do quadro escuro: o botão usa a cor da marca */}
      <Box sx={{ px: { xs: 0.5, sm: 1 } }}>
        <ExplicacaoCidada rotulo="Entenda estes números">
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.25 }}>
            <strong>Empenho</strong> é a reserva de dinheiro no orçamento para uma despesa: a prefeitura
            se compromete a pagar. Não significa que o dinheiro já saiu do caixa. O total soma empenhos
            e reforços e desconta as anulações do período.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.25 }}>
            <strong>O caminho do dinheiro</strong> tem três etapas: empenhado (reservado), liquidado
            (serviço ou produto confirmado) e pago (saiu do caixa). Elas não são somadas entre si, porque o
            mesmo valor passa pelas três. Um pagamento deste mês pode quitar um empenho de meses anteriores;
            por isso o valor pago pode ser maior que o empenhado.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.25 }}>
            <strong>Empenhos no período</strong> conta cada documento uma vez só, mesmo que ele apareça em
            várias etapas nos registros publicados pelo Tribunal de Contas do Estado de São Paulo.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Maior valor único</strong> é o documento de maior valor no período. Valores altos
            costumam vir de obras e contratos anuais; ele serve como ponto de partida para consulta.
          </Typography>
        </ExplicacaoCidada>
      </Box>
    </Box>
  );
}
