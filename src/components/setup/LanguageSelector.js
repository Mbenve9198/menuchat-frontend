import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IT, GB, ES } from 'country-flag-icons/react/3x2';

const languages = [
  { code: 'it', name: 'Italiano', flag: IT },
  { code: 'en', name: 'English', flag: GB },
  { code: 'es', name: 'Español', flag: ES },
];

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        {t('setup.language.title')}
      </Typography>
      <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
        {t('setup.language.description')}
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {languages.map(({ code, name, flag: Flag }) => (
          <Grid item xs={12} sm={4} key={code}>
            <Card 
              elevation={selectedLanguage === code ? 8 : 1}
              sx={{
                border: selectedLanguage === code ? '2px solid #1976d2' : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea onClick={() => onLanguageChange(code)}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Flag style={{ width: '60px', height: 'auto' }} />
                    <Typography variant="h6" component="div">
                      {name}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LanguageSelector; 