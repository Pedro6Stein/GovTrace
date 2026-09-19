/**
 * Heurística de Categorização GovTrace
 * Como o TCE-SP não fornece a categoria exata da despesa, este dicionário
 * lê palavras-chave no nome do órgão para estimar o destino do investimento,
 * criando o gráfico "Para onde vai o dinheiro" que o cidadão entende.
 */
export const categorizarDespesa = (nomeOrgao) => {
    const orgao = nomeOrgao ? nomeOrgao.toUpperCase() : '';
  
    if (orgao.includes('SAUDE') || orgao.includes('HOSPITAL') || orgao.includes('CLINICA') || orgao.includes('MEDICAMENTO')) {
      return 'Saúde';
    }
    if (orgao.includes('EDUCACAO') || orgao.includes('ESCOLA') || orgao.includes('ENSINO') || orgao.includes('CRECHE') || orgao.includes('MERENDA')) {
      return 'Educação';
    }
    if (orgao.includes('OBRAS') || orgao.includes('INFRAESTRUTURA') || orgao.includes('PAVIMENTACAO') || orgao.includes('URBANISMO') || orgao.includes('SANEAMENTO')) {
      return 'Infraestrutura e Obras';
    }
    if (orgao.includes('ASSISTENCIA SOCIAL') || orgao.includes('FUNDO SOCIAL') || orgao.includes('CRIANCA') || orgao.includes('IDOSO')) {
      return 'Assistência Social';
    }
    if (orgao.includes('SEGURANCA') || orgao.includes('GUARDA') || orgao.includes('TRANSITO') || orgao.includes('DEFESA CIVIL')) {
      return 'Segurança e Trânsito';
    }
    if (orgao.includes('CULTURA') || orgao.includes('ESPORTE') || orgao.includes('TURISMO') || orgao.includes('LAZER')) {
      return 'Cultura, Esporte e Lazer';
    }
    
    return 'Administração e Outros'; // Fallback para a máquina pública geral
  };