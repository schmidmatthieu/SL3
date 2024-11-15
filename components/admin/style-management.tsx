"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useThemeStore } from '@/lib/stores/theme-store';
import { fonts } from '@/lib/fonts';
import { useToast } from '@/components/ui/use-toast';
import {
  Paintbrush,
  Type,
  Layout,
  Save,
  RotateCcw,
  Upload,
} from 'lucide-react';

export function StyleManagement() {
  const { toast } = useToast();
  const theme = useThemeStore();
  
  // Local state for form values
  const [values, setValues] = useState({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    foregroundColor: theme.foregroundColor,
    borderColor: theme.borderColor,
    primaryFont: theme.primaryFont,
    monospaceFont: theme.monospaceFont,
    baseFontSize: theme.baseFontSize,
    headingWeight: theme.headingWeight,
    bodyWeight: theme.bodyWeight,
    borderRadius: theme.borderRadius,
    containerWidth: theme.containerWidth,
    enableGlassmorphism: theme.enableGlassmorphism,
    enableTransitions: theme.enableTransitions,
  });

  // Update local state when theme changes
  useEffect(() => {
    setValues({
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      backgroundColor: theme.backgroundColor,
      foregroundColor: theme.foregroundColor,
      borderColor: theme.borderColor,
      primaryFont: theme.primaryFont,
      monospaceFont: theme.monospaceFont,
      baseFontSize: theme.baseFontSize,
      headingWeight: theme.headingWeight,
      bodyWeight: theme.bodyWeight,
      borderRadius: theme.borderRadius,
      containerWidth: theme.containerWidth,
      enableGlassmorphism: theme.enableGlassmorphism,
      enableTransitions: theme.enableTransitions,
    });
  }, [theme]);

  const handleSave = () => {
    theme.updateTheme(values);
    toast({
      title: "Theme Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleReset = () => {
    theme.resetTheme();
    toast({
      title: "Theme Reset",
      description: "Theme settings have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Theme Customization</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colors">
            <Paintbrush className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Brand Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10 p-1" 
                      value={values.primaryColor}
                      onChange={(e) => setValues(v => ({ ...v, primaryColor: e.target.value }))}
                    />
                    <Input 
                      value={values.primaryColor}
                      onChange={(e) => setValues(v => ({ ...v, primaryColor: e.target.value }))}
                      placeholder="Primary color hex" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10 p-1" 
                      value={values.secondaryColor}
                      onChange={(e) => setValues(v => ({ ...v, secondaryColor: e.target.value }))}
                    />
                    <Input 
                      value={values.secondaryColor}
                      onChange={(e) => setValues(v => ({ ...v, secondaryColor: e.target.value }))}
                      placeholder="Secondary color hex" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10 p-1" 
                      value={values.accentColor}
                      onChange={(e) => setValues(v => ({ ...v, accentColor: e.target.value }))}
                    />
                    <Input 
                      value={values.accentColor}
                      onChange={(e) => setValues(v => ({ ...v, accentColor: e.target.value }))}
                      placeholder="Accent color hex" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">UI Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Input 
                    type="color" 
                    className="w-16 h-10 p-1" 
                    value={values.backgroundColor}
                    onChange={(e) => setValues(v => ({ ...v, backgroundColor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Foreground</Label>
                  <Input 
                    type="color" 
                    className="w-16 h-10 p-1" 
                    value={values.foregroundColor}
                    onChange={(e) => setValues(v => ({ ...v, foregroundColor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Border</Label>
                  <Input 
                    type="color" 
                    className="w-16 h-10 p-1" 
                    value={values.borderColor}
                    onChange={(e) => setValues(v => ({ ...v, borderColor: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Font Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Font</Label>
                  <Select 
                    value={values.primaryFont}
                    onValueChange={(value) => setValues(v => ({ ...v, primaryFont: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fonts).map(([key, font]) => (
                        <SelectItem key={key} value={key}>
                          <span className={font.className}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Base Font Size ({values.baseFontSize}px)</Label>
                  <Slider
                    value={[values.baseFontSize]}
                    onValueChange={([value]) => setValues(v => ({ ...v, baseFontSize: value }))}
                    min={12}
                    max={20}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Font Weights</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label>Headings</Label>
                <Select 
                  value={values.headingWeight}
                  onValueChange={(value) => setValues(v => ({ ...v, headingWeight: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select heading weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">Regular (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                    <SelectItem value="600">Semibold (600)</SelectItem>
                    <SelectItem value="700">Bold (700)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Body</Label>
                <Select 
                  value={values.bodyWeight}
                  onValueChange={(value) => setValues(v => ({ ...v, bodyWeight: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">Light (300)</SelectItem>
                    <SelectItem value="400">Regular (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Border Radius ({values.borderRadius}px)</Label>
                  <Slider
                    value={[values.borderRadius]}
                    onValueChange={([value]) => setValues(v => ({ ...v, borderRadius: value }))}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Container Width</Label>
                  <Select 
                    value={values.containerWidth}
                    onValueChange={(value) => setValues(v => ({ ...v, containerWidth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select max width" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1200">1200px</SelectItem>
                      <SelectItem value="1400">1400px</SelectItem>
                      <SelectItem value="1600">1600px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Enable Glassmorphism</Label>
                  <Switch 
                    checked={values.enableGlassmorphism}
                    onCheckedChange={(checked) => setValues(v => ({ ...v, enableGlassmorphism: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Smooth Transitions</Label>
                  <Switch 
                    checked={values.enableTransitions}
                    onCheckedChange={(checked) => setValues(v => ({ ...v, enableTransitions: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Logo & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Logo (Light Mode)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-16 w-16 rounded border flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Button variant="outline" size="sm">Upload Logo</Button>
                  </div>
                </div>
                <div>
                  <Label>Logo (Dark Mode)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-16 w-16 rounded border flex items-center justify-center bg-slate-900">
                      <Upload className="h-6 w-6 text-slate-600" />
                    </div>
                    <Button variant="outline" size="sm">Upload Logo</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}