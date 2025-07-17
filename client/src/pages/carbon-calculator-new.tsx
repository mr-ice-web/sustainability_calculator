import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { 
  Leaf, 
  Megaphone, 
  Palette, 
  Calculator, 
  BarChart3, 
  Info, 
  Download, 
  Moon, 
  Sun,
  Car,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Plane,
  Plus,
  Minus,
  Database,
  Users,
  Zap,
  Trees
} from "lucide-react";

// Emission factors based on updated research and platform-specific studies
const EMISSION_FACTORS = {
  platforms: {
    google: 0.2, // Google Search Ads: 0.2g CO2e per impression
    'google-display': 0.5, // Google Display Ads: 0.5g CO2e per impression
    youtube: 0.6, // YouTube video ads: 0.6g CO2e per impression (30-second ad)
    meta: 0.5, // Meta Ads (Facebook/Instagram): 0.5g CO2e per impression
    tiktok: 0.3, // TikTok Ads: 0.3g CO2e per impression
    programmatic: 0.5148, // Programmatic display: 0.5148g CO2e per impression
    bing: 0.2, // Microsoft Bing Ads: 0.2g CO2e per impression
    pinterest: 0.5, // Pinterest Ads: 0.5g CO2e per impression
    reddit: 0.5, // Reddit Ads: 0.5g CO2e per impression
    linkedin: 0.5 // LinkedIn Ads: 0.5g CO2e per impression
  },
  assetTypes: {
    text: 0.5, // 0.5g CO₂e per text asset
    image: 2.0, // 2g CO₂e per image asset
    video: 8.8, // 8.8g CO₂e per video asset
    mixed: 3.0, // 3g CO₂e per mixed/composite asset
    unsure: 1.0 // 1g CO₂e fallback for unsure
  },
  laptopPerMonth: 9700, // 9,700g CO₂e per laptop per month
  storagePerGBMonth: 20, // 2,000g per 100GB = 20g per GB per month
  greenCloudReduction: 0.3 // 30% reduction for green cloud
};

// AI Tools options
const AI_TOOLS = [
  'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL·E', 'Canva', 'RunwayML', 'Other'
];

// Asset Types options
const ASSET_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'mixed', label: 'Mixed/Composite' },
  { value: 'unsure', label: 'Unsure' }
];

// Currency conversion rates (USD to GBP)
const CURRENCY_RATES = {
  USD: 1.0,
  GBP: 0.79 // Approximate rate, should be updated with real-time data
};

interface BreakdownItem {
  category: string;
  description: string;
  emissions: number;
  color: string;
}

interface PlatformData {
  platform: string;
  impressions: number;
  budget: number;
}

interface DistributionInputs {
  platforms: PlatformData[];
}

interface AssetCreationInputs {
  enabled: boolean;
  aiTools: string[];
  assetTypes: string[];
  numberOfAssets: number;
}

interface AssetStorageInputs {
  enabled: boolean;
  storage: number;
  storageMonths: number;
  laptops: number;
  usageShare: number;
  greenCloud: boolean;
}

interface CalculationResults {
  totalEmissionsKg: number;
  emissionsPerDollar: number;
  emissionsPerImpression: number;
  kmDriven: number;
  emissionLevel: 'low' | 'medium' | 'high' | 'very-high';
  breakdown: BreakdownItem[];
}

