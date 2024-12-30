import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyleStore } from '@/lib/stores/style.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from './color-picker';
import { ColorVariantsPreview } from './color-variants-preview';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ColorSection as ColorSectionType, ColorSectionType as SectionType } from '@/apps/api/src/modules/styles/colors/types/color.types';

// Fonction de conversion HEX vers HSL
const hexToHSL = (hex: string) => {
  // Gérer le cas avec transparence (#RRGGBBAA)
  let r, g, b, a = 1;
  
  if (hex.length === 9) {
    // Format #RRGGBBAA
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
    a = parseInt(hex.slice(7, 9), 16) / 255;
  } else {
    // Format #RRGGBB
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    lPercent: Math.round(l * 100),
    a: a // Ajouter la transparence
  };
};

// Fonction pour convertir HSL en HEX
const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Fonction pour récupérer une couleur CSS et la convertir en HEX
const getColorFromCSS = (variableName: string, mode: 'light' | 'dark' | 'primary' = 'primary') => {
  const root = document.documentElement;
  let style = getComputedStyle(root);
  let cssVar = '';

  // Pour le mode sombre, on crée temporairement un élément avec la classe dark
  if (mode === 'dark') {
    const tempDiv = document.createElement('div');
    tempDiv.className = 'dark';
    document.body.appendChild(tempDiv);
    style = getComputedStyle(tempDiv);
    document.body.removeChild(tempDiv);
  }

  // Détermine quelle variable CSS utiliser
  if (mode === 'primary') {
    cssVar = style.getPropertyValue(`--${variableName}-500`).trim();
  } else {
    cssVar = style.getPropertyValue(`--${variableName}`).trim();
  }
  
  if (!cssVar) return '#000000';
  
  const [h, s, l] = cssVar.split(' ').map(val => parseFloat(val.replace('%', '')));
  return hslToHex(h, s, l);
};

