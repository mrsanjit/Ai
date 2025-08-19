import React, { useState, useCallback, useRef, ChangeEvent, useMemo } from 'react';
import { DashboardElementSpec, ProcessedChartData, ProcessedKPIData, DataRow, GeminiDashboardResponse, ChartDescriptor, FileData, DrillDownFilterState } from '../types';
import DashboardItem from './DashboardItem';
import { processDashboardElement, exportDataToCsv } from '../services/dataProcessor';
import { getAnomalyInsightsFromGemini, getForecastFromGemini } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal'; 
import RefineInput from './RefineInput';

declare var marked: any; 
declare var html2canvas: any; 

// Icons
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline-block mr-1.5 align-text-bottom">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.468 3.468a.75.75 0 0 0 .53 1.28h1.841l.475 4.593.872 1.281c.321.472.996.472 1.317 0l.873-1.281.475-4.593h1.841a.75.75 0 0 0 .53-1.28l-3.468-3.468-4.753-.39-1.83-4.401Z" clipRule="evenodd" />
    </svg>
);
const CodeBracketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline-block mr-1.5 align-text-bottom">
        <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 0 1 0 1.06L3.56 9.25l2.72 2.97a.75.75 0 0 1-1.06 1.06L1.97 10.03a.75.75 0 0 1 0-1.06l3.25-3.5a.75.75 0 0 1 1.06 0Zm7.44 0a.75.75 0 0 1 1.06 0l3.25 3.5a.75.75 0 0 1 0 1.06l-3.25 3.5a.75.75 0 0 1-1.06-1.06L16.44 9.25l-2.72-2.97a.75.75 0 0 1 0-1.06ZM11.344 3.027a.75.75 0 0 1 .632 1.341l-2.5 11.5a.75.75 0 0 1-1.452-.314l2.5-11.5a.75.75 0 0 1 .82-.527Z" clipRule="evenodd" />
    </svg>
);
const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);
const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 text-slate-400">
      <path d="M10 2.5a.75.75 0 0 0-7.383 5.433c.23.033.463.05.707.05h13.352c.244 0 .477-.017.708-.05A.75.75 0 0 0 10 2.5ZM2.808 9.434c-.033-.24-.05-.48-.05-.734h14.484c0 .254-.017.494-.05.734A2.5 2.5 0 0 0 14.5 11.9a2.5 2.5 0 0 0 2.232 1.466c.033.24.05.48.05.734h-1.071a.75.75 0 0 0-.75.75c0 .414.336.75.75.75h.321V16a2.5 2.5 0 0 0-2.5-2.5h-1.53a.75.75 0 0 0-.75.75c0 .414.336.75.75.75H12A2.5 2.5 0 0 1 9.5 17h-1A2.5 2.5 0 0 1 6 14.5H5.25a.75.75 0 0 0-.75-.75.75.75 0 0 0-.75.75H3.429V14.1a.75.75 0 0 0 .75-.75.75.75 0 0 0 .75.75h.321a2.5 2.5 0 0 0 2.5-2.5h-1.53a.75.75 0 0 0-.75.75c0 .414.336.75.75.75H8A2.5 2.5 0 0 1 5.5 17h-1A2.5 2.5 0 0 1 2 14.5v-.434c0-.254.017-.494.05-.734A2.5 2.5 0 0 0 4.5 11.9a2.5 2.5 0 0 0-2.232-1.466Z" />
    </svg>
);
const XMarkSmallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
);
const DownloadDashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5">
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
      <path d="M13 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM8.5 6a3.5 3.5 0 0 0-3.181 2.053.75.75 0 0 0 1.362.794A2.001 2.001 0 0 1 8.5 7.5h3a2.001 2.001 0 0 1 1.819 1.347.75.75 0 1 0 1.362-.794A3.5 3.5 0 0 0 11.5 6h-3Z" />
      <path d="M15.5 11.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM5.5 11.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      <path d="M10 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );

interface DashboardProps {
  dashboardData: GeminiDashboardResponse | null; 
  rawData: DataRow[] | null; 
  originalFileData: FileData | null; 
  isLoading: boolean;
  currentPrompt?: string; 
  activeFiltersCount?: number; 
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  drillDownFilter: DrillDownFilterState | null;
  onChartElementClick: (column: string, value: any) => void;
  onClearDrillDownFilter: () => void;
  onFocusChart: (spec: ChartDescriptor, data: ProcessedChartData) => void;
  onRefine: (prompt: string) => void;
  onSaveAndShare: () => string;
  onToggleListening: () => void;
  isListening: boolean;
  voiceError: string | null;
  onChartTypeChange: (elementId: string, newType: ChartDescriptor['type']) => void;
}

const availableThemes: Record<string, string> = {
  "default": "Default Vibrant",
  "ocean_breeze": "Ocean Breeze",
  "executive_dark": "Executive Dark",
  "autumn_analytics": "Autumn Analytics",
  "vibrant_growth": "Vibrant Growth",
  "monochrome_professional": "Monochrome Pro",
  "sunset_glow": "Sunset Glow",
  "forest_depth": "Forest Depth",
  "tech_circuitry": "Tech Circuitry",
  "futuristic_dark": "Futuristic Dark" 
};


const Dashboard: React.FC<DashboardProps> = ({ 
    dashboardData, 
    rawData, 
    originalFileData, 
    isLoading, 
    currentPrompt, 
    activeFiltersCount = 0,
    selectedTheme,
    onThemeChange,
    drillDownFilter,
    onChartElementClick,
    onClearDrillDownFilter,
    onFocusChart,
    onRefine,
    onSaveAndShare,
    onToggleListening,
    isListening,
    voiceError,
    onChartTypeChange
}) => {
  const [analyzingAnomalyForElementId, setAnalyzingAnomalyForElementId] = useState<string | null>(null);
  const [anomalyInsightResult, setAnomalyInsightResult] = useState<{ title: string; content: string } | null>(null);
  const [anomalyError, setAnomalyError] = useState<string | null>(null);
  const [showGeneratedSql, setShowGeneratedSql] = useState(false);
  const [sqlCopyButtonText, setSqlCopyButtonText] = useState("Copy SQL");
  const sqlCodeRef = useRef<HTMLElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [forecastData, setForecastData] = useState<Record<string, { data: DataRow[], explanation: string }>>({});
  const [forecastingElementId, setForecastingElementId] = useState<string | null>(null);

  const effectiveTheme = dashboardData?.themeSuggestion === "futuristic_dark" ? "futuristic_dark" : selectedTheme;

  const processedElements = useMemo(() => {
    if (!dashboardData?.elements || !rawData) return [];
    return dashboardData.elements.map(elementSpec => ({
      spec: elementSpec,
      data: processDashboardElement(rawData, elementSpec)
    }));
  }, [rawData, dashboardData]);

  const handleAnalyzeAnomaly = useCallback(async (elementSpec: ChartDescriptor, processedData: ProcessedChartData) => {
    if (!originalFileData || !originalFileData.columns || !originalFileData.rows) {
      setAnomalyError("Original data context is missing. Cannot perform anomaly analysis.");
      setAnomalyInsightResult({ title: `Anomaly Analysis Error for ${elementSpec.title}`, content: "Original data context is missing." });
      return;
    }
    
    setAnalyzingAnomalyForElementId(elementSpec.id);
    setAnomalyError(null);
    setAnomalyInsightResult({ title: `Anomaly Analysis: ${elementSpec.title}`, content: "" });

    try {
      await getAnomalyInsightsFromGemini(
        elementSpec,
        processedData,
        originalFileData.columns,
        originalFileData.rows,
        (chunk: string) => { // Streaming callback
          setAnomalyInsightResult(prev => {
            if (!prev) return { title: `Anomaly Analysis: ${elementSpec.title}`, content: chunk };
            return { ...prev, content: prev.content + chunk };
          });
        }
      );
    } catch (err) {
      console.error("Anomaly analysis error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setAnomalyError(`Failed to get anomaly insights: ${message}`);
      setAnomalyInsightResult(prev => ({ ...prev!, content: prev!.content + `\n\n**Error:** ${message}` }));
    }
  }, [originalFileData]);

  const handleRequestForecast = useCallback(async (elementSpec: ChartDescriptor, processedData: ProcessedChartData) => {
    if (!processedData?.data || processedData.data.length < 2) {
      alert("Not enough data to perform a forecast.");
      return;
    }
    setForecastingElementId(elementSpec.id);
    try {
        const { forecastedData, forecastExplanation } = await getForecastFromGemini(elementSpec, processedData);
        if (forecastedData && forecastedData.length > 0) {
            setForecastData(prev => ({
                ...prev,
                [elementSpec.id]: { data: forecastedData, explanation: forecastExplanation }
            }));
        } else {
            alert(`AI could not generate a forecast. Reason: ${forecastExplanation || "No data returned."}`);
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        alert(`An error occurred while forecasting: ${message}`);
        console.error("Forecast error:", err);
    } finally {
        setForecastingElementId(null);
    }
  }, []);

  const handleClearForecast = useCallback((elementId: string) => {
      setForecastData(prev => {
          const newForecasts = { ...prev };
          delete newForecasts[elementId];
          return newForecasts;
      });
  }, []);


  const handleExportChartData = useCallback((processedData: ProcessedChartData, title: string) => {
    const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    exportDataToCsv(processedData.data, `${cleanTitle}.csv`);
  }, []);

  const handleExportDashboard = useCallback(async () => {
    if (!dashboardRef.current || typeof html2canvas === 'undefined') {
        alert('Could not export dashboard. Element not found or export library missing.');
        return;
    }
    setIsExporting(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Short delay for render
        const canvas = await html2canvas(dashboardRef.current, {
            backgroundColor: '#0f172a', // slate-900 background
            scale: 1.5,
            useCORS: true,
            logging: false,
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        const dashboardTitle = dashboardData?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'dashboard';
        link.href = image;
        link.download = `${dashboardTitle}_export.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting dashboard as PNG:', error);
        alert('Failed to export dashboard. See console for details.');
    } finally {
        setIsExporting(false);
    }
  }, [dashboardData?.title]);

  const closeAnomalyModal = () => {
    setAnomalyInsightResult(null);
    setAnomalyError(null);
    setAnalyzingAnomalyForElementId(null); 
  };

  const handleCopySql = useCallback(() => {
    if (sqlCodeRef.current && (dashboardData?.generatedQuery || (dashboardData?.elements?.length === 0 && dashboardData?.generatedQuery) ) ) {
      const queryToCopy = dashboardData?.generatedQuery;
      if (queryToCopy) {
        navigator.clipboard.writeText(queryToCopy).then(() => {
          setSqlCopyButtonText("Copied!");
          setTimeout(() => setSqlCopyButtonText("Copy SQL"), 2000);
        }).catch(err => {
          console.error("Failed to copy SQL: ", err);
          setSqlCopyButtonText("Error Copying");
          setTimeout(() => setSqlCopyButtonText("Copy SQL"), 2000);
        });
      }
    }
  }, [dashboardData?.generatedQuery, dashboardData?.elements]);

  const handleShareClick = () => {
    const url = onSaveAndShare();
    navigator.clipboard.writeText(url).then(() => {
        setIsShareCopied(true);
        setTimeout(() => setIsShareCopied(false), 2000);
    });
  }


  if (isLoading && !analyzingAnomalyForElementId && !forecastingElementId) { 
    return <LoadingSpinner message="Generating dashboard elements..." />;
  }
  
  const dashboardSpecElements = dashboardData?.elements;
  const dashboardTitleText = dashboardData?.title || (currentPrompt ? `Results for: "${currentPrompt}"` : "Generated Dashboard");
  const dashboardStory = dashboardData?.dashboardStory;
  const generatedQuery = dashboardData?.generatedQuery;


  if (dashboardSpecElements && dashboardSpecElements.length === 1 && dashboardSpecElements[0].id.startsWith("error_element_")) {
      const errorSpec = dashboardSpecElements[0];
      let userFriendlyMessage = "The AI encountered an issue generating the dashboard. ";
      
      if (errorSpec.id === "error_element_spec_parse") {
          userFriendlyMessage += `The AI's response was not in the correct format. (Details: ${errorSpec.title}). Please try rephrasing your query. Check the console for the raw AI response.`;
      } else if (errorSpec.id === "error_element_spec_structure") {
          userFriendlyMessage += "The AI's response structure was invalid. Please try again. Check console for details.";
      } else if (errorSpec.id === "error_element_api") {
          userFriendlyMessage += `${errorSpec.title}. This could be due to API key issues, network problems, or an internal AI error. Please check the console.`;
      } else {
           userFriendlyMessage += "An unexpected error occurred with the AI. Please check the console.";
      }
      
      const displayTitle = errorSpec.title && !errorSpec.title.toLowerCase().includes("error:") ? errorSpec.title : "AI Response Error";
      const errorData: ProcessedChartData = { 
          data: [{ Message: userFriendlyMessage }], 
          metricKeys: ["Message"], 
          chartType: "Table",
          dimensionKey: undefined 
      };
      return (
        <div className="p-4 md:p-6 h-full flex flex-col">
            {dashboardTitleText && <h1 className="text-3xl font-bold text-slate-100 mb-4 text-center flex-shrink-0">{dashboardTitleText}</h1>}
            <div className="flex-grow">
                <DashboardItem 
                    elementSpec={{...errorSpec, title: displayTitle}}
                    processedData={errorData} 
                    themeSuggestion={effectiveTheme}
                    onAnalyzeAnomaly={async () => {}}
                    isAnalyzingAnomaly={false}
                    onChartElementClick={onChartElementClick}
                    onFocusChart={onFocusChart}
                    onExportChartData={handleExportChartData}
                    onChartTypeChange={onChartTypeChange}
                    onForecast={handleRequestForecast}
                    onClearForecast={handleClearForecast}
                    isForecasting={false}
                    forecast={undefined}
                />
            </div>
        </div>
      )
  }

  if (!dashboardSpecElements || dashboardSpecElements.length === 0) {
    let message = "Upload data and ask a question to see your dashboard.";
    let subMessage = "The AI will generate visualizations based on your query.";
    let showStoryAndSqlInEmptyState = false;

    if (currentPrompt && originalFileData && originalFileData.columns.length > 0) { 
        message = `The AI couldn't generate visual elements for your request: "${currentPrompt}".`;
        subMessage = "Consider rephrasing your query, checking your data, or reviewing any AI narrative or SQL shown below if available.";
        showStoryAndSqlInEmptyState = true; 
    } else if (originalFileData && originalFileData.columns.length > 0 && !currentPrompt) {
        message = "Your data is loaded. Ask a question to generate a dashboard.";
        subMessage = `Using file: ${originalFileData.name}`;
    }

    const storyContentForEmptyState = dashboardData?.dashboardStory;
    const queryContentForEmptyState = dashboardData?.generatedQuery;

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center">
        {showStoryAndSqlInEmptyState && storyContentForEmptyState && (
          <div className="mb-6 p-4 bg-accent-700/20 backdrop-blur-sm border border-accent-600/30 rounded-lg shadow-lg max-w-4xl w-full">
            <h2 className="text-lg font-semibold text-accent-300 mb-2">
              <SparklesIcon /> AI Narrative Overview
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{storyContentForEmptyState}</p>
          </div>
        )}
        {showStoryAndSqlInEmptyState && queryContentForEmptyState && (
          <div className="mb-6 p-4 bg-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-lg max-w-4xl w-full">
            <button
              onClick={() => setShowGeneratedSql(!showGeneratedSql)}
              className="w-full flex items-center justify-between text-left text-md font-semibold text-slate-300 hover:text-primary-300 focus:outline-none py-2"
              aria-expanded={showGeneratedSql}
              aria-controls="generated-sql-content-empty"
            >
              <span className="flex items-center"><CodeBracketIcon /> View AI-Attempted SQL Query</span>
              <svg className={`w-5 h-5 transform transition-transform duration-200 ${showGeneratedSql ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showGeneratedSql && (
              <div id="generated-sql-content-empty" className="mt-3 pt-3 border-t border-slate-600">
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-md text-xs overflow-x-auto max-h-60 custom-scrollbar-dark">
                  <code ref={sqlCodeRef}>{queryContentForEmptyState}</code>
                </pre>
                <button
                  onClick={handleCopySql}
                  className="mt-3 flex items-center px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-md shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-primary-400"
                  disabled={sqlCopyButtonText !== "Copy SQL"}
                >
                  {sqlCopyButtonText === "Copied!" ? <CheckIcon /> : <ClipboardIcon />}
                  {sqlCopyButtonText}
                </button>
              </div>
            )}
          </div>
        )}
        <div className={`w-full ${ (showStoryAndSqlInEmptyState && (storyContentForEmptyState || queryContentForEmptyState)) ? 'mt-4' : '' } bg-slate-700/30 backdrop-blur-md rounded-xl shadow-xl border border-slate-600/50 p-8`}>
            <svg className="w-20 h-20 text-slate-500 mb-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7c0-1.1.9-2 2-2h10a2 2 0 012 2v8a2 2 0 01-2 2z"></path></svg>
            <h2 className="text-2xl font-semibold text-slate-100">{message}</h2>
            <p className="text-slate-400 mt-2">{subMessage}</p>
        </div>
      </div>
    );
  }
  
  const noDataWithFiltersMessage = (
    <div className="p-2 sm:p-4 md:p-6 flex flex-col h-full items-center justify-center text-center">
      {dashboardTitleText && <h1 className="text-3xl font-bold text-slate-100 mb-3 text-center flex-shrink-0">{dashboardTitleText}</h1>}
      {drillDownFilter && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-accent-600/40 text-accent-100 rounded-full text-sm font-medium shadow-md">
          <span>Drilled down on: <strong>{drillDownFilter.column} = {String(drillDownFilter.value)}</strong></span>
            <button
                onClick={onClearDrillDownFilter}
                className="p-0.5 hover:bg-accent-500/50 rounded-full"
                title="Clear drill-down filter"
                aria-label="Clear drill-down filter"
            >
                <XMarkSmallIcon />
            </button>
        </div>
      )}
      {dashboardStory && !drillDownFilter && ( 
        <div className="mb-6 p-4 bg-accent-700/20 backdrop-blur-sm border border-accent-600/30 rounded-lg shadow-lg max-w-4xl mx-auto w-full">
          <h2 className="text-lg font-semibold text-accent-300 mb-2">
            <SparklesIcon /> AI Narrative Overview
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">{dashboardStory}</p>
        </div>
      )}
       {generatedQuery && !drillDownFilter && ( 
          <div className="mb-6 p-4 bg-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-lg max-w-4xl mx-auto w-full">
            <button
              onClick={() => setShowGeneratedSql(!showGeneratedSql)}
              className="w-full flex items-center justify-between text-left text-lg font-semibold text-slate-300 hover:text-primary-300 focus:outline-none"
              aria-expanded={showGeneratedSql}
              aria-controls="generated-sql-content"
            >
              <span><CodeBracketIcon /> AI Generated SQL Query</span>
              <svg className={`w-5 h-5 transform transition-transform duration-200 ${showGeneratedSql ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showGeneratedSql && (
              <div id="generated-sql-content" className="mt-3 pt-3 border-t border-slate-600">
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-md text-xs overflow-x-auto max-h-60 custom-scrollbar-dark">
                  <code ref={sqlCodeRef}>{generatedQuery}</code>
                </pre>
                <button
                  onClick={handleCopySql}
                  className="mt-3 flex items-center px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-md shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-primary-400"
                  disabled={sqlCopyButtonText !== "Copy SQL"}
                >
                  {sqlCopyButtonText === "Copied!" ? <CheckIcon /> : <ClipboardIcon />}
                  {sqlCopyButtonText}
                </button>
              </div>
            )}
          </div>
        )}
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-700/30 backdrop-blur-md rounded-lg shadow-xl border border-slate-600/50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-primary-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h3m-3 0h-3m0 0V7.5m0 3v3" />
          </svg>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">No Data Matches Filters</h2>
          <p className="text-slate-400">
            {drillDownFilter ? "The current drill-down combined with other filters results in no data." : "Try adjusting or clearing the applied filters to see dashboard elements."}
          </p>
      </div>
    </div>
  );

  if ((activeFiltersCount > 0 || drillDownFilter) && (!rawData || rawData.length === 0)) {
    return noDataWithFiltersMessage;
  }
  
  return (
    <>
      <div className="p-2 sm:p-4 md:p-6 flex flex-col h-full overflow-y-auto">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            {dashboardTitleText && <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center sm:text-left flex-shrink-0 order-1 sm:order-none">{dashboardTitleText}</h1>}
            <div className="flex items-center gap-2 order-none sm:order-1 self-center sm:self-auto">
                <div className="relative">
                    <label htmlFor="theme-selector" className="sr-only">Select Theme</label>
                    <div className="flex items-center bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-md shadow-md px-2 py-1.5 hover:border-slate-500">
                        <PaletteIcon />
                        <select
                            id="theme-selector"
                            value={effectiveTheme}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => onThemeChange(e.target.value)}
                            className="text-xs text-slate-300 font-medium bg-transparent border-none focus:ring-0 focus:outline-none appearance-none pr-5 cursor-pointer"
                        >
                            {Object.entries(availableThemes).map(([value, label]) => (
                            <option key={value} value={value} className="bg-slate-700 text-slate-200">{label}</option>
                            ))}
                        </select>
                        <svg className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                </div>
                <button
                    onClick={handleShareClick}
                    className="flex items-center text-xs font-medium px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm text-slate-200 rounded-md shadow-md border border-slate-600 disabled:opacity-50 transition-colors"
                    title="Copy shareable link to dashboard"
                    >
                    {isShareCopied ? <CheckIcon /> : <ShareIcon />}
                    {isShareCopied ? 'Link Copied!' : 'Share'}
                </button>
                <button
                    onClick={handleExportDashboard}
                    disabled={isExporting}
                    className="flex items-center text-xs font-medium px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm text-slate-200 rounded-md shadow-md border border-slate-600 disabled:opacity-50 disabled:cursor-wait transition-colors"
                    title="Export entire dashboard as PNG"
                >
                    {isExporting ? (
                        <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Exporting...
                        </>
                    ) : (
                        <>
                        <DownloadDashboardIcon />
                        Export
                        </>
                    )}
                </button>
            </div>
        </div>

        {drillDownFilter && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-accent-600/40 text-accent-100 rounded-full text-sm font-medium shadow-md self-start">
                <span>Drilled down on: <strong>{drillDownFilter.column} = {String(drillDownFilter.value)}</strong></span>
                <button
                    onClick={onClearDrillDownFilter}
                    className="p-0.5 hover:bg-accent-500/50 rounded-full"
                    title="Clear drill-down filter"
                    aria-label="Clear drill-down filter"
                >
                    <XMarkSmallIcon />
                </button>
            </div>
        )}
        
        {dashboardStory && (
          <div className="mb-6 p-4 bg-accent-700/20 backdrop-blur-sm border border-accent-600/30 rounded-lg shadow-lg max-w-4xl mx-auto w-full">
            <h2 className="text-lg font-semibold text-accent-300 mb-2">
              <SparklesIcon /> AI Narrative Overview
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{dashboardStory}</p>
          </div>
        )}

        {generatedQuery && (
          <div className="mb-6 p-4 bg-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-lg max-w-4xl mx-auto w-full">
            <button
              onClick={() => setShowGeneratedSql(!showGeneratedSql)}
              className="w-full flex items-center justify-between text-left text-md font-semibold text-slate-300 hover:text-primary-300 focus:outline-none py-2"
              aria-expanded={showGeneratedSql}
              aria-controls="generated-sql-content-main"
            >
              <span className="flex items-center"><CodeBracketIcon /> View AI-Generated SQL Query</span>
              <svg className={`w-5 h-5 transform transition-transform duration-200 ${showGeneratedSql ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showGeneratedSql && (
              <div id="generated-sql-content-main" className="mt-3 pt-3 border-t border-slate-600">
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-md text-xs overflow-x-auto max-h-60 custom-scrollbar-dark">
                  <code ref={sqlCodeRef}>{generatedQuery}</code>
                </pre>
                <button
                  onClick={handleCopySql}
                  className="mt-3 flex items-center px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-md shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-primary-400"
                  disabled={sqlCopyButtonText !== "Copy SQL"}
                >
                  {sqlCopyButtonText === "Copied!" ? <CheckIcon /> : <ClipboardIcon />}
                  {sqlCopyButtonText}
                </button>
              </div>
            )}
          </div>
        )}

        <div ref={dashboardRef} className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-6 auto-rows-fr">
          {processedElements.map(({ spec: elementSpec, data: processedData }) => { 
            let itemSpanClasses = "md:col-span-3 lg:col-span-4"; 

            switch(elementSpec.type) {
              case 'KPI':
                itemSpanClasses = "md:col-span-2 lg:col-span-3";
                break;
              case 'Table':
                itemSpanClasses = "md:col-span-6 lg:col-span-12"; 
                break;
              case 'PieChart':
              case 'Histogram': 
                 itemSpanClasses = "md:col-span-3 lg:col-span-4";
                 break;
              // Larger charts for Line, Bar, Area, Scatter
              case 'LineChart':
              case 'BarChart':
              case 'AreaChart':
              case 'ScatterPlot':
              case 'MapChart':
                 itemSpanClasses = "md:col-span-6 lg:col-span-6"; // Default larger size
                 if ((processedData as ProcessedChartData)?.data?.length > 20 && elementSpec.type !== 'ScatterPlot') {
                     itemSpanClasses = "md:col-span-6 lg:col-span-8"; // Even larger for long data series
                 }
                break;
              default:
                itemSpanClasses = "md:col-span-3 lg:col-span-4";
            }
            
            return (
              <div key={elementSpec.id} className={`${itemSpanClasses}`}>
                  <DashboardItem
                    elementSpec={elementSpec}
                    processedData={processedData}
                    themeSuggestion={effectiveTheme} 
                    onAnalyzeAnomaly={handleAnalyzeAnomaly}
                    isAnalyzingAnomaly={analyzingAnomalyForElementId === elementSpec.id}
                    onChartElementClick={onChartElementClick}
                    onFocusChart={onFocusChart}
                    onExportChartData={handleExportChartData}
                    onChartTypeChange={onChartTypeChange}
                    onForecast={handleRequestForecast}
                    onClearForecast={handleClearForecast}
                    isForecasting={forecastingElementId === elementSpec.id}
                    forecast={forecastData[elementSpec.id]}
                  />
              </div>
            );
          })}
        </div>
        
        {dashboardSpecElements && dashboardSpecElements.length > 0 && (
          <div className="mt-auto pt-6 flex-shrink-0">
            <RefineInput 
              onRefine={onRefine} 
              disabled={isLoading}
              onToggleListening={onToggleListening}
              isListening={isListening}
              voiceError={voiceError}
            />
          </div>
        )}
      </div>
      
      <Modal
        isOpen={!!anomalyInsightResult || !!anomalyError || (!!analyzingAnomalyForElementId && !anomalyInsightResult && !anomalyError)}
        onClose={closeAnomalyModal}
        title={anomalyInsightResult?.title || (analyzingAnomalyForElementId ? "Analyzing Anomalies..." : "Anomaly Analysis")}
        size="lg"
      >
        {analyzingAnomalyForElementId && !anomalyInsightResult?.content && !anomalyError && (
          <LoadingSpinner message="AI is analyzing for anomalies..." />
        )}
        {anomalyError && !analyzingAnomalyForElementId && (
          <div className="text-red-400">
            <h4 className="font-semibold">Error:</h4>
            <p>{anomalyError}</p>
          </div>
        )}
        {anomalyInsightResult && (
          <div 
            className="prose prose-sm prose-invert max-w-none text-slate-300" // prose-invert for dark mode
            dangerouslySetInnerHTML={{ __html: marked.parse(anomalyInsightResult.content) }} 
          />
        )}
      </Modal>
      <style>
        {`
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
          border-radius: 3px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #475569; /* slate-600 */
          border-radius: 3px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* slate-500 */
        }
        .prose-invert h1, .prose-invert h2, .prose-invert h3, .prose-invert h4, .prose-invert h5, .prose-invert h6 {
            color: #f1f5f9; /* slate-100 */
        }
        .prose-invert p, .prose-invert li, .prose-invert blockquote {
             color: #cbd5e1; /* slate-300 */
        }
        .prose-invert code { 
            color: #e2e8f0; /* slate-200 */
            background-color: #334155; /* slate-700 */
        }
        .prose-invert pre {
            background-color: #0f172a; /* slate-900 */
            color: #e2e8f0; /* slate-200 */
        }
        .prose-invert blockquote {
            border-left-color: #475569; /* slate-600 */
        }
      `}
      </style>
    </>
  );
};

export default Dashboard;