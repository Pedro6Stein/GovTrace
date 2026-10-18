import { useEffect, useState } from 'react';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';

import ExplicacaoCidada from '../ExplicacaoCidada';
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

// Cores com contraste ≥ 3:1 sobre branco (WCAG 1.4.11 — objetos gráficos)
const CATEGORIA = {
  'Saúde e Medicamentos': {
    Icone: LocalHospitalRoundedIcon,
    cor: '#0284C7',
    descricao: 'Hospitais, clínicas, farmácias, medicamentos, material hospitalar e veterinária (controle de zoonoses).',
  },
  'Educação e Ensino': {
    Icone: SchoolRoundedIcon,
    cor: '#7C3AED',
    descricao: 'Escolas, creches, cursos, livros e material didático, pesquisa científica.',
  },
  'Infraestrutura, Obras e Urbanismo': {
    Icone: ConstructionRoundedIcon,
    cor: '#B45309',
    descricao: 'Obras, pavimentação, material de construção, engenharia, energia elétrica, água e esgoto.',
  },
  'Transporte, Frotas e Mobilidade': {
    Icone: DirectionsBusRoundedIcon,
    cor: '#0369A1',
    descricao: 'Combustível, veículos, oficinas e peças, locadoras e transporte de passageiros.',
  },
  'Tecnologia e Comunicação': {
    Icone: ComputerRoundedIcon,
    cor: '#0F766E',
    descricao: 'Informática, softwares, telefonia e internet, publicidade e publicação de atos oficiais.',
  },
  'Alimentação e Abastecimento': {
    Icone: RestaurantRoundedIcon,
    cor: '#15803D',
    descricao: 'Alimentos, supermercados, refeições e merenda terceirizada, agricultura.',
  },
  'Cultura, Esporte e Lazer': {
    Icone: PaletteRoundedIcon,
    cor: '#A16207',
    descricao: 'Eventos, artes, patrimônio cultural, esportes e lazer.',
  },
  'Assistência Social': {
    Icone: VolunteerActivismRoundedIcon,
    cor: '#86198F', // 8,2:1 — a mais distante das outras 10 cores
    descricao: 'Asilos e albergues, APAE e associações de defesa de direitos sociais.',
  },
  'Administração, Limpeza e Serviços Terceirizados': {
    Icone: CleaningServicesRoundedIcon,
    cor: '#475569',
    descricao: 'Limpeza e coleta de lixo, vigilância, mão de obra terceirizada, consultorias e serviços de escritório.',
  },
  'Máquina Pública, Repasses e Encargos': {
    Icone: AccountBalanceRoundedIcon,
    cor: '#64748B',
    descricao: 'Prefeitura, Câmara, INSS, bancos, previdência e repasses entre órgãos públicos.',
  },
  'Pessoa Física / Autônomo': {
    Icone: PersonRoundedIcon,
    cor: '#DB2777',
    descricao: 'Pagamentos a pessoas identificadas por CPF: autônomos e prestadores individuais.',
  },
};

const PADRAO = {
  Icone: AccountBalanceRoundedIcon,
  cor: '#64748B',
  descricao: 'Despesa pública sem categoria identificada.',
};

// ─── Linha da categoria ──────────────────────────────────────────────────────
function LinhaCategoria({ item, animado }) {
  const { Icone, cor } = CATEGORIA[item.nome] || PADRAO;
  const percentual = Number(item.percentual) || 0;
  const largura = animado ? Math.min(Math.max(percentual, 0), 100) : 0;

  return (
    <Box component="li" sx={{ py: { xs: 1.75, sm: 2 }, listStyle: 'none' }}>
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
                transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
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

  useEffect(() => {
    setAnimado(false);
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
          do total ({formatarMoedaExtenso(maior.valor)}).
        </Typography>

        <Box
          component="ol"
          aria-label="Distribuição do dinheiro por área, da maior para a menor"
          sx={{
            m: 0,
            mt: 2,
            p: 0,
            '& > li + li': { borderTop: '1px solid', borderColor: 'divider' },
          }}
        >
          {distribuicao.map((item) => (
            <LinhaCategoria key={item.nome} item={item} animado={animado} />
          ))}
        </Box>

        <ExplicacaoCidada rotulo="Como as áreas são definidas">
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