export function ColorSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('primary');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // État du store
  const {
    config,
    updateColors,
    saveColors,
    fetchDefaultColors,
    currentSection,
    isPreviewActive,
    isLoading,
    cancelPreview
  } = useStyleStore();

  // État pour tracker les modifications non sauvegardées
  const hasUnsavedChanges = config?.isDirty;

  // Gestionnaire de changement de tab avec vérification des changements non sauvegardés
  const handleTabChange = async (tab: string) => {
    if (hasUnsavedChanges) {
      if (window.confirm(t('admin.style.unsavedChanges'))) {
        await cancelPreview();
      } else {
        return;
      }
    }
    setActiveTab(tab);
  };

  // Gestionnaire de changement de couleur unifié
  const handleColorChange = async (color: string, type: string, mode?: 'light' | 'dark') => {
    try {
      if (activeTab === 'primary') {
        // Générer les variantes de couleur pour les couleurs primaires
        const hsl = hexToHSL(color);
        const colorVariables = {
          [`--${type}-50`]: `${hsl.h} ${hsl.s}% 98%`,
          [`--${type}-100`]: `${hsl.h} ${hsl.s}% 95%`,
          [`--${type}-200`]: `${hsl.h} ${hsl.s}% 92%`,
          [`--${type}-300`]: `${hsl.h} ${hsl.s}% 85%`,
          [`--${type}-400`]: `${hsl.h} ${hsl.s}% 76%`,
          [`--${type}-500`]: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
          [`--${type}-600`]: `${hsl.h} ${hsl.s}% 58%`,
          [`--${type}-700`]: `${hsl.h} ${hsl.s}% 45%`,
          [`--${type}-800`]: `${hsl.h} ${hsl.s}% 38%`,
          [`--${type}-900`]: `${hsl.h} ${hsl.s}% 32%`,
          [`--${type}-950`]: `${hsl.h} ${hsl.s}% 23%`,
        };

        await updateColors({
          ':root': colorVariables
        });

        setColorValues(prev => ({
          ...prev,
          [type]: color
        }));
      } else {
        // Pour les couleurs système
        const hsl = hexToHSL(color);
        const selector = mode === 'dark' ? '.dark' : ':root';
        
        await updateColors({
          [selector]: {
            [`--${type}`]: `${hsl.h} ${hsl.s}% ${hsl.l}%`
          }
        });

        setColorValues(prev => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            [type]: color
          }
        }));
      }
    } catch (error) {
      console.error('Error updating colors:', error);
      toast({
        title: t('admin.style.error'),
        description: t('admin.style.colorUpdateError'),
        variant: 'destructive',
      });
    }
  };

  // Gestionnaire de réinitialisation
  const handleReset = async () => {
    try {
      const defaultColors = await fetchDefaultColors(activeTab);
      setColorValues(defaultColors);
    } catch (error) {
      console.error('Error resetting colors:', error);
      toast({
        title: t('admin.style.error'),
        description: t('admin.style.resetError'),
        variant: 'destructive',
      });
    }
  };

  // Gestionnaire d'annulation
  const handleCancel = async () => {
    try {
      const originalColors = await cancelPreview();
      setColorValues(originalColors);
    } catch (error) {
      console.error('Error canceling changes:', error);
      toast({
        title: t('admin.style.error'),
        description: t('admin.style.cancelError'),
        variant: 'destructive',
      });
    }
  };

  // Gestionnaire d'application
  const handleApply = async () => {
    try {
      await saveColors();
      toast({
        title: t('admin.style.success'),
        description: t('admin.style.saveSuccess'),
      });
    } catch (error) {
      console.error('Error applying colors:', error);
      toast({
        title: t('admin.style.error'),
        description: t('admin.style.saveError'),
        variant: 'destructive',
      });
    }
  };

  const [colorValues, setColorValues] = useState<{
    primary: string;
    secondary: string;
    third: string;
    light: { [key: string]: string };
    dark: { [key: string]: string };
  }>({
    primary: getColorFromCSS('primary'),
    secondary: getColorFromCSS('secondary'),
    third: getColorFromCSS('third'),
    light: {
      background: getColorFromCSS('background', 'light'),
      foreground: getColorFromCSS('foreground', 'light'),
      card: getColorFromCSS('card', 'light'),
      popover: getColorFromCSS('popover', 'light'),
      muted: getColorFromCSS('muted', 'light'),
      accent: getColorFromCSS('accent', 'light'),
      destructive: getColorFromCSS('destructive', 'light'),
      border: getColorFromCSS('border', 'light'),
      input: getColorFromCSS('input', 'light'),
      ring: getColorFromCSS('ring', 'light'),
    },
    dark: {
      background: getColorFromCSS('background', 'dark'),
      foreground: getColorFromCSS('foreground', 'dark'),
      card: getColorFromCSS('card', 'dark'),
      popover: getColorFromCSS('popover', 'dark'),
      muted: getColorFromCSS('muted', 'dark'),
      accent: getColorFromCSS('accent', 'dark'),
      destructive: getColorFromCSS('destructive', 'dark'),
      border: getColorFromCSS('border', 'dark'),
      input: getColorFromCSS('input', 'dark'),
      ring: getColorFromCSS('ring', 'dark'),
    },
  });

  // Mettre à jour les valeurs locales quand le store change
  useEffect(() => {
    if (config?.colors) {
      const newColors = { ...colorValues };

      // Mettre à jour les couleurs primaires
      if (config.colors['--primary-500']) {
        const h = parseInt(config.colors['--primary-500'].split(' ')[0]);
        const s = parseInt(config.colors['--primary-500'].split(' ')[1]);
        const l = parseInt(config.colors['--primary-500'].split(' ')[2]);
        newColors.primary = hslToHex(h, s, l);
      }
      if (config.colors['--secondary-500']) {
        const h = parseInt(config.colors['--secondary-500'].split(' ')[0]);
        const s = parseInt(config.colors['--secondary-500'].split(' ')[1]);
        const l = parseInt(config.colors['--secondary-500'].split(' ')[2]);
        newColors.secondary = hslToHex(h, s, l);
      }
      if (config.colors['--third-500']) {
        const h = parseInt(config.colors['--third-500'].split(' ')[0]);
        const s = parseInt(config.colors['--third-500'].split(' ')[1]);
        const l = parseInt(config.colors['--third-500'].split(' ')[2]);
        newColors.third = hslToHex(h, s, l);
      }

      // Mettre à jour les couleurs système light
      const systemColors = ['background', 'foreground', 'card', 'popover', 'muted', 'accent', 'destructive', 'border', 'input', 'ring'];
      systemColors.forEach(colorName => {
        if (config.colors[`--${colorName}`]) {
          const h = parseInt(config.colors[`--${colorName}`].split(' ')[0]);
          const s = parseInt(config.colors[`--${colorName}`].split(' ')[1]);
          const l = parseInt(config.colors[`--${colorName}`].split(' ')[2]);
          newColors.light[colorName] = hslToHex(h, s, l);
        }
      });

      // Mettre à jour les couleurs système dark
      if (config.colors['.dark']) {
        systemColors.forEach(colorName => {
          if (config.colors['.dark'][`--${colorName}`]) {
            const h = parseInt(config.colors['.dark'][`--${colorName}`].split(' ')[0]);
            const s = parseInt(config.colors['.dark'][`--${colorName}`].split(' ')[1]);
            const l = parseInt(config.colors['.dark'][`--${colorName}`].split(' ')[2]);
            newColors.dark[colorName] = hslToHex(h, s, l);
          }
        });
      }

      setColorValues(newColors);
    }
  }, [config?.colors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.style.colors.title')}</CardTitle>
        <CardDescription>{t('admin.style.colors.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Tabs defaultValue="primary" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="primary">{t('admin.style.tabs.colors')}</TabsTrigger>
              <TabsTrigger value="system">{t('admin.style.tabs.system')}</TabsTrigger>
            </TabsList>

            <TabsContent value="primary">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin.style.colors.primary.title')}</CardTitle>
                    <CardDescription>
                      {t('admin.style.colors.primary.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorPicker
                      color={colorValues.primary}
                      onChange={(color) => handleColorChange(color, 'primary')}
                      disabled={false}
                    />
                    <ColorVariantsPreview colorType="primary" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin.style.colors.secondary.title')}</CardTitle>
                    <CardDescription>
                      {t('admin.style.colors.secondary.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorPicker
                      color={colorValues.secondary}
                      onChange={(color) => handleColorChange(color, 'secondary')}
                      disabled={false}
                    />
                    <ColorVariantsPreview colorType="secondary" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin.style.colors.third.title')}</CardTitle>
                    <CardDescription>
                      {t('admin.style.colors.third.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorPicker
                      color={colorValues.third}
                      onChange={(color) => handleColorChange(color, 'third')}
                      disabled={false}
                    />
                    <ColorVariantsPreview colorType="third" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="grid gap-4">
                <Tabs defaultValue="light">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="light">{t('theme.mode.light')}</TabsTrigger>
                    <TabsTrigger value="dark">{t('theme.mode.dark')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="light" className="space-y-6">
                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                      {[
                        'background',
                        'foreground',
                        'border',
                        'input',
                        'ring',
                        'destructive',
                        'muted',
                        'accent',
                        'popover',
                        'card'
                      ].map((type) => (
                        <Card key={type} className="p-2">
                          <CardHeader className="p-2">
                            <CardTitle className="text-sm">{t(`admin.style.colors.system.${type}`)}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-2">
                            <ColorPicker
                              color={colorValues.light[type]}
                              onChange={(color) => handleColorChange(color, type, 'light')}
                              disabled={false}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="dark" className="space-y-6">
                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                      {[
                        'background',
                        'foreground',
                        'border',
                        'input',
                        'ring',
                        'destructive',
                        'muted',
                        'accent',
                        'popover',
                        'card'
                      ].map((type) => (
                        <Card key={type} className="p-2">
                          <CardHeader className="p-2">
                            <CardTitle className="text-sm">{t(`admin.style.colors.system.${type}`)}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-2">
                            <ColorPicker
                              color={colorValues.dark[type]}
                              onChange={(color) => handleColorChange(color, type, 'dark')}
                              disabled={false}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>

          {/* Boutons d'action en bas */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              {t('admin.style.reset.button')}
            </Button>

            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('admin.style.cancel')}
            </Button>

            <Button
              onClick={handleApply}
              disabled={isLoading || !config?.isDirty}
            >
              {t('admin.style.apply')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
