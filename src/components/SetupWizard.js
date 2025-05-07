import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, Container } from '@mui/material';
import LanguageSelector from './setup/LanguageSelector';
import RestaurantDetails from './setup/RestaurantDetails';
import MenuSetup from './setup/MenuSetup';
import TemplatePreview from './setup/TemplatePreview';
import { useTranslation } from 'react-i18next';

const SetupWizard = () => {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('it');
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    cuisine: [],
    address: '',
    phone: '',
    email: '',
  });
  const [menuData, setMenuData] = useState({
    type: 'pdf',
    pdfFile: null,
    pdfUrl: '',
    categories: [],
  });
  const [templates, setTemplates] = useState({
    welcome: '',
    review: '',
  });

  useEffect(() => {
    // Cambia la lingua dell'interfaccia quando viene selezionata
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage, i18n]);

  const steps = [
    t('setup.steps.language'),
    t('setup.steps.restaurant'),
    t('setup.steps.menu'),
    t('setup.steps.preview'),
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRestaurantDataChange = (data) => {
    setRestaurantData(data);
  };

  const handleMenuDataChange = (data) => {
    setMenuData(data);
  };

  const handleTemplatesChange = (data) => {
    setTemplates(data);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        );
      case 1:
        return (
          <RestaurantDetails
            data={restaurantData}
            onChange={handleRestaurantDataChange}
          />
        );
      case 2:
        return (
          <MenuSetup
            data={menuData}
            onChange={handleMenuDataChange}
          />
        );
      case 3:
        return (
          <TemplatePreview
            restaurantData={restaurantData}
            menuData={menuData}
            templates={templates}
            onChange={handleTemplatesChange}
            language={selectedLanguage}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        
        <Box sx={{ mt: 4, mb: 2 }}>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {t('setup.completed')}
              </Typography>
              <Button onClick={() => setActiveStep(0)}>
                {t('setup.restart')}
              </Button>
            </Box>
          ) : (
            <Box>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  {t('common.back')}
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleNext}>
                  {activeStep === steps.length - 1 ? t('common.finish') : t('common.next')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SetupWizard; 