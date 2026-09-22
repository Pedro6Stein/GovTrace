/**
 * GOVTRACE — Motor de Categorização de Despesas
 *
 * O TCE-SP não fornece a categoria econômica da despesa de forma estruturada.
 * Este módulo infere a área de investimento combinando palavras-chave do:
 *   1. Nome do Órgão (secretaria responsável)
 *   2. Razão Social do Fornecedor (ex: "JTP TRANSPORTES, SERVICOS...")
 *
 * Estratégia: iterar em ordem de prioridade. O fallback só é ativado após
 * testar TODOS os dicionários.
 *
 * Equipe: Enzo Corcetti, Lucas Policene, Pedro Stein — FATEC Bragança Paulista / GTI
 */

// ─── Dicionários por categoria ────────────────────────────────────────────────
// Cada entrada é um fragmento de string que pode aparecer no nome do órgão
// OU na razão social do fornecedor (TCE-SP retorna em CAPS).

const DICT = {
  saude: [
    'SAUDE', 'SAÚDE', 'HOSPITAL', 'HOSPITALAR', 'CLINICA', 'CLÍNICA',
    'MEDICAMENTO', 'MEDICAMENTOS', 'DROGARIA', 'FARMACIA', 'FARMÁCIA',
    'CIRURGICA', 'CIRÚRGICA', 'LABORATORIO', 'LABORATÓRIO',
    'ODONTOLOGIA', 'ODONTO', 'ORTOPEDIA', 'REABILITACAO', 'UBS',
    'FISIOTERAPIA', 'PSICOLOGIA', 'NUTRICAO', 'NUTRIÇÃO',
    'AMBULATORIO', 'AMBULATÓRIO', 'PRONTO SOCORRO', 'UTI',
    'EXAME', 'DIAGNOSTICO', 'DIAGNÓSTICO', 'RADIOLOGIA',
  ],

  educacao: [
    'EDUCACAO', 'EDUCAÇÃO', 'ESCOLA', 'ESCOLAR', 'ENSINO',
    'CRECHE', 'CRECHES', 'PEDAGOGICO', 'PEDAGÓGICO', 'DIDATICO', 'DIDÁTICO',
    'MERENDA', 'MERENDEIRA', 'UNIFORME', 'UNIFORMES',
    'LIVRARIA', 'EDITORA', 'LIVRO', 'LIVROS',
    'ALIMENTOS PARA ESCOLAS', 'MATERIAL ESCOLAR',
    'EDUCACIONAL', 'INFANCIA', 'INFÂNCIA', 'PUERICULTURA',
    'EJA', 'FUNDAMENTAL', 'MEDIO', 'MEDIO', 'SUPERIOR',
  ],

  infraestrutura: [
    'OBRAS', 'OBRA', 'INFRAESTRUTURA', 'PAVIMENTACAO', 'PAVIMENTAÇÃO',
    'URBANISMO', 'URBANIZACAO', 'SANEAMENTO', 'CONSTRUTORA', 'CONSTRUCAO', 'CONSTRUÇÃO',
    'ENGENHARIA', 'ELETRICA', 'ELÉTRICA', 'ELETRIC', 'ELETRICIDADE',
    'MATERIAIS P/ CONSTRUCAO', 'MATERIAIS DE CONSTRUCAO', 'MATERIAL DE CONSTRUCAO',
    'MATERIAIS CONSTRUCAO', 'MAT CONSTRUCAO', 'MAT.CONSTRUCAO',
    'AMBIENTAL', 'MEIO AMBIENTE', 'RESIDUOS', 'RESÍDUOS', 'COLETA',
    'CALCAMENTO', 'CALÇAMENTO', 'ASFALTO', 'DRENAGEM', 'ESGOTO',
    'ABASTECIMENTO', 'AGUA', 'ÁGUA', 'HIDRAULICA', 'HIDRÁULICA',
    'CONSTRUCOES', 'EDIFICACOES', 'EDIFICAÇÕES', 'REFORMA',
    'PREDIAL', 'ARQUITETURA', 'INSTALACOES', 'INSTALAÇÕES',
    'MAQUINARIA', 'EQUIPAMENTOS PESADOS', 'RETROESCAVADEIRA',
    'SOLDA', 'METALURGICA', 'METALÚRGICA', 'ACO', 'AÇO',
    'CIMENTO', 'CALCARIO', 'AREIA', 'BRITA', 'TINTA',
  ],

  transporte: [
    'TRANSPORTE', 'TRANSPORTES', 'TRANSPORTADORA',
    'AUTO POSTO', 'AUTOPOSTO', 'COMBUSTIVEL', 'COMBUSTÍVEIS', 'COMBUSTIVEIS',
    'PNEU', 'PNEUS', 'BORRACHA', 'BORRACHARIA',
    'FROTA', 'VEICULO', 'VEÍCULO', 'VEICULOS', 'VEÍCULOS',
    'LOCADORA', 'LOCAÇÃO DE VEICULOS', 'LOCAÇÃO',
    'PASSAGEIROS', 'ESCOLAR TRANSPORTE', 'TRANSPORTE ESCOLAR',
    'MECANICA', 'MECÂNICA', 'OFICINA', 'RETIFICA', 'RETÍFICA',
    'PECAS', 'PEÇAS', 'AUTOPEÇAS', 'AUTOPECAS',
    'DIESEL', 'GASOLINA', 'ETANOL', 'LUBRIFICANTE', 'LUBRIFICANTES',
    'ONIBUS', 'ÔNIBUS', 'VAN', 'MINIBUS', 'AMBULANCIA', 'AMBULÂNCIA',
    'RODOVIARIO', 'RODOVIÁRIO', 'FRETES', 'FRETE',
    'AEREO', 'AÉREO', 'TAXI', 'TÁXI', 'UBER',
    'LAVAGEM', 'HIGIENIZACAO DE VEICULO', 'REVISAO VEICULAR',
  ],

  tecnologia: [
    'INFORMATICA', 'INFORMÁTICA', 'SOFTWARE', 'SISTEMAS',
    'TECNOLOGIA', 'TECNOLOGIAS', 'COMPUTADORES', 'COMPUTADOR',
    'DADOS', 'DATA CENTER', 'NUVEM', 'CLOUD',
    'TELECOM', 'TELECOMUNICACOES', 'TELECOMUNICAÇÕES', 'INTERNET',
    'REDE', 'REDES', 'HARDWARE', 'SERVIDOR', 'SERVIDORES',
    'AUTOMACAO', 'AUTOMAÇÃO', 'DIGITAL', 'DIGITAL',
    'TI ', ' TI', 'TIC', 'SUPORTE TECNICO', 'SUPORTE TÉCNICO',
    'APLICATIVO', 'APLICATIVOS', 'PLATAFORMA', 'PORTAL',
    'LICENCA', 'LICENÇA', 'LICENCIAMENTO',
  ],

  assistencia: [
    'ASSISTENCIA SOCIAL', 'ASSISTÊNCIA SOCIAL', 'FUNDO SOCIAL',
    'CRIANCA', 'CRIANÇA', 'IDOSO', 'IDOSOS', 'FAMILIA', 'FAMÍLIA',
    'VULNERAVEL', 'VULNERÁVEL', 'CRAS', 'CREAS',
    'ACOLHIMENTO', 'ABRIGO', 'ORFANATO', 'HABITACAO', 'HABITAÇÃO',
    'BENEFICIO', 'BENEFÍCIO', 'BOLSA', 'AUXILIO', 'AUXÍLIO',
    'NUTRICIONAL', 'ALIMENTO', 'ALIMENTOS', 'CESTA BASICA', 'CESTA BÁSICA',
    'INCLUSAO', 'INCLUSÃO', 'DEFICIENTE', 'DEFICIENCIA', 'DEFICIÊNCIA',
    'TUTELAR',
  ],

  seguranca: [
    'SEGURANCA', 'SEGURANÇA', 'GUARDA', 'GUARDA CIVIL', 'GUARDA MUNICIPAL',
    'TRANSITO', 'TRÂNSITO', 'DEFESA CIVIL', 'BOMBEIRO',
    'POLICIA', 'POLÍCIA', 'VIATURA', 'VIATURAS',
    'VIGILANCIA', 'VIGILÂNCIA', 'PORTARIA', 'MONITORAMENTO',
    'CAMERA', 'CÂMERA', 'CFTV', 'ALARME', 'CONTROLE DE ACESSO',
  ],

  cultura: [
    'CULTURA', 'CULTURAL', 'ESPORTE', 'ESPORTES', 'ESPORTIVO',
    'TURISMO', 'LAZER', 'RECREACAO', 'RECREAÇÃO',
    'TEATRO', 'MUSEU', 'BIBLIOTECA', 'EVENTO',
    'ARTISTICO', 'ARTÍSTICO', 'BANDA', 'MUSICA', 'MÚSICA',
    'ACADEMIA', 'GINASIO', 'GINÁSIO', 'PISCINA', 'QUADRA',
  ],

  limpeza: [
    'LIMPEZA', 'CONSERVACAO', 'CONSERVAÇÃO', 'DEDETIZACAO', 'DEDETIZAÇÃO',
    'HIGIENE', 'JARDINAGEM', 'PAISAGISMO', 'CAPINA', 'PODA',
    'VARRIÇÃO', 'VARICAO', 'ZELADORIA', 'MANUTENCAO', 'MANUTENÇÃO',
    'MATERIAL DE LIMPEZA', 'PRODUTO DE LIMPEZA',
    'DESCARTAVEL', 'DESCARTÁVEL', 'EPI', 'EQUIPAMENTO DE PROTECAO',
  ],
};

