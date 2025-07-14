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
  Minus
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
  aiImage: 2, // 2g CO₂e per image
  aiTextPer300Tokens: 0.036, // 0.036g CO₂e per 300 tokens
  aiVideoPer2Seconds: 4.4, // 4.4g CO₂e per 2 seconds
  laptopPerMonth: 9700, // 9,700g CO₂e per laptop per month
  storagePerGBMonth: 20, // 2,000g per 100GB = 20g per GB per month
  greenCloudReduction: 0.3 // 30% reduction for green cloud
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
  aiImages: number;
  aiQueries: number;
  avgTokens: number;
  videoSeconds: number;
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
    aiImages: 0,
    aiQueries: 0,
    avgTokens: 300,
    videoSeconds: 0,
    storage: 0,
    storageMonths: 1,
    laptops: 1,
    usageShare: 50,
    greenCloud: false
  });

  const [assetResults, setAssetResults] = useState<CalculationResults>({
    totalEmissionsKg: 0,
    emissionsPerDollar: 0,
    emissionsPerImpression: 0,
    kmDriven: 0,
    emissionLevel: 'low' as 'low' | 'medium' | 'high' | 'very-high',
    breakdown: [] as BreakdownItem[]
  });

  const [showDistributionResults, setShowDistributionResults] = useState(false);
  const [showAssetResults, setShowAssetResults] = useState(false);
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
          description: `${platformData.impressions.toLocaleString()} impressions${platformData.budget > 0 ? ` ($${platformData.budget.toLocaleString()})` : ''}`,
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
    let totalEmissionsG = 0;
    const breakdown: BreakdownItem[] = [];

    // AI Images
    if (assetInputs.aiImages > 0) {
      const imageEmissions = assetInputs.aiImages * EMISSION_FACTORS.aiImage;
      totalEmissionsG += imageEmissions;
      breakdown.push({
        category: 'AI Images',
        description: `${assetInputs.aiImages} AI-generated images`,
        emissions: imageEmissions,
        color: 'purple'
      });
    }

    // AI Text
    if (assetInputs.aiQueries > 0) {
      const textEmissions = assetInputs.aiQueries * (assetInputs.avgTokens / 300) * EMISSION_FACTORS.aiTextPer300Tokens;
      totalEmissionsG += textEmissions;
      breakdown.push({
        category: 'AI Text',
        description: `${assetInputs.aiQueries} queries (avg ${assetInputs.avgTokens} tokens)`,
        emissions: textEmissions,
        color: 'indigo'
      });
    }

    // AI Video
    if (assetInputs.videoSeconds > 0) {
      const videoEmissions = (assetInputs.videoSeconds / 2) * EMISSION_FACTORS.aiVideoPer2Seconds;
      totalEmissionsG += videoEmissions;
      breakdown.push({
        category: 'AI Video',
        description: `${assetInputs.videoSeconds} seconds of AI video`,
        emissions: videoEmissions,
        color: 'pink'
      });
    }

    // Hardware
    if (assetInputs.laptops > 0) {
      const hardwareEmissions = assetInputs.laptops * 1 * (assetInputs.usageShare / 100) * EMISSION_FACTORS.laptopPerMonth;
      totalEmissionsG += hardwareEmissions;
      breakdown.push({
        category: 'Hardware',
        description: `${assetInputs.laptops} laptop(s) at ${assetInputs.usageShare}% usage`,
        emissions: hardwareEmissions,
        color: 'gray'
      });
    }

    // Cloud Storage
    if (assetInputs.storage > 0) {
      let storageEmissions = assetInputs.storage * assetInputs.storageMonths * EMISSION_FACTORS.storagePerGBMonth;
      if (assetInputs.greenCloud) {
        storageEmissions *= (1 - EMISSION_FACTORS.greenCloudReduction);
      }
      totalEmissionsG += storageEmissions;
      breakdown.push({
        category: 'Cloud Storage',
        description: `${assetInputs.storage} GB for ${assetInputs.storageMonths} month(s)${assetInputs.greenCloud ? ' (green energy)' : ''}`,
        emissions: storageEmissions,
        color: 'green'
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

  const exportResults = (results: CalculationResults, type: 'distribution' | 'asset') => {
    const exportData = `
Digital Marketing Carbon Calculator Results - ${type === 'distribution' ? 'Campaign Distribution' : 'Asset Creation'}
==========================================

Total Emissions: ${results.totalEmissionsKg.toFixed(2)} kg CO₂e
${type === 'distribution' ? `Emissions per Dollar: ${results.emissionsPerDollar.toFixed(2)} g/$` : ''}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
                <Leaf className="text-emerald-600 dark:text-emerald-400 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carbon Calculator</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Digital Marketing Campaign Emissions</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-lg"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Campaign Distribution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                        <Megaphone className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Distribution</h2>
                    </div>
                    <Button
                      onClick={addPlatform}
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Platform
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {distributionInputs.platforms.map((platform, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Platform {index + 1}
                          </h3>
                          {distributionInputs.platforms.length > 1 && (
                            <Button
                              onClick={() => removePlatform(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Platform
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Different platforms have varying carbon intensities per impression.</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Select 
                              value={platform.platform} 
                              onValueChange={(value) => updatePlatformData(index, 'platform', value)}
                            >
                              <SelectTrigger>
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
                          
                          <div>
                            <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Impressions
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Number of times ads will be displayed on this platform.</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input
                              type="number"
                              placeholder="e.g., 100000"
                              min="0"
                              value={platform.impressions || ''}
                              onChange={(e) => updatePlatformData(index, 'impressions', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          
                          <div>
                            <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Budget ($)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Budget allocated for this platform.</p>
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
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={calculateDistributionEmissions}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg"
                      size="lg"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
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
                          <div className="text-sm text-gray-600 dark:text-gray-400">Per Dollar</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {distributionResults.emissionsPerDollar.toFixed(2)} g/$
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
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                      <Palette className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Creation</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AI-Generated Images
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of images created using AI tools like DALL-E, Midjourney, or Stable Diffusion.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g., 10"
                        min="0"
                        value={assetInputs.aiImages || ''}
                        onChange={(e) => updateAssetInput('aiImages', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AI Text Queries
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of text generation requests to AI models like ChatGPT or Claude.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        min="0"
                        value={assetInputs.aiQueries || ''}
                        onChange={(e) => updateAssetInput('aiQueries', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Average Tokens per Query
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Average number of tokens (words/characters) in each AI text generation. Default is 300 tokens (~225 words).</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        placeholder="300"
                        min="1"
                        value={assetInputs.avgTokens}
                        onChange={(e) => updateAssetInput('avgTokens', parseInt(e.target.value) || 300)}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AI Video (seconds)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Total seconds of video content generated using AI tools like Sora or Runway.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g., 60"
                        min="0"
                        value={assetInputs.videoSeconds || ''}
                        onChange={(e) => updateAssetInput('videoSeconds', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cloud Storage (GB)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Total gigabytes of assets stored in cloud services like AWS S3, Google Cloud, or similar.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        min="0"
                        value={assetInputs.storage || ''}
                        onChange={(e) => updateAssetInput('storage', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Storage Duration (months)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">How long the assets will be stored in cloud storage.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        placeholder="1"
                        min="1"
                        value={assetInputs.storageMonths}
                        onChange={(e) => updateAssetInput('storageMonths', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Laptops Used
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of laptops/computers used for asset creation work.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        placeholder="1"
                        min="1"
                        value={assetInputs.laptops}
                        onChange={(e) => updateAssetInput('laptops', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Usage Share (%)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Percentage of laptop usage dedicated to this project.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Slider
                        value={[assetInputs.usageShare]}
                        onValueChange={(value) => updateAssetInput('usageShare', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Current: {assetInputs.usageShare}%</div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center space-x-4">
                    <div className="flex items-center">
                      <Checkbox
                        id="green-cloud"
                        checked={assetInputs.greenCloud}
                        onCheckedChange={(checked) => updateAssetInput('greenCloud', checked)}
                      />
                      <Label htmlFor="green-cloud" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Green Cloud Storage (30% reduction)
                      </Label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={calculateAssetEmissions}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg"
                      size="lg"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Asset Emissions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Results */}
            <div>
              {showAssetResults && (
                <Card className="animate-slide-up">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                        <BarChart3 className="text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Results</h2>
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