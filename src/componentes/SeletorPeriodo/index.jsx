import { useState, useEffect } from 'react';
import { Autocomplete, Box, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { buscarMunicipiosSP } from '../../servicos/ibge';
import { MESES_DISPONIVEIS, ANOS_DISPONIVEIS } from '../../dados/configuracoes';

/**
 * SeletorPeriodo — município (IBGE) + ano + mês
 *
 * Layout: no celular, município ocupa a linha inteira e ano/mês dividem a
 * segunda (economiza ~1/3 da primeira dobra); do tablet em diante, uma linha.
 */
export default function SeletorPeriodo({ filtros, onFiltroChange }) {
  const [municipiosSP, setMunicipiosSP] = useState([]);
  const [carregandoMunicipios, setCarregandoMunicipios] = useState(true);

  useEffect(() => {
    const carregarMunicipios = async () => {
      setCarregandoMunicipios(true);
      const nomes = await buscarMunicipiosSP();
      setMunicipiosSP(nomes);
      setCarregandoMunicipios(false);
    };

    carregarMunicipios();
  }, []);

  const handleChange = (campo, valor) => {
    onFiltroChange({ ...filtros, [campo]: valor });
  };

  return (
    <Paper
      component="section"
      aria-labelledby="titulo-seletor"
      elevation={1}
      sx={{ mb: { xs: 2.5, sm: 3 }, p: { xs: 2, sm: 3 }, borderRadius: '20px' }}
    >
      <Typography
        id="titulo-seletor"
        component="h2"
        sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.secondary', mb: 2 }}
      >
        Escolha a cidade e o período
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'minmax(0, 1fr) 140px 180px',
          },
          '& > :first-of-type': { gridColumn: { xs: '1 / -1', sm: 'auto' } },
        }}
      >
        <Autocomplete
          id="seletor-municipio"
          fullWidth
          options={municipiosSP}
          value={filtros.municipio || null}
          loading={carregandoMunicipios}
          loadingText="Carregando municípios…"
          noOptionsText="Nenhum município encontrado"
          onChange={(_, novoValor) => handleChange('municipio', novoValor || '')}
          disableClearable
          renderInput={(params) => (
            <TextField
              {...params}
              label="Município"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                'aria-busy': carregandoMunicipios,
                endAdornment: (
                  <>
                    {carregandoMunicipios ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <FormControl fullWidth>
          <InputLabel id="label-ano">Ano</InputLabel>
          <Select
            labelId="label-ano"
            value={filtros.ano}
            label="Ano"
            onChange={(e) => handleChange('ano', e.target.value)}
          >
            {ANOS_DISPONIVEIS.map((ano) => (
              <MenuItem key={ano} value={ano} sx={{ minHeight: 44 }}>{ano}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="label-mes">Mês</InputLabel>
          <Select
            labelId="label-mes"
            value={filtros.mes}
            label="Mês"
            onChange={(e) => handleChange('mes', e.target.value)}
          >
            {MESES_DISPONIVEIS.map((mes) => (
              <MenuItem key={mes.valor} value={mes.valor} sx={{ minHeight: 44 }}>{mes.rotulo}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}