// ─── Função principal de categorização ────────────────────────────────────────
/**
 * Categoriza uma despesa pública a partir do nome do órgão e/ou razão social do fornecedor.
 *
 * @param {string} nomeOrgao       — Nome da secretaria/órgão responsável pelo empenho
 * @param {string} nomeFornecedor  — Razão social completa do fornecedor (como vem do TCE-SP)
 * @returns {string}               — Nome da categoria para exibição no GraficoDestino
 */
export const categorizarDespesa = (nomeOrgao = '', nomeFornecedor = '') => {
  // Une os dois campos em uma única string maiúscula para matching uniforme
  const texto = `${nomeOrgao} ${nomeFornecedor}`.toUpperCase();

  // Testa cada dicionário em ordem de prioridade.
  // Saúde e Educação primeiro (políticas de maior impacto social).
  if (DICT.saude.some(kw => texto.includes(kw)))         return 'Saúde';
  if (DICT.educacao.some(kw => texto.includes(kw)))       return 'Educação';
  if (DICT.infraestrutura.some(kw => texto.includes(kw))) return 'Infraestrutura e Obras';
  if (DICT.transporte.some(kw => texto.includes(kw)))     return 'Transporte e Frota';
  if (DICT.tecnologia.some(kw => texto.includes(kw)))     return 'Tecnologia';
  if (DICT.assistencia.some(kw => texto.includes(kw)))    return 'Assistência Social';
  if (DICT.seguranca.some(kw => texto.includes(kw)))      return 'Segurança e Trânsito';
  if (DICT.cultura.some(kw => texto.includes(kw)))        return 'Cultura, Esporte e Lazer';
  if (DICT.limpeza.some(kw => texto.includes(kw)))        return 'Serviços Operacionais';

  // Fallback: apenas quando nenhum dicionário encontrou match
  return 'Administração e Outros';
};