import React, { useRef, useState, useMemo } from 'react';
import { DashboardElementSpec, ProcessedChartData, ProcessedKPIData, ChartDescriptor, DataRow } from '../types';
import KPI from './KPI';
import ChartRenderer from './ChartRenderer';
import ErrorMessage from './ErrorMessage';

declare var html2canvas: any;


const LightBulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
        <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v1.256a.75.75 0 0 1-.504.706C9.177 5.111 8.5 6.16 8.5 7.25V9.5a.75.75 0 0 0 1.5 0V8a1 1 0 0 1 1-1h.25a.75.75 0 0 0 .75-.75V2.75A.75.75 0 0 1 10 2ZM10 6a2.5 2.5 0 0 0-2.5 2.5V9.5a2.25 2.25 0 0 0 2.25 2.25h.5a2.25 2.25 0 0 0 2.25-2.25V8.5A2.5 2.5 0 0 0 10 6Z" clipRule="evenodd" />
        <path d="M4.75 9.5A5.25 5.25 0 0 0 10 14.75a5.25 5.25 0 0 0 5.25-5.25V8.5A5.25 5.25 0 0 0 10 3.25a5.25 5.25 0 0 0-5.25 5.25V9.5ZM10 18a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-1.5 0v1.5A.75.75 0 0 0 10 18ZM10 5a.75.75 0 0 0 .75-.75V2.75a.75.75 0 0 0-1.5 0V4.25A.75.75 0 0 0 10 5Z" />
        <path d="m6.095 6.095-.01-.01a.75.75 0 0 0-1.061 1.061l.01.01a.75.75 0 0 0 1.06-1.06l.001-.001ZM14.966 13.9l-.01.01a.75.75 0 1 0 1.06 1.06l.01-.01a.75.75 0 0 0-1.06-1.06v0Z" />
        <path d="M13.905 6.095a.75.75 0 0 0-1.06-1.06l-.01.01a.75.75 0 0 0 1.06 1.06l.01-.01ZM6.034 13.9l.01.01a.75.75 0 0 0 1.06 1.06l-.01-.01a.75.75 0 1 0-1.06-1.06Z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );

const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
      <path d="M3 3.75A.75.75 0 0 1 3.75 3h4.5a.75.75 0 0 1 0 1.5h-2.54l2.295 2.295a.75.75 0 0 1-1.06 1.06L5.25 5.61V8.25a.75.75 0 0 1-1.5 0v-4.5ZM12.75 3a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.61l-2.295 2.295a.75.75 0 1 1-1.06-1.06L11.74 3.75h-2.54a.75.75 0 0 1 0-1.5h4.5ZM3.75 12.75a.75.75 0 0 1 0-1.5h2.54l-2.295-2.295a.75.75 0 1 1 1.06-1.06L8.25 10.64V8.25a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75Zm12.5 0a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h2.54l-2.295-2.295a.75.75 0 0 1 1.06-1.06L14.75 10.64V8.25a.75.75 0 0 1 1.5 0v4.5Z" />
    </svg>
);

const DocumentCsvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25ZM8.5 6a.75.75 0 0 1 .75.75v.518l1.47-1.47a.75.75 0 0 1 1.06 1.06l-1.47 1.47h.518a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 1 .75-.75Zm-2.25 6A.75.75 0 0 1 7 11.25v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 6.25 12Zm3.75 3a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-.75-.75Zm3.75-2.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
    </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
    <path d="M15.5 2.047a.75.75 0 0 0-1.06-1.06L12.5 2.939l-2.05-2.05a.75.75 0 0 0-1.061 0l-2.05 2.05L5.39 1.037a.75.75 0 0 0-1.06 1.06l1.95 1.95-2.05 2.05a.75.75 0 0 0 0 1.06l2.05 2.05-1.95 1.95a.75.75 0 1 0 1.06 1.06l1.95-1.95 2.05 2.05a.75.75 0 0 0 1.06 0l2.05-2.05 1.95 1.95a.75.75 0 0 0 1.06-1.06L15.061 10.5l1.95-1.95a.75.75 0 0 0 0-1.06l-1.95-1.95 1.95-1.95Z" />
    <path d="M2.5 14.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5ZM5.5 16a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 5.5 16ZM2.5 11.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5ZM8.5 16a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 8.5 16Z" />
  </svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-sky-400">
        <path d="M3.5 3.75a.75.75 0 0 0-1.5 0v1.5h-1.5a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5h-1.5v-1.5Zm8.54 4.04a.75.75 0 0 0-1.08-1.04l-2.05 1.79-1.3-1.3a.75.75 0 0 0-1.06 1.06l1.82 1.82a.75.75 0 0 0 1.06 0l2.5-2.18Z" />
        <path d="M15.5 2.5a.75.75 0 0 0-1.5 0v6.63l-2.73-2.39a.75.75 0 0 0-1.04 1.08l3.25 2.84a.75.75 0 0 0 1.04 0l3.25-2.84a.75.75 0 0 0-1.04-1.08L15.5 9.13V2.5Z" />
        <path d="M4.5 12.5a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 5.75 18h8.5A2.75 2.75 0 0 0 17 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);


