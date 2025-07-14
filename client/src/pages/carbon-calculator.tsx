import { useState, useEffect } from "react";
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
  Plane
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
      case 'low': return 'emission-level-low';
      case 'medium': return 'emission-level-medium';
      case 'high': return 'emission-level-high';
      case 'very-high': return 'emission-level-very-high';
      default: return 'emission-level-low';
    }
  };

  const getEquivalencyInfo = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Distribution Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                    <Megaphone className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Distribution</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Impressions
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Total number of times your ad will be displayed across all platforms. Higher impressions typically mean higher reach but also higher carbon emissions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 100000"
                      min="0"
                      value={inputs.impressions || ''}
                      onChange={(e) => updateInput('impressions', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Different platforms have varying carbon intensities per impression. YouTube and TikTok (video) have higher emissions than search platforms like Google.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Select value={inputs.platform} onValueChange={(value) => updateInput('platform', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Search (0.2g CO₂e per impression)</SelectItem>
                        <SelectItem value="google-display">Google Display (0.5g CO₂e per impression)</SelectItem>
                        <SelectItem value="youtube">YouTube (0.6g CO₂e per impression)</SelectItem>
                        <SelectItem value="meta">Meta/Facebook (0.5g CO₂e per impression)</SelectItem>
                        <SelectItem value="tiktok">TikTok (0.3g CO₂e per impression)</SelectItem>
                        <SelectItem value="bing">Microsoft Bing (0.2g CO₂e per impression)</SelectItem>
                        <SelectItem value="pinterest">Pinterest (0.5g CO₂e per impression)</SelectItem>
                        <SelectItem value="reddit">Reddit (0.5g CO₂e per impression)</SelectItem>
                        <SelectItem value="linkedin">LinkedIn (0.5g CO₂e per impression)</SelectItem>
                        <SelectItem value="programmatic">Programmatic (0.51g CO₂e per impression)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Campaign Budget ($)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Total spending on this campaign. Used to calculate emissions per dollar spent, helping you understand the carbon efficiency of your investment.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      min="0"
                      step="0.01"
                      value={inputs.budget || ''}
                      onChange={(e) => updateInput('budget', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Creation Card */}
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
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Number of images created using AI tools like DALL-E, Midjourney, or Stable Diffusion. Each image generates approximately 2g CO₂e.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      min="0"
                      value={inputs.aiImages || ''}
                      onChange={(e) => updateInput('aiImages', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      AI Text Queries
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Number of prompts sent to AI text generators like ChatGPT, Claude, or Gemini for creating ad copy, descriptions, or other text content.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      min="0"
                      value={inputs.aiQueries || ''}
                      onChange={(e) => updateInput('aiQueries', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Average Tokens per Query
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Average length of AI responses. 300 tokens ≈ 225 words or 1,200 characters. Longer responses consume more energy and produce more emissions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="300"
                      min="1"
                      value={inputs.avgTokens}
                      onChange={(e) => updateInput('avgTokens', parseInt(e.target.value) || 300)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      AI Video Duration (seconds)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Total seconds of video content generated using AI tools like Sora or RunwayML. Video generation is energy-intensive at ~4.4g CO₂e per 2 seconds.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 30"
                      min="0"
                      value={inputs.videoSeconds || ''}
                      onChange={(e) => updateInput('videoSeconds', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cloud Storage (GB/month)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Amount of cloud storage used monthly for campaign assets. Includes images, videos, and other files stored on platforms like AWS, Google Cloud, or Dropbox.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      min="0"
                      step="0.1"
                      value={inputs.storage || ''}
                      onChange={(e) => updateInput('storage', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Storage Duration (months)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">How long assets will be stored in the cloud. Longer storage periods increase total carbon footprint.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      value={inputs.storageMonths}
                      onChange={(e) => updateInput('storageMonths', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Laptops Used
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Number of laptops used for campaign creation. Includes hardware lifecycle emissions allocated to this project.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="1"
                      min="0"
                      value={inputs.laptops}
                      onChange={(e) => updateInput('laptops', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Usage Share for AI Tasks (%)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Percentage of laptop usage dedicated to AI-related tasks for this campaign. Default is 50% to account for mixed usage.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="space-y-2">
                      <Slider
                        value={[inputs.usageShare]}
                        onValueChange={(value) => updateInput('usageShare', value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Current: {inputs.usageShare}%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="greenCloud"
                      checked={inputs.greenCloud}
                      onCheckedChange={(checked) => updateInput('greenCloud', checked)}
                    />
                    <Label htmlFor="greenCloud" className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      Green Cloud Storage
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Check this if your cloud provider uses renewable energy. Reduces storage emissions by 30% to account for cleaner energy sources.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <Button
                onClick={calculateEmissions}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg"
                size="lg"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Emissions
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Results Card */}
            {showResults && (
              <Card className="animate-slide-up">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                      <BarChart3 className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Results</h2>
                  </div>

                  {/* Emission Level Indicator */}
                  <div className={`p-4 rounded-lg mb-6 text-white font-medium text-center ${getEmissionLevelClass()}`}>
                    <Leaf className="inline mr-2 h-4 w-4" />
                    <span>{getEmissionLevelText()}</span>
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Emissions</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {results.totalEmissionsKg.toFixed(2)} kg CO₂e
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Per Dollar</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {results.emissionsPerDollar.toFixed(2)} g/$
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Per Impression</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {results.emissionsPerImpression.toFixed(2)} g
                        </div>
                      </div>
                    </div>

                    {/* Equivalence */}
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                      <div className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center">
                        {(() => {
                          const IconComponent = getEquivalencyInfo().icon;
                          return <IconComponent className="mr-2 h-4 w-4" />;
                        })()}
                        Equivalent to:
                      </div>
                      <div className="text-lg text-blue-900 dark:text-blue-100">
                        {getEquivalencyInfo().text}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {getEquivalencyInfo().description}
                      </div>
                    </div>
                  </div>

                  {/* Export Button */}
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    className="w-full mt-6"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Results
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Breakdown Card */}
            {showResults && results.breakdown.length > 0 && (
              <Card className="animate-slide-up">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emission Breakdown</h3>
                  <div className="space-y-3">
                    {results.breakdown.map((item, index) => (
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
                </CardContent>
              </Card>
            )}

            {/* Assumptions Card */}
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Info className="text-yellow-600 dark:text-yellow-400 mr-2 h-5 w-5" />
                  Calculation Assumptions
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p><strong>Platform Emissions:</strong> Based on energy consumption of data centers and network infrastructure per impression.</p>
                  <p><strong>AI Content:</strong> Includes GPU compute for generation, model training allocation, and cooling systems.</p>
                  <p><strong>Cloud Storage:</strong> Accounts for data center energy, redundancy, and cooling for long-term storage.</p>
                  <p><strong>Hardware:</strong> Lifecycle emissions of laptops allocated based on usage duration and intensity.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sources & Methodology Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleTrigger className="w-full">
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg mr-3">
                        <BookOpen className="text-indigo-600 dark:text-indigo-400 h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Methodology & Sources
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Learn about the research and data behind these calculations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      {sourcesOpen ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="mt-4 space-y-6">
                {/* Methodology Overview */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      How We Calculate Emissions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-medium text-gray-900 dark:text-white">Platform Distribution</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Energy from data centers, content delivery networks, and user devices displaying ads
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h5 className="font-medium text-gray-900 dark:text-white">AI Content Creation</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            GPU compute power, model training allocation, and cooling systems for AI generation
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h5 className="font-medium text-gray-900 dark:text-white">Cloud Storage</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Data center operations, redundancy, backup systems, and long-term storage infrastructure
                          </p>
                        </div>
                        <div className="border-l-4 border-gray-500 pl-4">
                          <h5 className="font-medium text-gray-900 dark:text-white">Hardware Lifecycle</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manufacturing, transportation, and end-of-life emissions allocated to usage periods
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emission Factors */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Emission Factors Used
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Platform Emissions</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Google Search: 0.2g CO₂e per impression</li>
                          <li>• Google Display: 0.5g CO₂e per impression</li>
                          <li>• YouTube: 0.6g CO₂e per impression</li>
                          <li>• Meta/Facebook: 0.5g CO₂e per impression</li>
                          <li>• TikTok: 0.3g CO₂e per impression</li>
                          <li>• Microsoft Bing: 0.2g CO₂e per impression</li>
                          <li>• Pinterest: 0.5g CO₂e per impression</li>
                          <li>• Reddit: 0.5g CO₂e per impression</li>
                          <li>• LinkedIn: 0.5g CO₂e per impression</li>
                          <li>• Programmatic: 0.51g CO₂e per impression</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">AI & Infrastructure</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• AI Image: 2g CO₂e per image</li>
                          <li>• AI Text: 0.036g CO₂e per 300 tokens</li>
                          <li>• AI Video: 4.4g CO₂e per 2 seconds</li>
                          <li>• Laptop: 9.7kg CO₂e per month</li>
                          <li>• Storage: 20g CO₂e per GB/month</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic & Industry Sources */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Academic & Industry Sources
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Platform Emissions Research</p>
                            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Google (2023). Sustainability Radar – Best practices for reducing carbon impact across Google Cloud. <em>Think with Google</em>.</li>
                              <li>• Google (2009). Powering Google Search. <em>Google Blog</em>.</li>
                              <li>• Google (2024). Environmental Report.</li>
                              <li>• Scope3 (2024). The Hidden Carbon Cost of Digital Advertising.</li>
                            </ul>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">AI Content Generation</p>
                            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Tomlinson, B., Silberman, M.S. and Patterson, D.J. (2024). "The carbon emissions of writing and illustrating are lower for AI than for humans." <em>Nature Scientific Reports</em>.</li>
                              <li>• Luccioni, A., et al. (2023). "The Growing Energy Footprint of Artificial Intelligence." <em>arXiv</em>.</li>
                              <li>• MIT Technology Review (2023). "Making an Image with Generative AI Uses as Much Energy as Charging Your Phone."</li>
                              <li>• OpenAI (2024). Sora Research Preview.</li>
                            </ul>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Video Streaming & Content</p>
                            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• IEA (2024). "The Carbon Footprint of Streaming Video: Fact-checking the Headlines."</li>
                              <li>• GroupM, PubMatic, SeenThis (2024). "Green Advertising: European Case Study on Adaptive Video."</li>
                              <li>• Teads (2024). "Reducing Emissions through Attention Metrics."</li>
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Digital Advertising Industry</p>
                            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• AdGreen (2024). Carbon Calculator Methodology.</li>
                              <li>• IAB Europe (2024). "Mapping of Greenhouse Gas Estimation Solutions in Digital Advertising."</li>
                              <li>• EDF & Havas (2024). "Sustainable Programmatic Advertising with Greenbids."</li>
                              <li>• OMD UK (2024). "Using Sharethrough's GreenPMPs to Offset Ad Emissions."</li>
                            </ul>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Cloud Infrastructure & Storage</p>
                            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Greenly (2024). "What is the carbon footprint of data storage?" Research on data center energy consumption.</li>
                              <li>• Cloudflare (2023). Sustainability Report.</li>
                              <li>• GreenGeeks (2024). Green Web Hosting.</li>
                              <li>• Nexd (2023). "Building a More Sustainable Ad Server."</li>
                            </ul>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Hardware & Lifecycle Analysis</p>
                            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• ResearchGate (2022). "Life Cycle Assessment of the Framework Laptop 2022."</li>
                              <li>• Hugging Face & Carnegie Mellon University (2023). "Sustainability and AI Inference Emissions."</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">AI Model Energy Consumption</p>
                          <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Sustainability by Numbers (2024). "Carbon Footprint of ChatGPT." Analysis of language model energy consumption and token-based emissions.</li>
                            <li>• PlanBe.Eco (2024). "AI's Carbon Footprint in Content Creation."</li>
                            <li>• Kumar, A. and Davenport, T. (2023). "How to Make Generative AI Greener." <em>Harvard Business Review</em>.</li>
                            <li>• Liu, V. and Yin, Y. (2024). "Green AI: exploring carbon footprints, mitigation strategies, and trade offs in large language model training." <em>Discover Artificial Intelligence</em>.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Limitations & Notes */}
                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Info className="text-amber-600 dark:text-amber-400 mr-2 h-5 w-5" />
                      Important Notes & Limitations
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <p>
                        <strong>Estimates Only:</strong> These calculations provide reasonable estimates based on available research, but actual emissions may vary depending on specific technologies, energy sources, and operational practices.
                      </p>
                      <p>
                        <strong>Regional Variations:</strong> Carbon intensity varies significantly by geographic region due to different electricity grid compositions (renewable vs. fossil fuel sources).
                      </p>
                      <p>
                        <strong>Scope Boundaries:</strong> Calculations focus on operational emissions and allocated manufacturing impacts. Indirect effects like office operations, employee commuting, and some supply chain emissions are not included.
                      </p>
                      <p>
                        <strong>Continuous Updates:</strong> As technology improves and new research emerges, emission factors are regularly updated to reflect current best practices and measurements.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>
    </div>
  );
}
