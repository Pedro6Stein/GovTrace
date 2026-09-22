import { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Stack, Autocomplete, TextField, CircularProgress } from '@mui/material';
import { buscarMunicipiosSP } from '../../servicos/ibge';
import { MESES_DISPONIVEIS, ANOS_DISPONIVEIS } from '../../dados/configuracoes';

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
    <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        
        <Autocomplete
          id="seletor-municipio"
          fullWidth
          options={municipiosSP}
          value={filtros.municipio}
          loading={carregandoMunicipios}
          onChange={(_, novoValor) => handleChange('municipio', novoValor || '')}
          disableClearable
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Município" 
              variant="outlined" 
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {carregandoMunicipios ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{ '& .MuiInputBase-root': { minHeight: '44px' } }}
            />
          )}
        />

        <FormControl fullWidth sx={{ maxWidth: { sm: 150 } }}>
          <InputLabel id="label-ano">Ano</InputLabel>
          <Select
            labelId="label-ano"
            value={filtros.ano}
            label="Ano"
            onChange={(e) => handleChange('ano', e.target.value)}
            sx={{ minHeight: '44px' }}
          >
            {ANOS_DISPONIVEIS.map((ano) => (
              <MenuItem key={ano} value={ano}>{ano}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ maxWidth: { sm: 200 } }}>
          <InputLabel id="label-mes">Mês</InputLabel>
          <Select
            labelId="label-mes"
            value={filtros.mes}
            label="Mês"
            onChange={(e) => handleChange('mes', e.target.value)}
            sx={{ minHeight: '44px' }}
          >
            {MESES_DISPONIVEIS.map((mes) => (
              <MenuItem key={mes.valor} value={mes.valor}>{mes.rotulo}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
      </Stack>
    </Box>
  );
}