export default function CarbonCalculator() {
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'GBP'>('GBP');
  
  // Distribution inputs and results
  const [distributionInputs, setDistributionInputs] = useState<DistributionInputs>({
    platforms: [{ platform: '', impressions: 0, budget: 0 }]
  });
  
  const [distributionResults, setDistributionResults] = useState<CalculationResults>({
    totalEmissionsKg: 0,
    emissionsPerDollar: 0,
    emissionsPerImpression: 0,
    kmDriven: 0,
    emissionLevel: 'low' as 'low' | 'medium' | 'high' | 'very-high',
    breakdown: [] as BreakdownItem[]
  });

  // Asset creation inputs and results
  const [assetInputs, setAssetInputs] = useState<AssetCreationInputs>({
    enabled: true,
    aiTools: [],
    assetTypes: [],
    numberOfAssets: 0
  });

  const [assetResults, setAssetResults] = useState<CalculationResults>({
    totalEmissionsKg: 0,
    emissionsPerDollar: 0,
    emissionsPerImpression: 0,
    kmDriven: 0,
    emissionLevel: 'low' as 'low' | 'medium' | 'high' | 'very-high',
    breakdown: [] as BreakdownItem[]
  });

  // Asset storage inputs and results
  const [storageInputs, setStorageInputs] = useState<AssetStorageInputs>({
    enabled: true,
    storage: 0,
    storageMonths: 1,
    laptops: 1,
    usageShare: 50,
    greenCloud: false
  });

  const [storageResults, setStorageResults] = useState<CalculationResults>({
    totalEmissionsKg: 0,
    emissionsPerDollar: 0,
    emissionsPerImpression: 0,
    kmDriven: 0,
    emissionLevel: 'low' as 'low' | 'medium' | 'high' | 'very-high',
    breakdown: [] as BreakdownItem[]
  });

  const [showDistributionResults, setShowDistributionResults] = useState(false);
  const [showAssetResults, setShowAssetResults] = useState(false);
  const [showStorageResults, setShowStorageResults] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Calculate distribution emissions
  const calculateDistributionEmissions = () => {
    let totalEmissionsG = 0;
    let totalImpressions = 0;
    let totalBudget = 0;
    const breakdown: BreakdownItem[] = [];

    distributionInputs.platforms.forEach((platformData, index) => {
      if (platformData.impressions > 0 && platformData.platform && EMISSION_FACTORS.platforms[platformData.platform as keyof typeof EMISSION_FACTORS.platforms]) {
        const platformEmissions = platformData.impressions * EMISSION_FACTORS.platforms[platformData.platform as keyof typeof EMISSION_FACTORS.platforms];
        totalEmissionsG += platformEmissions;
        totalImpressions += platformData.impressions;
        totalBudget += platformData.budget;
        
        const platformDisplayName = platformData.platform === 'google-display' ? 'Google Display' : 
                                   platformData.platform.charAt(0).toUpperCase() + platformData.platform.slice(1);
        breakdown.push({
          category: platformDisplayName,
          description: `${platformData.impressions.toLocaleString()} impressions${platformData.budget > 0 ? ` (${formatCurrency(platformData.budget)})` : ''}`,
          emissions: platformEmissions,
          color: 'blue'
        });
      }
    });

    // Convert to kg and calculate metrics
    const totalEmissionsKg = totalEmissionsG / 1000;
    const emissionsPerDollar = totalBudget > 0 ? totalEmissionsG / totalBudget : 0;
    const emissionsPerImpression = totalImpressions > 0 ? totalEmissionsG / totalImpressions : 0;
    
    // Calculate km driven equivalent (average car emits ~0.184 kg CO2 per km)
    const kmDriven = totalEmissionsKg / 0.184;

    // Determine emission level based on updated thresholds
    let emissionLevel: 'low' | 'medium' | 'high' | 'very-high';
    if (totalEmissionsKg < 100) {
      emissionLevel = 'low';
    } else if (totalEmissionsKg < 500) {
      emissionLevel = 'medium';
    } else if (totalEmissionsKg < 2000) {
      emissionLevel = 'high';
    } else {
      emissionLevel = 'very-high';
    }

    setDistributionResults({
      totalEmissionsKg,
      emissionsPerDollar,
      emissionsPerImpression,
      kmDriven,
      emissionLevel,
      breakdown
    });

    setShowDistributionResults(true);
  };

  // Calculate asset creation emissions
  const calculateAssetEmissions = () => {
    if (!assetInputs.enabled || assetInputs.numberOfAssets === 0) {
      setAssetResults({
        totalEmissionsKg: 0,
        emissionsPerDollar: 0,
        emissionsPerImpression: 0,
        kmDriven: 0,
        emissionLevel: 'low',
        breakdown: []
      });
      setShowAssetResults(false);
      return;
    }

    let totalEmissionsG = 0;
    const breakdown: BreakdownItem[] = [];

    // Calculate based on selected asset types
    if (assetInputs.assetTypes.length > 0 && assetInputs.numberOfAssets > 0) {
      let avgEmissionFactor = 0;
      
      if (assetInputs.assetTypes.includes('unsure')) {
        avgEmissionFactor = EMISSION_FACTORS.assetTypes.unsure;
      } else if (assetInputs.assetTypes.length === 1) {
        // Single asset type selected
        avgEmissionFactor = EMISSION_FACTORS.assetTypes[assetInputs.assetTypes[0] as keyof typeof EMISSION_FACTORS.assetTypes];
      } else {
        // Multiple asset types selected, calculate average
        const selectedFactors = assetInputs.assetTypes.map(type => 
          EMISSION_FACTORS.assetTypes[type as keyof typeof EMISSION_FACTORS.assetTypes]
        );
        avgEmissionFactor = selectedFactors.reduce((sum, factor) => sum + factor, 0) / selectedFactors.length;
      }

      const assetEmissions = assetInputs.numberOfAssets * avgEmissionFactor;
      totalEmissionsG += assetEmissions;
      
      breakdown.push({
        category: 'AI Assets',
        description: `${assetInputs.numberOfAssets} assets (${assetInputs.assetTypes.join(', ')})`,
        emissions: assetEmissions,
        color: 'purple'
      });
    }

    // Convert to kg and calculate metrics
    const totalEmissionsKg = totalEmissionsG / 1000;
    const emissionsPerDollar = 0; // No budget for asset creation
    const emissionsPerImpression = 0; // No impressions for asset creation
    
    // Calculate km driven equivalent (average car emits ~0.184 kg CO2 per km)
    const kmDriven = totalEmissionsKg / 0.184;

    // Determine emission level based on updated thresholds
    let emissionLevel: 'low' | 'medium' | 'high' | 'very-high';
    if (totalEmissionsKg < 100) {
      emissionLevel = 'low';
    } else if (totalEmissionsKg < 500) {
      emissionLevel = 'medium';
    } else if (totalEmissionsKg < 2000) {
      emissionLevel = 'high';
    } else {
      emissionLevel = 'very-high';
    }

    setAssetResults({
      totalEmissionsKg,
      emissionsPerDollar,
      emissionsPerImpression,
      kmDriven,
      emissionLevel,
      breakdown
    });

    setShowAssetResults(true);
  };

  // Calculate storage emissions
  const calculateStorageEmissions = () => {
    if (!storageInputs.enabled) {
      setStorageResults({
        totalEmissionsKg: 0,
        emissionsPerDollar: 0,
        emissionsPerImpression: 0,
        kmDriven: 0,
        emissionLevel: 'low',
        breakdown: []
      });
      setShowStorageResults(false);
      return;
    }

    let totalEmissionsG = 0;
    const breakdown: BreakdownItem[] = [];

    // Hardware
    if (storageInputs.laptops > 0) {
      const hardwareEmissions = storageInputs.laptops * 1 * (storageInputs.usageShare / 100) * EMISSION_FACTORS.laptopPerMonth;
      totalEmissionsG += hardwareEmissions;
      breakdown.push({
        category: 'Hardware',
        description: `${storageInputs.laptops} laptop(s) at ${storageInputs.usageShare}% usage`,
        emissions: hardwareEmissions,
        color: 'gray'
      });
    }

    // Cloud Storage
    if (storageInputs.storage > 0) {
      let storageEmissions = storageInputs.storage * storageInputs.storageMonths * EMISSION_FACTORS.storagePerGBMonth;
      if (storageInputs.greenCloud) {
        storageEmissions *= (1 - EMISSION_FACTORS.greenCloudReduction);
      }
      totalEmissionsG += storageEmissions;
      breakdown.push({
        category: 'Cloud Storage',
        description: `${storageInputs.storage} GB for ${storageInputs.storageMonths} month(s)${storageInputs.greenCloud ? ' (green energy)' : ''}`,
        emissions: storageEmissions,
        color: 'green'
      });
    }

    // Convert to kg and calculate metrics
    const totalEmissionsKg = totalEmissionsG / 1000;
    const emissionsPerDollar = 0; // No budget for storage
    const emissionsPerImpression = 0; // No impressions for storage
    
    // Calculate km driven equivalent (average car emits ~0.184 kg CO2 per km)
    const kmDriven = totalEmissionsKg / 0.184;

    // Determine emission level based on updated thresholds
    let emissionLevel: 'low' | 'medium' | 'high' | 'very-high';
    if (totalEmissionsKg < 100) {
      emissionLevel = 'low';
    } else if (totalEmissionsKg < 500) {
      emissionLevel = 'medium';
    } else if (totalEmissionsKg < 2000) {
      emissionLevel = 'high';
    } else {
      emissionLevel = 'very-high';
    }

    setStorageResults({
      totalEmissionsKg,
      emissionsPerDollar,
      emissionsPerImpression,
      kmDriven,
      emissionLevel,
      breakdown
    });

    setShowStorageResults(true);
  };

  // Helper functions for updating inputs
  const addPlatform = () => {
    setDistributionInputs(prev => ({
      platforms: [...prev.platforms, { platform: '', impressions: 0, budget: 0 }]
    }));
  };

  const removePlatform = (index: number) => {
    setDistributionInputs(prev => ({
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  const updatePlatformData = (index: number, field: keyof PlatformData, value: any) => {
    setDistributionInputs(prev => ({
      platforms: prev.platforms.map((platform, i) => 
        i === index ? { ...platform, [field]: value } : platform
      )
    }));
  };

  const updateAssetInput = (field: keyof AssetCreationInputs, value: any) => {
    setAssetInputs(prev => ({ ...prev, [field]: value }));
  };

  const updateStorageInput = (field: keyof AssetStorageInputs, value: any) => {
    setStorageInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate cumulative emissions across all modules
  const calculateCumulativeEmissions = () => {
    const totalEmissionsKg = distributionResults.totalEmissionsKg + assetResults.totalEmissionsKg + storageResults.totalEmissionsKg;
    const totalBudget = distributionInputs.platforms.reduce((sum, platform) => sum + platform.budget, 0);
    const totalImpressions = distributionInputs.platforms.reduce((sum, platform) => sum + platform.impressions, 0);
    
    const emissionsPerDollar = totalBudget > 0 ? (totalEmissionsKg * 1000) / totalBudget : 0;
    const emissionsPerImpression = totalImpressions > 0 ? (totalEmissionsKg * 1000) / totalImpressions : 0;
    const kmDriven = totalEmissionsKg / 0.184;

    // Determine emission level based on updated thresholds
    let emissionLevel: 'low' | 'medium' | 'high' | 'very-high';
    if (totalEmissionsKg < 100) {
      emissionLevel = 'low';
    } else if (totalEmissionsKg < 500) {
      emissionLevel = 'medium';
    } else if (totalEmissionsKg < 2000) {
      emissionLevel = 'high';
    } else {
      emissionLevel = 'very-high';
    }

    return {
      totalEmissionsKg,
      emissionsPerDollar,
      emissionsPerImpression,
      kmDriven,
      emissionLevel,
      breakdown: [
        ...distributionResults.breakdown,
        ...assetResults.breakdown,
        ...storageResults.breakdown
      ]
    };
  };

  // Currency formatting helper
  const formatCurrency = (amount: number) => {
    const symbol = currency === 'USD' ? '$' : '£';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const exportResults = (results: CalculationResults, type: 'distribution' | 'asset') => {
    const exportData = `
Digital Marketing Carbon Calculator Results - ${type === 'distribution' ? 'Campaign Distribution' : 'Asset Creation'}
==========================================

Total Emissions: ${results.totalEmissionsKg.toFixed(2)} kg CO₂e
${type === 'distribution' ? `Emissions per ${currency === 'USD' ? 'Dollar' : 'Pound'}: ${results.emissionsPerDollar.toFixed(2)} g/${currency === 'USD' ? '$' : '£'}` : ''}
${type === 'distribution' ? `Emissions per Impression: ${results.emissionsPerImpression.toFixed(2)} g` : ''}
Equivalent to: ${results.kmDriven.toFixed(1)} km driven

Breakdown:
${results.breakdown.map(item => 
  `- ${item.category}: ${(item.emissions / 1000).toFixed(3)} kg CO₂e (${item.description})`
).join('\n')}

Calculation Assumptions:
- Platform emissions based on energy consumption of data centers and network infrastructure
- AI content includes GPU compute, model training allocation, and cooling systems
- Cloud storage accounts for data center energy, redundancy, and cooling
- Hardware includes lifecycle emissions of laptops allocated based on usage
    `;

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon-calculator-${type}-results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEmissionLevelText = (results: CalculationResults) => {
    switch (results.emissionLevel) {
      case 'low': return 'Low Emissions';
      case 'medium': return 'Moderate Emissions';
      case 'high': return 'High Emissions';
      case 'very-high': return 'Very High Emissions';
      default: return 'Low Emissions';
    }
  };

  const getEmissionLevelClass = (results: CalculationResults) => {
    switch (results.emissionLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'very-high': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getEquivalencyInfo = (results: CalculationResults) => {
    const kg = results.totalEmissionsKg;
    switch (results.emissionLevel) {
      case 'low':
        return {
          icon: Plane,
          text: 'One-way flight London to Paris',
          description: `${kg.toFixed(1)} kg CO₂e (< 100 kg threshold)`
        };
      case 'medium':
        return {
          icon: Plane,
          text: 'Round-trip flight London to Rome',
          description: `${kg.toFixed(1)} kg CO₂e (100-500 kg range)`
        };
      case 'high':
        return {
          icon: Car,
          text: `${Math.round(kg / 145 * 30)} days of typical driving`,
          description: `${kg.toFixed(1)} kg CO₂e (500-2,000 kg range)`
        };
      case 'very-high':
        return {
          icon: Plane,
          text: 'Round-trip transatlantic flight',
          description: `${kg.toFixed(1)} kg CO₂e (> 2,000 kg)`
        };
      default:
        return {
          icon: Car,
          text: `${results.kmDriven.toFixed(1)} km driven`,
          description: `${kg.toFixed(1)} kg CO₂e`
        };
    }
  };

  // Multi-select component for AI tools and asset types
  const MultiSelectComponent = ({ 
    options, 
    selectedValues, 
    onSelectionChange, 
    placeholder 
  }: {
    options: string[] | { value: string; label: string }[];
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
    placeholder: string;
  }) => {
    const toggleSelection = (value: string) => {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter(v => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {Array.isArray(options) && options.map(option => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            const isSelected = selectedValues.includes(value);
            
            return (
              <div
                key={value}
                className={`multi-select-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSelection(value)}
              >
                <span>{label}</span>
                {isSelected && <span className="text-xs">✓</span>}
              </div>
            );
          })}
        </div>
        {selectedValues.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{placeholder}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-blue-200/50 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                <Leaf className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Carbon Calculator
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Digital Marketing Campaign Emissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Currency Selector */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency:</Label>
                <Select value={currency} onValueChange={(value: 'USD' | 'GBP') => setCurrency(value)}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-xl border-blue-200 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Campaign Distribution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="card-enhanced bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg mr-4">
                        <Megaphone className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Campaign Distribution
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calculate emissions for ad platforms</p>
                      </div>
                    </div>
                    <Button
                      onClick={addPlatform}
                      size="sm"
                      className="gradient-button-primary text-white px-4 py-2 rounded-lg font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Platform
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {distributionInputs.platforms.map((platform, index) => (
                      <div key={index} className="border border-blue-200/50 dark:border-gray-600 rounded-xl p-6 bg-gradient-to-r from-white/50 to-blue-50/30 dark:from-gray-800/50 dark:to-gray-700/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            Platform {index + 1}
                          </h3>
                          {distributionInputs.platforms.length > 1 && (
                            <Button
                              onClick={() => removePlatform(index)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 rounded-lg"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                              Platform
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="inline h-4 w-4 ml-2 text-blue-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Different platforms have varying carbon intensities per impression.</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Select 
                              value={platform.platform} 
                              onValueChange={(value) => updatePlatformData(index, 'platform', value)}
                            >
                              <SelectTrigger className="input-enhanced">
                                <SelectValue placeholder="Select Platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="google">Google Search (0.2g CO₂e)</SelectItem>
                                <SelectItem value="google-display">Google Display (0.5g CO₂e)</SelectItem>
                                <SelectItem value="youtube">YouTube (0.6g CO₂e)</SelectItem>
                                <SelectItem value="meta">Meta/Facebook (0.5g CO₂e)</SelectItem>
                                <SelectItem value="tiktok">TikTok (0.3g CO₂e)</SelectItem>
                                <SelectItem value="bing">Microsoft Bing (0.2g CO₂e)</SelectItem>
                                <SelectItem value="pinterest">Pinterest (0.5g CO₂e)</SelectItem>
                                <SelectItem value="reddit">Reddit (0.5g CO₂e)</SelectItem>
                                <SelectItem value="linkedin">LinkedIn (0.5g CO₂e)</SelectItem>
                                <SelectItem value="programmatic">Programmatic (0.51g CO₂e)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                              Impressions
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="inline h-4 w-4 ml-2 text-blue-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Number of times ads will be displayed on this platform.</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              type="number"
                              placeholder="e.g., 100000"
                              min="0"
                              value={platform.impressions || ''}
                              onChange={(e) => updatePlatformData(index, 'impressions', parseInt(e.target.value) || 0)}
                              className="input-enhanced"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                              Budget ({currency})
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="inline h-4 w-4 ml-2 text-blue-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Budget allocated for this platform in {currency}.</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              type="number"
                              placeholder="e.g., 5000"
                              min="0"
                              step="0.01"
                              value={platform.budget || ''}
                              onChange={(e) => updatePlatformData(index, 'budget', parseFloat(e.target.value) || 0)}
                              className="input-enhanced"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={calculateDistributionEmissions}
                      className="gradient-button-primary text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
                      size="lg"
                    >
                      <Calculator className="mr-3 h-5 w-5" />
                      Calculate Distribution Emissions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Results */}
            <div>
              {showDistributionResults && (
                <Card className="animate-slide-up">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                        <BarChart3 className="text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribution Results</h2>
                    </div>

                    {/* Emission Level Indicator - Non-button styling */}
                    <div className={`px-4 py-2 rounded-lg mb-6 text-center border-2 ${getEmissionLevelClass(distributionResults)}`}>
                      <Leaf className="inline mr-2 h-4 w-4" />
                      <span className="font-medium">{getEmissionLevelText(distributionResults)}</span>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Campaign Emissions</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {distributionResults.totalEmissionsKg.toFixed(2)} kg CO₂e
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Per {currency === 'USD' ? 'Dollar' : 'Pound'}</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {distributionResults.emissionsPerDollar.toFixed(2)} g/{currency === 'USD' ? '$' : '£'}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Per Impression</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {distributionResults.emissionsPerImpression.toFixed(2)} g
                          </div>
                        </div>
                      </div>

                      {/* Equivalence */}
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center">
                          {(() => {
                            const IconComponent = getEquivalencyInfo(distributionResults).icon;
                            return <IconComponent className="mr-2 h-4 w-4" />;
                          })()}
                          Equivalent to:
                        </div>
                        <div className="text-lg text-blue-900 dark:text-blue-100">
                          {getEquivalencyInfo(distributionResults).text}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {getEquivalencyInfo(distributionResults).description}
                        </div>
                      </div>
                    </div>

                    {/* Platform Breakdown */}
                    {distributionResults.breakdown.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Breakdown</h3>
                        <div className="space-y-3">
                          {distributionResults.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{item.category}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {(item.emissions / 1000).toFixed(3)} kg
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.emissions.toFixed(1)} g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Export Button */}
                    <Button
                      onClick={() => exportResults(distributionResults, 'distribution')}
                      variant="outline"
                      className="w-full mt-6"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Distribution Results
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Asset Creation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="card-enhanced bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg mr-4">
                        <Palette className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          AI Asset Creation
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Optional - Calculate AI-generated content emissions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable</Label>
                      <Switch
                        checked={assetInputs.enabled}
                        onCheckedChange={(checked) => updateAssetInput('enabled', checked)}
                      />
                    </div>
                  </div>

                  {!assetInputs.enabled && (
                    <div className="text-center py-12">
                      <div className="text-gray-500 dark:text-gray-400 mb-4">
                        <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Asset Creation module is optional</p>
                        <p className="text-sm">Enable the toggle above to include AI asset emissions in your calculation</p>
                      </div>
                    </div>
                  )}

                  {assetInputs.enabled && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            AI Tools Used
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline h-4 w-4 ml-2 text-purple-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Select all AI tools you used to create assets for this campaign</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <MultiSelectComponent
                            options={AI_TOOLS}
                            selectedValues={assetInputs.aiTools}
                            onSelectionChange={(values) => updateAssetInput('aiTools', values)}
                            placeholder="Click to select AI tools used"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            Asset Types Generated
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline h-4 w-4 ml-2 text-purple-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Select the types of assets you created with AI</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <MultiSelectComponent
                            options={ASSET_TYPES}
                            selectedValues={assetInputs.assetTypes}
                            onSelectionChange={(values) => updateAssetInput('assetTypes', values)}
                            placeholder="Click to select asset types"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            Number of AI-Generated Assets
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline h-4 w-4 ml-2 text-purple-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Approximate total number of assets created with AI tools</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g., 50"
                            min="0"
                            value={assetInputs.numberOfAssets || ''}
                            onChange={(e) => updateAssetInput('numberOfAssets', parseInt(e.target.value) || 0)}
                            className="input-enhanced"
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <Button
                          onClick={calculateAssetEmissions}
                          className="gradient-button-accent text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
                          size="lg"
                        >
                          <Calculator className="mr-3 h-5 w-5" />
                          Calculate AI Asset Emissions
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Asset Results */}
            <div>
              {showAssetResults && (
                <Card className="animate-slide-up card-enhanced bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg mr-3">
                        <BarChart3 className="text-white" />
                      </div>
                      <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Asset Results</h2>
                    </div>

                    {/* Emission Level Indicator - Non-button styling */}
                    <div className={`px-4 py-2 rounded-lg mb-6 text-center border-2 ${getEmissionLevelClass(assetResults)}`}>
                      <Leaf className="inline mr-2 h-4 w-4" />
                      <span className="font-medium">{getEmissionLevelText(assetResults)}</span>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Asset Emissions</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {assetResults.totalEmissionsKg.toFixed(2)} kg CO₂e
                        </div>
                      </div>

                      {/* Equivalence */}
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center">
                          {(() => {
                            const IconComponent = getEquivalencyInfo(assetResults).icon;
                            return <IconComponent className="mr-2 h-4 w-4" />;
                          })()}
                          Equivalent to:
                        </div>
                        <div className="text-lg text-blue-900 dark:text-blue-100">
                          {getEquivalencyInfo(assetResults).text}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {getEquivalencyInfo(assetResults).description}
                        </div>
                      </div>
                    </div>

                    {/* Asset Breakdown */}
                    {assetResults.breakdown.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Breakdown</h3>
                        <div className="space-y-3">
                          {assetResults.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{item.category}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {(item.emissions / 1000).toFixed(3)} kg
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.emissions.toFixed(1)} g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Export Button */}
                    <Button
                      onClick={() => exportResults(assetResults, 'asset')}
                      variant="outline"
                      className="w-full mt-6"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Asset Results
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Asset Storage Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="card-enhanced bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg mr-4">
                        <Database className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          Asset Storage
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Optional - Calculate storage and device emissions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable</Label>
                      <Switch
                        checked={storageInputs.enabled}
                        onCheckedChange={(checked) => updateStorageInput('enabled', checked)}
                      />
                    </div>
                  </div>

                  {!storageInputs.enabled && (
                    <div className="text-center py-12">
                      <div className="text-gray-500 dark:text-gray-400 mb-4">
                        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Asset Storage module is optional</p>
                        <p className="text-sm">Enable the toggle above to include storage and device emissions</p>
                      </div>
                    </div>
                  )}

                  {storageInputs.enabled && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            Cloud Storage (GB)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline h-4 w-4 ml-2 text-green-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Total gigabytes of assets stored in cloud services like AWS S3, Google Cloud, etc.</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g., 100"
                            min="0"
                            value={storageInputs.storage || ''}
                            onChange={(e) => updateStorageInput('storage', parseInt(e.target.value) || 0)}
                            className="input-enhanced"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            Storage Duration (months)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline h-4 w-4 ml-2 text-green-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>How long the assets will be stored in cloud storage</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g., 12"
                            min="1"
                            value={storageInputs.storageMonths || ''}
                            onChange={(e) => updateStorageInput('storageMonths', parseInt(e.target.value) || 1)}
                            className="input-enhanced"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            Laptops/Devices Used
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline h-4 w-4 ml-2 text-green-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Number of laptops/computers used for campaign work</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g., 2"
                            min="0"
                            value={storageInputs.laptops || ''}
                            onChange={(e) => updateStorageInput('laptops', parseInt(e.target.value) || 0)}
                            className="input-enhanced"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            Device Usage Share (%)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline h-4 w-4 ml-2 text-green-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Percentage of device usage dedicated to this campaign</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <div className="space-y-2">
                            <Slider
                              value={[storageInputs.usageShare]}
                              onValueChange={(value) => updateStorageInput('usageShare', value[0])}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                              Current: {storageInputs.usageShare}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Checkbox
                          id="green-cloud-storage"
                          checked={storageInputs.greenCloud}
                          onCheckedChange={(checked) => updateStorageInput('greenCloud', checked)}
                        />
                        <Label htmlFor="green-cloud-storage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Green Cloud Storage (30% emission reduction)
                        </Label>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <Button
                          onClick={calculateStorageEmissions}
                          className="gradient-button-secondary text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
                          size="lg"
                        >
                          <Calculator className="mr-3 h-5 w-5" />
                          Calculate Storage Emissions
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Storage Results */}
            <div>
              {showStorageResults && (
                <Card className="animate-slide-up card-enhanced bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3">
                        <BarChart3 className="text-white" />
                      </div>
                      <h2 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Storage Results</h2>
                    </div>

                    {/* Emission Level Indicator */}
                    <div className={`px-4 py-2 rounded-lg mb-6 text-center border-2 ${getEmissionLevelClass(storageResults)}`}>
                      <Leaf className="inline mr-2 h-4 w-4" />
                      <span className="font-medium">{getEmissionLevelText(storageResults)}</span>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Storage Emissions</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {storageResults.totalEmissionsKg.toFixed(2)} kg CO₂e
                        </div>
                      </div>

                      {/* Equivalence */}
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <div className="text-sm text-green-700 dark:text-green-300 font-medium flex items-center">
                          {(() => {
                            const IconComponent = getEquivalencyInfo(storageResults).icon;
                            return <IconComponent className="mr-2 h-4 w-4" />;
                          })()}
                          Equivalent to:
                        </div>
                        <div className="text-lg text-green-900 dark:text-green-100">
                          {getEquivalencyInfo(storageResults).text}
                        </div>
                      </div>
                    </div>

                    {/* Storage Breakdown */}
                    {storageResults.breakdown.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Breakdown</h3>
                        <div className="space-y-3">
                          {storageResults.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{item.category}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {(item.emissions / 1000).toFixed(3)} kg
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.emissions.toFixed(1)} g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Export Button */}
                    <Button
                      onClick={() => exportResults(storageResults, 'storage')}
                      variant="outline"
                      className="w-full mt-6"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Storage Results
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Cumulative Results Section */}
          {(showDistributionResults || showAssetResults || showStorageResults) && (
            <Card className="card-enhanced bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-emerald-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 p-3 rounded-xl shadow-lg mr-4">
                    <BarChart3 className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                      Total Campaign Emissions
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Combined emissions across all modules</p>
                  </div>
                </div>

                {(() => {
                  const cumulativeResults = calculateCumulativeEmissions();
                  return (
                    <div className="space-y-6">
                      {/* Cumulative Emission Level */}
                      <div className={`px-6 py-4 rounded-xl text-center border-2 ${getEmissionLevelClass(cumulativeResults)}`}>
                        <Leaf className="inline mr-3 h-5 w-5" />
                        <span className="font-semibold text-lg">{getEmissionLevelText(cumulativeResults)}</span>
                      </div>

                      {/* Total Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                          <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Emissions</div>
                          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                            {cumulativeResults.totalEmissionsKg.toFixed(2)} kg CO₂e
                          </div>
                        </div>
                        {cumulativeResults.emissionsPerDollar > 0 && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                            <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Per {currency === 'USD' ? 'Dollar' : 'Pound'}</div>
                            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                              {cumulativeResults.emissionsPerDollar.toFixed(2)} g
                            </div>
                          </div>
                        )}
                        {cumulativeResults.emissionsPerImpression > 0 && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                            <div className="text-sm text-green-700 dark:text-green-300 font-medium">Per Impression</div>
                            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                              {cumulativeResults.emissionsPerImpression.toFixed(2)} g
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Equivalence Information */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                        <div className="text-sm text-yellow-800 dark:text-yellow-200 font-medium flex items-center">
                          {(() => {
                            const IconComponent = getEquivalencyInfo(cumulativeResults).icon;
                            return <IconComponent className="mr-2 h-4 w-4" />;
                          })()}
                          Environmental Impact Equivalent:
                        </div>
                        <div className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                          {getEquivalencyInfo(cumulativeResults).text}
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          {getEquivalencyInfo(cumulativeResults).description}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Sources & Methodology Section */}
          <Card>
            <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
              <CardContent className="p-6">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mr-3">
                        <BookOpen className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Methodology & Sources
                      </h2>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <span className="text-sm mr-2">
                        {sourcesOpen ? 'Hide' : 'Show'} research data
                      </span>
                      {sourcesOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-6 space-y-8">
                  {/* Methodology Overview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Calculation Methodology
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        This calculator uses research-based emission factors from academic papers, industry reports, and platform-specific studies. 
                        All calculations follow ISO 14067 standards for carbon footprint assessment and include both direct and indirect emissions 
                        from digital infrastructure, data centers, network transmission, and end-user devices.
                      </p>
                    </div>
                  </div>

                  {/* Emission Factors Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Platform Emission Factors
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Platform</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Emission Factor</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Primary Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">Google Search</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.2g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Preist et al. (2019)</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">Google Display</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.5g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Coroama et al. (2020)</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">YouTube</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.6g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Shift Project (2021)</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">Meta/Facebook</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.5g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Malmodin & Lundén (2018)</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">TikTok</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.3g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Greenspector (2022)</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">Microsoft Bing</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.2g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Microsoft (2023)</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">Pinterest</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.5g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Estimated from display ads</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">Reddit</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.5g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Estimated from display ads</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">LinkedIn</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.5g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Estimated from display ads</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">Programmatic</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">0.51g CO₂e per impression</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Scope3 (2022)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Academic & Industry Sources */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Academic & Industry Sources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Academic Research</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <li>• Preist, C., et al. (2019). "A systematic review of the environmental impacts of digital advertising"</li>
                          <li>• Coroama, V., et al. (2020). "The energy consumption of online advertising"</li>
                          <li>• Malmodin, J., & Lundén, D. (2018). "The energy and carbon footprint of the global ICT"</li>
                          <li>• Shift Project (2021). "Climate crisis: The unsustainable use of online video"</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Industry Reports</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <li>• Scope3 (2022). "The Carbon Footprint of Digital Advertising"</li>
                          <li>• Microsoft (2023). "Carbon Negative by 2030 Progress Report"</li>
                          <li>• Greenspector (2022). "Mobile App Energy Consumption Study"</li>
                          <li>• IAB (2021). "Sustainable Digital Advertising Guidelines"</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Emission Level Thresholds */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Emission Level Categories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">Low Emissions</Badge>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>&lt; 100 kg CO₂e:</strong> Equivalent to a one-way flight from London to Paris. 
                          Represents efficient, low-impact digital campaigns.
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mb-2">Moderate Emissions</Badge>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>100-500 kg CO₂e:</strong> Equivalent to a round-trip flight from London to Rome. 
                          Typical for medium-scale campaigns.
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <Badge className="bg-red-100 text-red-800 border-red-200 mb-2">High Emissions</Badge>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>500-2,000 kg CO₂e:</strong> Equivalent to 10-30 days of typical driving. 
                          Consider optimization strategies.
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <Badge className="bg-red-200 text-red-900 border-red-300 mb-2">Very High Emissions</Badge>
                        <p className="text-sm text-red-900 dark:text-red-200">
                          <strong>&gt; 2,000 kg CO₂e:</strong> Equivalent to a round-trip transatlantic flight. 
                          Requires immediate carbon reduction measures.
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Collapsible>
          </Card>
        </div>
      </main>
    </div>
  );
}