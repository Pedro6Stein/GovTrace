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

/**
 * Áreas de política pública: ícone, cor e descrição de cada uma.
 * As chaves são idênticas às áreas da GovTrace API (dominio/tabelaCnaeAreas.js
 * e dominio/regrasCategorias.js). Compartilhado pelas abas Cidade e Exploração.
 */

// Cores com contraste ≥ 3:1 sobre branco (WCAG 1.4.11 — objetos gráficos)
export const CATEGORIA = {
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

export const PADRAO = {
  Icone: AccountBalanceRoundedIcon,
  cor: '#64748B',
  descricao: 'Despesa pública sem categoria identificada.',
};

/** Configuração visual da área (ou o padrão, se a área for desconhecida). */
export const configArea = (nome) => CATEGORIA[nome] || PADRAO;
