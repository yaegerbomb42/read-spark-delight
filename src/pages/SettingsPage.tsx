import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  readingSpeed: number;
  autoSave: boolean;
  soundEnabled: boolean;
  ttsRate: number;
  ttsVoice: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'system',
    fontSize: 16,
    readingSpeed: 250,
    autoSave: true,
    soundEnabled: true,
    ttsRate: 1.0,
    ttsVoice: 'default',
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSetting('theme', theme);
    applyTheme(theme);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link to="/" className="text-muted-foreground hover:text-primary flex items-center gap-1.5 mb-6">
        <ChevronLeft className="h-5 w-5" />
        Back to Library
      </Link>
      
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the app looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reading Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Preferences</CardTitle>
            <CardDescription>
              Adjust your reading experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reading Speed: {settings.readingSpeed} WPM</Label>
              <Slider
                value={[settings.readingSpeed]}
                onValueChange={([value]) => updateSetting('readingSpeed', value)}
                min={100}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autosave">Auto-save progress</Label>
              <Switch
                id="autosave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Audio & Text-to-Speech
            </CardTitle>
            <CardDescription>
              Configure audio and voice settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Enable sound effects</Label>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>TTS Speech Rate: {settings.ttsRate.toFixed(1)}x</Label>
              <Slider
                value={[settings.ttsRate]}
                onValueChange={([value]) => updateSetting('ttsRate', Number(value.toFixed(1)))}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button 
            variant="outline"
            onClick={() => {
              // Reset to defaults
              const defaultSettings: SettingsData = {
                theme: 'system',
                fontSize: 16,
                readingSpeed: 250,
                autoSave: true,
                soundEnabled: true,
                ttsRate: 1.0,
                ttsVoice: 'default',
              };
              setSettings(defaultSettings);
              applyTheme('system');
            }}
          >
            Reset to Defaults
          </Button>
          <Button>
            Settings Saved
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 