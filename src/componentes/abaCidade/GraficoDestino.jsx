import { useEffect, useState } from 'react';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import ExplicacaoCidada from '../ExplicacaoCidada';
import { CATEGORIA, PADRAO } from './areas';
import { formatarMoeda, formatarMoedaExtenso, formatarPercentual } from '../../utilitarios/formatadores';

/**
 * GraficoDestino — "Para onde foi o dinheiro?"
 *
 * Barras horizontais em ESCALA REAL: a largura é a fatia do total (0–100%),
 * não relativa à maior categoria — normalizar pelo máximo faria 47% parecer
 * "tudo". Nomes nunca são truncados; a barra é decorativa (aria-hidden),
 * pois nome, percentual e valor estão sempre em texto.
 *
 * As chaves de CATEGORIA são idênticas às áreas da GovTrace API
 * (dominio/tabelaCnaeAreas.js e dominio/regrasCategorias.js). As descrições
 * acompanham as decisões da tabela CNAE → área.
 *
 * Props:
 *   distribuicao  Array<{ nome, valor, percentual, percentualOficial? }>
 *                 percentualOficial: quanto do valor da área veio do CNAE
 *                 (ausente na API antiga — a tela continua funcionando)
 */


// Token MD3 "emphasized decelerate" — o mesmo das barras
const MD3_DESACELERAR = 'cubic-bezier(0.05, 0.7, 0.1, 1.0)';

// ─── Rosca: a mesma divisão da lista, de relance ─────────────────────────────
// Decorativa (aria-hidden): nome, percentual e valor estão sempre na lista.
// Cada fatia é um círculo com stroke-dasharray — só CSS, sem biblioteca.
const RAIO = 80;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function Rosca({ itens, animado, ativo, aoAtivar, totalPositivo }) {
  let acumulado = 0;
  const fatias = itens.map((item, i) => {
    const pct = Math.max(Number(item.percentual) || 0, 0);
    const inicio = acumulado;
    acumulado += pct;
    const comprimento = Math.max((pct / 100) * CIRCUNFERENCIA - (pct > 1 ? 2 : 0), 0);
    return { item, i, pct, inicio, comprimento };
  });

  const destaque = ativo != null ? itens[ativo] : null;

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 260, aspectRatio: '1 / 1', mx: 'auto' }}>
      <Box component="svg" viewBox="0 0 200 200" aria-hidden="true" sx={{ width: '100%', height: '100%', display: 'block' }}>
        <circle cx="100" cy="100" r={RAIO} fill="none" stroke="#EEF1F4" strokeWidth="26" />
        {fatias.map(({ item, i, pct, inicio, comprimento }) =>
          pct > 0 ? (
            <circle
              key={item.nome}
              cx="100"
              cy="100"
              r={RAIO}
              fill="none"
              stroke={(CATEGORIA[item.nome] || PADRAO).cor}
              strokeWidth={ativo === i ? 32 : 26}
              strokeDasharray={`${animado ? comprimento : 0} ${CIRCUNFERENCIA}`}
              strokeDashoffset={-(inicio / 100) * CIRCUNFERENCIA}
              transform="rotate(-90 100 100)"
              opacity={ativo == null || ativo === i ? 1 : 0.3}
              onMouseEnter={() => aoAtivar(i)}
              onMouseLeave={() => aoAtivar(null)}
              style={{
                cursor: 'pointer',
                transition: `stroke-dasharray 0.9s ${MD3_DESACELERAR} ${0.05 * i}s, stroke-width 0.2s ease, opacity 0.2s ease`,
              }}
            />
          ) : null,
        )}
      </Box>

      {/* Centro: o total, ou a área em destaque */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: '22%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {destaque ? (
          <>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, color: (CATEGORIA[destaque.nome] || PADRAO).cor, fontVariantNumeric: 'tabular-nums' }}>
              {formatarPercentual(destaque.percentual)}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.25, color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {destaque.nome}
            </Typography>
          </>
        ) : (
          <>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>Total pago</Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.15, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
              {formatarMoedaExtenso(totalPositivo)}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>em {itens.length} áreas</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

// ─── Linha da categoria ──────────────────────────────────────────────────────
function LinhaCategoria({ item, animado, indice, ativo, aoAtivar }) {
  const { Icone, cor } = CATEGORIA[item.nome] || PADRAO;
  const percentual = Number(item.percentual) || 0;
  const largura = animado ? Math.min(Math.max(percentual, 0), 100) : 0;
  const realcada = ativo === indice;
  const apagada = ativo != null && !realcada;

  return (
    <Box
      component="li"
      onMouseEnter={() => aoAtivar(indice)}
      onMouseLeave={() => aoAtivar(null)}
      onClick={() => aoAtivar(realcada ? null : indice)}
      sx={{
        py: { xs: 1.75, sm: 2 },
        px: 1,
        mx: -1,
        borderRadius: '12px',
        listStyle: 'none',
        cursor: 'pointer',
        bgcolor: realcada ? `${cor}0F` : 'transparent',
        opacity: apagada ? 0.55 : 1,
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
        <Box
          aria-hidden
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: `${cor}14`,
            color: cor,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icone sx={{ fontSize: 22 }} />
        </Box>

        {/* minWidth: 0 permite ao bloco encolher dentro do flex — sem isso,
            o nome longo impõe sua largura mínima e empurra o card */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1.5}>
            <Typography
              component="span"
              sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.35, minWidth: 0, overflowWrap: 'anywhere' }}
            >
              {item.nome}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {formatarPercentual(percentual)}
            </Typography>
          </Stack>

          {/* Trilho = 100% do período; preenchimento = fatia real */}
          <Box aria-hidden sx={{ mt: 1, height: 10, borderRadius: '5px', bgcolor: '#EEF1F4', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${largura}%`,
                minWidth: largura > 0 ? 4 : 0,
                borderRadius: '5px',
                bgcolor: cor,
                // Token oficial MD3 "emphasized decelerate" (m3.material.io/styles/motion/easing-and-duration/tokens-specs)
                transition: 'width 0.5s cubic-bezier(0.05, 0.7, 0.1, 1.0)',
              }}
            />
          </Box>

          <Typography
            component="span"
            sx={{ display: 'block', mt: 0.75, fontSize: '0.875rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
            title={formatarMoeda(item.valor)}
          >
            {formatarMoedaExtenso(item.valor)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function GraficoDestino({ distribuicao }) {
  // Anima as barras a partir de 0 a cada nova consulta
  const [animado, setAnimado] = useState(false);
  // Área em destaque (mouse ou toque) — sincroniza rosca e lista
  const [ativo, setAtivo] = useState(null);

  useEffect(() => {
    setAnimado(false);
    setAtivo(null);
    const t = setTimeout(() => setAnimado(true), 80);
    return () => clearTimeout(t);
  }, [distribuicao]);

  if (!distribuicao?.length) return null;

  const [maior] = distribuicao; // A API entrega ordenado do maior para o menor

  // Quanto do dinheiro total foi classificado pelo CNAE oficial: média dos
  // percentuais de cada área, ponderada pelo valor. Ausente na API antiga.
  const temDadoOficial = distribuicao.some((c) => c.percentualOficial !== undefined);
  const totalPositivo = distribuicao.reduce((soma, c) => soma + Math.max(c.valor, 0), 0);
  const percentualOficialGeral = temDadoOficial && totalPositivo > 0
    ? (distribuicao.reduce((soma, c) => soma + Math.max(c.valor, 0) * (Number(c.percentualOficial) || 0), 0) / totalPositivo)
    : null;

  const fonteDaArea = (percentualOficial) =>
    Number(percentualOficial) > 0
      ? `${formatarPercentual(percentualOficial)} classificado pela atividade oficial (CNAE).`
      : 'Estimado pelo nome do fornecedor.';

  return (
    <Card component="section" aria-labelledby="titulo-destino" sx={{ minWidth: 0 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
        <Typography
          id="titulo-destino"
          component="h2"
          sx={{ fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}
        >
          Para onde foi o dinheiro?
        </Typography>

        {/* Frase-resumo: a conclusão principal antes dos detalhes */}
        <Typography sx={{ mt: 1, fontSize: '1rem', color: 'text.secondary', lineHeight: 1.6 }}>
          A maior fatia foi para{' '}
          <Box component="strong" sx={{ color: 'text.primary' }}>{maior.nome}</Box>:{' '}
          <Box component="strong" sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}>
            {formatarPercentual(maior.percentual)}
          </Box>{' '}
          do valor pago no mês ({formatarMoedaExtenso(maior.valor)}).
        </Typography>

        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '260px minmax(0, 1fr)' },
            gap: { xs: 2.5, md: 4 },
            alignItems: 'start',
          }}
        >
          {/* No desktop a rosca acompanha a rolagem da lista */}
          <Box sx={{ position: { md: 'sticky' }, top: { md: 96 }, maxWidth: { xs: 240, md: 'none' }, width: '100%', mx: 'auto' }}>
            <Rosca itens={distribuicao} animado={animado} ativo={ativo} aoAtivar={setAtivo} totalPositivo={totalPositivo} />
          </Box>

          <Box
            component="ol"
            aria-label="Distribuição do dinheiro por área, da maior para a menor"
            sx={{
              m: 0,
              p: 0,
              minWidth: 0,
              '& > li + li': { borderTop: '1px solid', borderColor: 'divider' },
            }}
          >
            {distribuicao.map((item, i) => (
              <LinhaCategoria key={item.nome} item={item} animado={animado} indice={i} ativo={ativo} aoAtivar={setAtivo} />
            ))}
          </Box>
        </Box>

        <ExplicacaoCidada rotulo="Como as áreas são definidas">
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
            A divisão usa os <strong>pagamentos do mês</strong>: o dinheiro que de fato saiu do caixa.
            Cada pagamento é contado uma vez só.
          </Typography>
          {temDadoOficial ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
              Cada empresa é classificada pela sua <strong>atividade oficial registrada na Receita
              Federal (CNAE)</strong>, traduzida para uma área pública por uma tabela de referência do
              GovTrace. Pagamentos a pessoas físicas e atividades que não indicam uma área sozinhas são{' '}
              <strong>estimados</strong> pelo nome do fornecedor. Neste período,{' '}
              <strong>{formatarPercentual(percentualOficialGeral)}</strong> do dinheiro foi classificado
              pelo dado oficial. As áreas podem divergir da classificação contábil do orçamento
              (Lei 4.320/64).
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
              Cada despesa é classificada automaticamente a partir do nome do órgão e do fornecedor.
              É uma <strong>estimativa</strong> e pode divergir da classificação contábil oficial
              (Lei 4.320/64).
            </Typography>
          )}
          <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1 }}>
            {distribuicao.map(({ nome, percentualOficial }) => (
              <Box key={nome}>
                <Typography component="dt" variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {nome}
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, color: 'text.secondary' }}>
                  {(CATEGORIA[nome] || PADRAO).descricao}
                  {temDadoOficial && ` ${fonteDaArea(percentualOficial)}`}
                </Typography>
              </Box>
            ))}
          </Box>
        </ExplicacaoCidada>
      </CardContent>
    </Card>
  );
}
