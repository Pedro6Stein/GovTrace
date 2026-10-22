import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';

import { formatarMoeda, formatarMoedaExtenso, formatarPercentual } from '../../utilitarios/formatadores';

/**
 * Trilha do Empenho — o protagonista é o DOCUMENTO PÚBLICO (número do
 * empenho, data, órgão, valor), nunca o credor. O credor aparece só como
 * identidade anônima (ver rastro.js).
 *
 * `acoes` = { localizar(documento), copiarEAbrir(documento) }
 */

const estiloRotulo = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'text.secondary',
};

// Botões de largura total no celular: rótulos longos quebram de forma
// previsível, alinhados à esquerda, em vez de espremidos lado a lado.
const estiloBotaoAcao = { minHeight: 40, fontWeight: 600, justifyContent: { xs: 'flex-start', sm: 'center' }, textAlign: 'left' };

// ─── Um documento ────────────────────────────────────────────────────────────
export function ItemEmpenho({ empenho, acoes, mostrarIdentidade = true }) {
  const { documento, data, orgao, valor, etapas, identidade } = empenho;

  return (
    <Box
      component="li"
      sx={{ listStyle: 'none', p: { xs: 1.5, sm: 2 }, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="flex-start" useFlexGap flexWrap="wrap">
        <Box sx={{ minWidth: 0 }}>
          <Typography component="p" sx={estiloRotulo}>Empenho nº</Typography>
          <Typography
            component="p"
            sx={{ fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, monospace', fontWeight: 700, fontSize: '1.125rem', color: 'text.primary', overflowWrap: 'anywhere' }}
          >
            {documento ?? 'Registro sem número'}
          </Typography>
        </Box>
        <Typography component="p" sx={{ fontWeight: 700, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}>
          {formatarMoeda(valor)}
        </Typography>
      </Stack>

      <Typography sx={{ mt: 0.75, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.5 }}>
        {data || 'Data não informada'} · {orgao}
      </Typography>
      {etapas?.length > 0 && (
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.5 }}>
          Etapas registradas: {etapas.join(', ')}
        </Typography>
      )}
      {mostrarIdentidade && <IdentidadeCredor identidade={identidade} />}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TravelExploreRoundedIcon />}
          disabled={!documento}
          onClick={() => acoes.localizar(documento)}
          sx={estiloBotaoAcao}
        >
          Localizar Empenho na Base Geral
        </Button>
        <Button
          size="small"
          variant="text"
          startIcon={<ContentCopyRoundedIcon />}
          disabled={!documento}
          onClick={() => acoes.copiarEAbrir(documento)}
          sx={estiloBotaoAcao}
        >
          Copiar Empenho e Abrir TCE‑SP
        </Button>
      </Stack>
    </Box>
  );
}

function IdentidadeCredor({ identidade }) {
  return (
    <Typography sx={{ mt: 0.75, fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.5 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>Credor: </Box>
      {identidade}
    </Typography>
  );
}

// ─── Lista que cresce sob demanda (evita uma parede de 60 documentos) ─────────
function ListaProgressiva({ itens, renderizar, inicial = 3, passo = 5, rotulo = ['item', 'itens'] }) {
  const [visiveis, setVisiveis] = useState(inicial);
  const restantes = itens.length - visiveis;
  const proximos = Math.min(passo, restantes);
  const nome = (n) => (n === 1 ? rotulo[0] : rotulo[1]);

  return (
    <>
      <Stack component="ul" spacing={1.25} sx={{ p: 0, m: 0 }}>
        {itens.slice(0, visiveis).map(renderizar)}
      </Stack>
      {restantes > 0 && (
        <Button
          size="small"
          onClick={() => setVisiveis((v) => v + passo)}
          endIcon={<ExpandMoreRoundedIcon />}
          sx={{ mt: 1, minHeight: 40, fontWeight: 600 }}
        >
          {`Mostrar mais ${proximos} ${nome(proximos)}`}
          {restantes > proximos ? ` (restam ${restantes})` : ''}
        </Button>
      )}
    </>
  );
}

// Bloco de um grupo/área/credor com seus empenhos dentro
function BlocoGrupo({ titulo, subtitulo, identidade, empenhos, acoes, limiteEmpenhos = 3 }) {
  return (
    <Box
      component="li"
      sx={{ listStyle: 'none', p: { xs: 1.25, sm: 2 }, borderRadius: '14px', bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider' }}
    >
      <Typography component="p" sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', lineHeight: 1.4 }}>
        {titulo}
      </Typography>
      {subtitulo && (
        <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.5 }}>{subtitulo}</Typography>
      )}
      <IdentidadeCredor identidade={identidade} />

      <Box sx={{ mt: 1.5 }}>
        <ListaProgressiva
          itens={empenhos}
          inicial={limiteEmpenhos}
          rotulo={['empenho', 'empenhos']}
          renderizar={(e, i) => <ItemEmpenho key={e.documento ?? i} empenho={e} acoes={acoes} mostrarIdentidade={false} />}
        />
      </Box>
    </Box>
  );
}

// ─── Trilhas por tipo de cena ────────────────────────────────────────────────
export default function TrilhaEmpenho({ tipo, trilha, acoes }) {
  if (!trilha?.length) return null;

  let conteudo;
  switch (tipo) {
    case 'zScore':
      conteudo = (
        <ListaProgressiva
          itens={trilha}
          rotulo={['empenho', 'empenhos']}
          renderizar={(e, i) => <ItemEmpenho key={e.documento ?? i} empenho={e} acoes={acoes} />}
        />
      );
      break;
    case 'fracionamento':
      conteudo = (
        <ListaProgressiva
          itens={trilha}
          rotulo={['grupo', 'grupos']}
          renderizar={(g, i) => (
            <BlocoGrupo
              key={i}
              titulo={`${formatarMoeda(g.valor)} em ${g.empenhos.length} empenhos`}
              subtitulo="O mesmo valor, para o mesmo credor, no período:"
              identidade={g.identidade}
              empenhos={g.empenhos}
              acoes={acoes}
            />
          )}
        />
      );
      break;
    case 'monopolio':
      conteudo = (
        <ListaProgressiva
          itens={trilha}
          rotulo={['área', 'áreas']}
          renderizar={(a, i) => (
            <BlocoGrupo
              key={i}
              titulo={`${a.area}: ${formatarPercentual(a.percentual)} do valor com um único credor`}
              subtitulo="Maiores empenhos desse credor no período:"
              identidade={a.identidade}
              empenhos={a.empenhos}
              acoes={acoes}
            />
          )}
        />
      );
      break;
    case 'concentracao':
      conteudo = (
        <ListaProgressiva
          itens={trilha}
          inicial={5}
          rotulo={['credor', 'credores']}
          renderizar={(c) => (
            <BlocoGrupo
              key={c.posicao}
              titulo={`${c.posicao}º maior credor: ${formatarMoedaExtenso(c.valorTotal)}${c.participacao != null ? ` (${formatarPercentual(c.participacao)} do valor pago)` : ''}`}
              subtitulo={`${c.quantidade} ${c.quantidade === 1 ? 'pagamento' : 'pagamentos'} no período. Maior empenho:`}
              identidade={c.identidade}
              empenhos={c.empenhos}
              acoes={acoes}
              limiteEmpenhos={1}
            />
          )}
        />
      );
      break;
    default:
      return null;
  }

  return (
    <Box component="section" aria-label="Seguir o rastro do empenho" sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <ReceiptLongRoundedIcon aria-hidden sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography component="h4" sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
          Seguir o rastro do empenho
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', mb: 1.5, lineHeight: 1.5 }}>
        Use o número do empenho para conferir o documento original na base geral ou no portal do TCE-SP.
      </Typography>
      {conteudo}
    </Box>
  );
}