const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-11.707a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" clipRule="evenodd" />
    </svg>
  );

interface DashboardItemProps {
  elementSpec: DashboardElementSpec;
  processedData: ProcessedKPIData | ProcessedChartData | null | { error: boolean; message: string; title?: string };
  themeSuggestion?: string;
  onAnalyzeAnomaly: (elementSpec: ChartDescriptor, processedData: ProcessedChartData) => Promise<void>;
  isAnalyzingAnomaly: boolean;
  onChartElementClick: (column: string, value: any) => void;
  onFocusChart: (spec: ChartDescriptor, data: ProcessedChartData) => void;
  onExportChartData: (processedData: ProcessedChartData, title: string) => void;
  onChartTypeChange: (elementId: string, newType: ChartDescriptor['type']) => void;
  onForecast: (elementSpec: ChartDescriptor, processedData: ProcessedChartData) => void;
  onClearForecast: (elementId: string) => void;
  isForecasting: boolean;
  forecast?: { data: DataRow[]; explanation: string };
}

const DashboardItem: React.FC<DashboardItemProps> = ({ 
    elementSpec, 
    processedData, 
    themeSuggestion, 
    onAnalyzeAnomaly,
    isAnalyzingAnomaly,
    onChartElementClick,
    onFocusChart,
    onExportChartData,
    onChartTypeChange,
    onForecast,
    onClearForecast,
    isForecasting,
    forecast
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isChartTypeMenuOpen, setIsChartTypeMenuOpen] = useState(false);

  const compatibleChartTypes = useMemo((): ChartDescriptor['type'][] => {
    const commonTypes: ChartDescriptor['type'][] = ['BarChart', 'LineChart', 'AreaChart', 'Table'];
    switch(elementSpec.type) {
        case 'BarChart':
        case 'LineChart':
        case 'AreaChart':
            return commonTypes.filter(t => t !== elementSpec.type);
        case 'PieChart':
            return ['BarChart', 'Table'];
        default:
            return [];
    }
  }, [elementSpec.type]);

  const handleExportPNG = async () => {
    if (chartContainerRef.current && typeof html2canvas !== 'undefined') {
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); 

        const canvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: null, // Transparent background for the canvas itself
          scale: 2, 
          useCORS: true, 
          logging: false, 
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = `${elementSpec.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chart'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting chart as PNG:', error);
        alert('Failed to export chart as PNG. See console for details.');
      }
    } else {
      alert('Chart element not found or html2canvas not loaded.');
    }
  };


  if (!processedData) {
    return (
      <div className="p-4 bg-slate-700/40 backdrop-blur-md rounded-xl shadow-lg min-h-[200px] flex flex-col items-center justify-center border border-slate-600/70">
        <h3 className="text-md font-semibold text-slate-100 mb-2 truncate max-w-full" title={elementSpec.title}>{elementSpec.title}</h3>
        <p className="text-slate-400 text-sm">No data to display.</p>
      </div>
    );
  }

  if (processedData && 'error' in processedData && (processedData as any).error) {
     const errorInfo = processedData as { error: boolean; message: string; title?: string };
    return (
        <div className="p-4 bg-slate-700/40 backdrop-blur-md rounded-xl shadow-lg min-h-[200px] border border-red-500/50">
             <h3 className="text-md font-semibold text-red-400 mb-2 truncate max-w-full" title={elementSpec.title}>{elementSpec.title}</h3>
            <ErrorMessage title={`Error in: ${errorInfo.title || elementSpec.title}`} message={errorInfo.message} />
        </div>
    );
  }

  const isChart = ['BarChart', 'LineChart', 'AreaChart', 'PieChart', 'ScatterPlot', 'Histogram', 'Table', 'MapChart'].includes(elementSpec.type);
  const canAnalyze = isChart && !['PieChart', 'ScatterPlot', 'Histogram', 'Table', 'MapChart'].includes(elementSpec.type) &&
                     (processedData as ProcessedChartData)?.data?.length > 0;
  
  const canForecast = isChart && ['LineChart', 'AreaChart'].includes(elementSpec.type) && (processedData as ProcessedChartData)?.data?.length > 1;


  const handleAnalysisClick = () => {
    if (canAnalyze && !isAnalyzingAnomaly) {
        onAnalyzeAnomaly(elementSpec as ChartDescriptor, processedData as ProcessedChartData);
    }
  }

  const handleForecastClick = () => {
    if(canForecast && !isForecasting) {
        onForecast(elementSpec as ChartDescriptor, processedData as ProcessedChartData);
    }
  }

  const handleFocusClick = () => {
    if (isChart && processedData && !('error' in processedData) && onFocusChart) {
        onFocusChart(elementSpec as ChartDescriptor, processedData as ProcessedChartData);
    }
  }
  
  const canDrillDown = onChartElementClick && (elementSpec.type === 'BarChart' || elementSpec.type === 'PieChart');

  return (
    <div className="bg-slate-700/40 backdrop-blur-md rounded-xl shadow-xl overflow-hidden flex flex-col h-full border border-slate-600/70 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-slate-500/80">
      <div className="p-4 border-b border-slate-600 flex justify-between items-start gap-2">
        <div className="flex-grow min-w-0"> 
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 truncate" title={elementSpec.title}>
            {elementSpec.title}
            </h3>
            {elementSpec.interpretation && (
              <div className="mt-1 flex items-start text-xs text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 mr-1.5 text-accent-400 shrink-0 opacity-80 flex-none" style={{ marginTop: '0.125em'}}> 
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM7.25 4.75a.75.75 0 0 1 1.5 0v.01a.75.75 0 0 1-1.5 0v-.01ZM7 6.25a.75.75 0 0 0 0 1.5h.008v2.2507a.75.75 0 0 0 .75.75h.483a.75.75 0 0 0 .75-.75V8.5h.008a.75.75 0 0 0 0-1.5H8.75V6.25H7Z" />
                </svg>
                <span className="italic leading-snug">{elementSpec.interpretation}</span>
              </div>
            )}
            {forecast?.explanation && (
                 <div className="mt-1.5 flex items-start text-xs text-sky-300 p-2 bg-sky-500/10 rounded-md border border-sky-500/20">
                    <TrendingUpIcon />
                    <span className="italic leading-snug ml-1.5">{forecast.explanation}</span>
                </div>
            )}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
             {isChart && compatibleChartTypes.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setIsChartTypeMenuOpen(!isChartTypeMenuOpen)}
                        onBlur={() => setTimeout(() => setIsChartTypeMenuOpen(false), 200)} // Close on blur
                        className="p-1.5 text-xs bg-slate-600/50 text-slate-200 hover:bg-slate-500/70 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center transition-colors"
                        title="Change Chart Type"
                    >
                        <ChartBarIcon />
                    </button>
                    {isChartTypeMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-20 py-1">
                            {compatibleChartTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onChartTypeChange(elementSpec.id, type);
                                        setIsChartTypeMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-primary-600"
                                >
                                    Change to {type.replace(/([A-Z])/g, ' $1').trim()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
             {isChart && (
                 <button
                    onClick={() => onExportChartData(processedData as ProcessedChartData, elementSpec.title)}
                    className="p-1.5 text-xs bg-slate-600/50 text-slate-200 hover:bg-slate-500/70 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center transition-colors"
                    title="Export Data as CSV"
                 >
                    <DocumentCsvIcon />
                 </button>
            )}
            {isChart && (
                 <button
                    onClick={handleFocusClick}
                    className="p-1.5 text-xs bg-slate-600/50 text-slate-200 hover:bg-slate-500/70 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center transition-colors"
                    title="Focus on Chart"
                 >
                    <ExpandIcon />
                 </button>
            )}
            {isChart && (
                 <button
                    onClick={handleExportPNG}
                    className="p-1.5 text-xs bg-slate-600/50 text-slate-200 hover:bg-slate-500/70 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center transition-colors"
                    title="Export as PNG"
                 >
                    <DownloadIcon />
                 </button>
            )}
            {canAnalyze && (
                <button
                    onClick={handleAnalysisClick}
                    disabled={isAnalyzingAnomaly}
                    className="p-1.5 text-xs bg-accent-600/50 text-accent-200 hover:bg-accent-500/60 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-slate-700 disabled:opacity-60 disabled:cursor-wait flex items-center transition-colors"
                    title="Analyze for Anomalies"
                >
                    {isAnalyzingAnomaly ? (
                        <>
                        <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-accent-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analysing...
                        </>
                    ) : (
                        <>
                        <LightBulbIcon />
                        Insights
                        </>
                    )}
                </button>
            )}
             {canForecast && (
                forecast ? (
                    <button
                        onClick={() => onClearForecast(elementSpec.id)}
                        className="p-1.5 text-xs bg-red-600/50 text-red-200 hover:bg-red-500/60 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-700 flex items-center transition-colors"
                        title="Clear Forecast"
                    >
                        <XCircleIcon /> Clear
                    </button>
                ) : (
                    <button
                        onClick={handleForecastClick}
                        disabled={isForecasting}
                        className="p-1.5 text-xs bg-sky-600/50 text-sky-200 hover:bg-sky-500/60 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-700 disabled:opacity-60 disabled:cursor-wait flex items-center transition-colors"
                        title="Generate Forecast"
                    >
                        {isForecasting ? (
                             <>
                             <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-sky-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Forecasting...
                             </>
                        ) : (
                            <>
                            <TrendingUpIcon />
                            Forecast
                            </>
                        )}
                    </button>
                )
            )}
        </div>
      </div>
      <div className="p-3 flex-grow flex items-center justify-center min-h-[280px] sm:min-h-[320px]" ref={chartContainerRef}> 
        {elementSpec.type === 'KPI' && <KPI data={processedData as ProcessedKPIData} />}
        {isChart && (
          <div className="w-full h-full">
            <ChartRenderer 
              processedData={processedData as ProcessedChartData} 
              themeSuggestion={themeSuggestion}
              onChartElementClick={canDrillDown ? onChartElementClick : undefined}
              forecastData={forecast?.data}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardItem;