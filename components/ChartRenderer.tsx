import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, AreaChart, Area, Brush } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { ProcessedChartData, DataRow } from '../types';

interface ChartRendererProps {
  processedData: ProcessedChartData;
  themeSuggestion?: string;
  onChartElementClick?: (dimensionKey: string, value: any) => void;
  forecastData?: DataRow[];
}

// Define more extensive color palettes
const themeColorMapping: Record<string, string[]> = {
  "ocean_breeze": ['#3B82F6', '#10B981', '#0EA5E9', '#6366F1', '#8B5CF6', '#A78BFA', '#06B6D4', '#2DD4BF'],
  "executive_dark": ['#60A5FA', '#818CF8', '#A78BFA', '#F472B6', '#FBBF24', '#34D399', '#93C5FD', '#FBCFE8'], // Lighter for dark BG
  "autumn_analytics": ['#F59E0B', '#F97316', '#D97706', '#EF4444', '#DC2626', '#B91C1C', '#EAB308', '#CA8A04'],
  "vibrant_growth": ['#10B981', '#84CC16', '#22C55E', '#F59E0B', '#EC4899', '#3B82F6', '#D946EF', '#0EA5E9'],
  "monochrome_professional": ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'], // Blues for dark
  "sunset_glow": ['#F97316', '#EF4444', '#EC4899', '#D946EF', '#F59E0B', '#FACC15', '#EAB308', '#F87171'], 
  "forest_depth": ['#34D399', '#6EE7B7', '#A7F3D0', '#10B981', '#059669', '#047857', '#065F46', '#064E3B'], 
  "tech_circuitry": ['#0EA5E9', '#06B6D4', '#2DD4BF', '#3B82F6', '#60A5FA', '#1E40AF', '#4F46E5', '#6D28D9'], 
  "futuristic_dark": ['#3BFEFF', '#FF00E5', '#00FF97', '#FFD700', '#FF4E00', '#ADFF2F', '#007FFF', '#BA55D3'], // Neon accents
  "default": ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#6366f1', '#84cc16'], // Primary blue, accent teal, orange, pink
};


const ChartRenderer: React.FC<ChartRendererProps> = ({ processedData, themeSuggestion, onChartElementClick, forecastData }) => {
  if (!processedData || !processedData.data) {
    return <p className="text-slate-400 p-4 text-center">No data available to display for this chart.</p>;
  }

  const { data: historicalData, dimensionKey, metricKeys, chartType } = processedData;
  const activeTheme = themeSuggestion === "executive_dark" || themeSuggestion === "monochrome_professional" || themeSuggestion === "futuristic_dark" ? themeSuggestion : (themeSuggestion || "default");
  const COLORS = themeColorMapping[activeTheme] || themeColorMapping["default"];

  const displayData = useMemo(() => {
    if (!forecastData || forecastData.length === 0 || !dimensionKey) {
        return historicalData;
    }

    const historicalPart = historicalData.map(d => {
        const point: DataRow = { [dimensionKey]: d[dimensionKey] };
        metricKeys.forEach(key => {
            point[key] = d[key];
            point[`${key}_forecast`] = null;
        });
        return point;
    });

    const forecastPart = forecastData.map(d => {
        const point: DataRow = { [dimensionKey]: d[dimensionKey] };
        metricKeys.forEach(key => {
            point[key] = null;
            point[`${key}_forecast`] = d[key];
        });
        return point;
    });

    // Connect the lines by adding the last historical value to the first forecast point
    const lastHistorical = historicalPart[historicalPart.length - 1];
    if (lastHistorical && forecastPart.length > 0) {
        metricKeys.forEach(key => {
            forecastPart[0][key] = lastHistorical[key];
        });
    }

    return [...historicalPart, ...forecastPart];
  }, [historicalData, forecastData, dimensionKey, metricKeys]);

  if (displayData.length === 0) {
    return <p className="text-slate-400 p-4 text-center">No data available to display for this chart.</p>;
  }


  const handleBarClick = (barData: any) => {
    if (onChartElementClick && dimensionKey && barData && barData.activePayload && barData.activePayload.length > 0) {
      const clickedPayload = barData.activePayload[0].payload;
      if (clickedPayload && clickedPayload.hasOwnProperty(dimensionKey)) {
        const clickedValue = clickedPayload[dimensionKey];
        onChartElementClick(dimensionKey, clickedValue);
      } else {
        console.warn("Bar click: dimensionKey not found in payload or payload missing.", { dimensionKey, payload: clickedPayload });
      }
    }
  };
  

  const handlePieClick = (pieData: any, index: number) => {
    if (onChartElementClick && dimensionKey && pieData && pieData.name !== undefined) { 
        onChartElementClick(dimensionKey, pieData.name);
    } else {
        console.warn("Pie click: onChartElementClick, dimensionKey, or pieData.name is missing.", { dimensionKey, pieData });
    }
  };


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/80 backdrop-blur-md p-3 border border-slate-600 rounded-lg shadow-xl text-sm">
          {label && <p className="label font-bold text-slate-100 mb-1.5">{`${dimensionKey || 'Category'}: ${label}`}</p>}
          {payload.map((entry: any, index: number) => {
            if (chartType === 'ScatterPlot' && entry.payload) {
                const xKey = metricKeys[0];
                const yKey = metricKeys[1];
                const categoryDataKey = dimensionKey; 
                return (
                    <div key={`item-${index}`} className="my-1">
                        {categoryDataKey && entry.payload[categoryDataKey] !== undefined && (
                            <p className="font-semibold text-slate-200" style={{color: entry.color || entry.fill}}>
                                {`${categoryDataKey}: ${entry.payload[categoryDataKey]}`}
                            </p>
                        )}
                        <p style={{ color: entry.color || entry.fill }} className="text-slate-300">{`${xKey}: ${entry.payload[xKey]?.toLocaleString(undefined, { maximumFractionDigits: 2})}`}</p>
                        <p style={{ color: entry.color || entry.fill }} className="text-slate-300">{`${yKey}: ${entry.payload[yKey]?.toLocaleString(undefined, { maximumFractionDigits: 2})}`}</p>
                    </div>
                );
            }
            let displayName = entry.name || entry.dataKey;
            if (chartType === 'PieChart' && entry.name) { 
                displayName = entry.name;
            }

            if (displayName.endsWith('_forecast')) {
                displayName = `${displayName.replace('_forecast', '')} (Forecast)`;
            }

            return (
                <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="my-0.5 text-slate-300">
                {`${displayName} : ${typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2}) : entry.value}`}
                </p>
            );
          })}
        </div>
      );
    }
    return null;
  };
  
  const formatYAxisTick = (value: any) => {
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
      if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString(undefined, {maximumFractionDigits: 0});
    }
    return value;
  };
  
  const formatXAxisTick = (value: any) => {
    if (typeof value === 'string' && value.length > 15) return `${value.substring(0,12)}...`;
    if (typeof value === 'number') return formatYAxisTick(value); 
    return value;
  }

  const tickStyle = { fontSize: '0.75rem', fill: '#94a3b8' }; // slate-400
  const legendStyle = { fontSize: "0.75rem", paddingTop: '10px', color: '#cbd5e1' }; // slate-300
  const commonMargin = { top: 10, right: 25, left: 15, bottom: (displayData.length > 8 && chartType !== 'PieChart' ? 45 : 25) };
  const commonXAxisProps = { 
      dataKey: dimensionKey, 
      tick: tickStyle, 
      angle: (displayData.length > 8 && chartType !== 'ScatterPlot' && chartType !== 'Table' && chartType !== 'Histogram' ? -35 : 0), 
      textAnchor: (displayData.length > 8 && chartType !== 'ScatterPlot' && chartType !== 'Table' && chartType !== 'Histogram' ? 'end' : 'middle'), 
      interval: 0, 
      height: (displayData.length > 8 && chartType !== 'ScatterPlot' && chartType !== 'Table' && chartType !== 'Histogram' ? 55 : 35),
      tickFormatter: formatXAxisTick,
      stroke: "#475569" // slate-600
  };
  const commonYAxisProps = { tickFormatter: formatYAxisTick, tick: tickStyle, width: 70, stroke: "#475569" }; // slate-600
  const brushProps = { dataKey: dimensionKey, height: 25, stroke: COLORS[0], fill: `${COLORS[0]}55` }; // Increased fill opacity slightly

  const chartElementClickableClass = onChartElementClick ? "cursor-pointer" : "";

  switch (chartType) {
    case 'BarChart':
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={displayData} 
            margin={commonMargin} 
            barGap={4} 
            barCategoryGap="20%" 
            onClick={onChartElementClick ? handleBarClick : undefined} 
            className={chartElementClickableClass}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" /> {/* slate-700 */}
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}/> {/* slate-500 with alpha */}
            <Legend wrapperStyle={legendStyle}/>
            {metricKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[5, 5, 0, 0]} />
            ))}
            { displayData.length > 10 && <Brush {...brushProps} /> }
          </BarChart>
        </ResponsiveContainer>
      );
    case 'Histogram': 
        const histogramMetricKey = metricKeys[0] || 'count'; 
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={displayData} margin={commonMargin} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" /> {/* slate-700 */}
              <XAxis dataKey={dimensionKey}  tick={tickStyle} angle={-30} textAnchor="end" interval={0} height={50} tickFormatter={formatXAxisTick} stroke="#475569"/>
              <YAxis {...commonYAxisProps} allowDecimals={false} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset:-5, style: tickStyle }}/>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}/>
              <Legend wrapperStyle={legendStyle}/>
              <Bar dataKey={histogramMetricKey} fill={COLORS[0]} radius={[5, 5, 0, 0]} name={processedData.metricKeys[0] || 'Count'}/>
            </BarChart>
          </ResponsiveContainer>
        );
    case 'LineChart':
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={displayData} margin={commonMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" /> {/* slate-700 */}
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(100, 116, 139, 0.3)', strokeWidth: 1 }}/>
            <Legend wrapperStyle={legendStyle}/>
            {metricKeys.map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} activeDot={{ r: 7, strokeWidth: 2, stroke: '#1e293b' }} dot={{r: 4, strokeWidth:1, stroke: COLORS[index % COLORS.length], fill:'#1e293b'}} />
            ))}
            {forecastData && metricKeys.map((key, index) => (
              <Line key={`${key}_forecast`} name={`${key} (Forecast)`} type="monotone" dataKey={`${key}_forecast`} stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} strokeDasharray="5 5" activeDot={{ r: 7, strokeWidth: 2, stroke: '#1e293b' }} dot={{r: 4, strokeWidth:1, stroke: COLORS[index % COLORS.length], fill:'#1e293b'}} connectNulls />
            ))}
            { displayData.length > 10 && <Brush {...brushProps} /> }
          </LineChart>
        </ResponsiveContainer>
      );
    case 'AreaChart':
      return (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={displayData} margin={commonMargin}>
            <defs>
              {metricKeys.map((key, index) => (
                <linearGradient key={`gradient-${key}`} id={`colorArea${key.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                  <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
              {forecastData && metricKeys.map((key, index) => (
                 <linearGradient key={`gradient-forecast-${key}`} id={`colorAreaForecast${key.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" /> {/* slate-700 */}
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(100, 116, 139, 0.3)', strokeWidth: 1 }}/>
            <Legend wrapperStyle={legendStyle}/>
            {metricKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                fill={`url(#colorArea${key.replace(/\s+/g, '')})`} 
                strokeWidth={2.5} 
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#1e293b' }} 
                dot={{r:4, strokeWidth:1, stroke: COLORS[index % COLORS.length], fill:'#1e293b'}}
                stackId={metricKeys.length > 1 ? "stack1" : undefined} 
              />
            ))}
             {forecastData && metricKeys.map((key, index) => (
              <Area 
                key={`${key}_forecast`} 
                name={`${key} (Forecast)`}
                type="monotone" 
                dataKey={`${key}_forecast`} 
                stroke={COLORS[index % COLORS.length]} 
                fill={`url(#colorAreaForecast${key.replace(/\s+/g, '')})`} 
                strokeWidth={2.5}
                strokeDasharray="5 5"
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#1e293b' }} 
                dot={{r:4, strokeWidth:1, stroke: COLORS[index % COLORS.length], fill:'#1e293b'}}
                stackId={metricKeys.length > 1 ? "stack1" : undefined} 
                connectNulls
              />
            ))}
            { displayData.length > 10 && <Brush {...brushProps} /> }
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'PieChart': 
      const pieDimensionKey = dimensionKey || 'name'; 
      const pieMetricKey = metricKeys[0] || 'value'; 
      const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
          const RADIAN = Math.PI / 180;
          const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          if (percent * 100 < 4) return null; 

          const hexColor = fill.replace("#", "");
          const r = parseInt(hexColor.substring(0, 2), 16);
          const g = parseInt(hexColor.substring(2, 4), 16);
          const b = parseInt(hexColor.substring(4, 6), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          const textColor = brightness > 125 ? '#1f293b' : '#f8fafc'; // slate-800 or slate-50

          return (
            <text x={x} y={y} fill={textColor} textAnchor="middle" dominantBaseline="central" fontSize="0.7rem" fontWeight="medium">
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          );
        };
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={"80%"}
              innerRadius={"40%"} 
              fill="#8884d8" 
              dataKey={pieMetricKey}
              nameKey={pieDimensionKey} 
              paddingAngle={1}
              onClick={onChartElementClick ? handlePieClick : undefined}
              className={chartElementClickableClass}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1e293b" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={legendStyle} iconSize={10}/>
          </PieChart>
        </ResponsiveContainer>
      );
    case 'ScatterPlot': 
        const xKey = metricKeys[0];
        const yKey = metricKeys[1];
        const categoryDimensionKey = dimensionKey; 

        let scatterElements: React.ReactNode;

        if (categoryDimensionKey && displayData.some(item => item[categoryDimensionKey!] !== undefined)) {
          const groupedData = (displayData as DataRow[]).reduce<Record<string, DataRow[]>>((acc, item) => {
            const groupVal = item[categoryDimensionKey!]; 
            const key = String(groupVal === undefined || groupVal === null ? 'Other' : groupVal);
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
          }, {});

          scatterElements = Object.entries(groupedData).map(([groupName, groupItems], index) => (
            <Scatter
              key={groupName || `scatter-${index}`}
              name={groupName || `Series ${index + 1}`}
              data={groupItems} 
              fill={COLORS[index % COLORS.length]}
              shape="circle"
            />
          ));
        } else {
          scatterElements = <Scatter name={metricKeys.slice(0,2).join(' vs ')} data={displayData} fill={COLORS[0]} shape="circle" />;
        }
        
      return (
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{...commonMargin, left: 25}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" /> {/* slate-700 */}
            <XAxis type="number" dataKey={xKey} name={xKey} tick={tickStyle} angle={0} textAnchor='middle' interval="preserveStartEnd" height={35} tickFormatter={formatXAxisTick} domain={['auto', 'auto']} stroke="#475569"/>
            <YAxis type="number" dataKey={yKey} name={yKey} {...commonYAxisProps} domain={['auto', 'auto']}/>
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(100, 116, 139, 0.5)' }} />
            <Legend wrapperStyle={legendStyle}/>
            {scatterElements}
          </ScatterChart>
        </ResponsiveContainer>
      );
    case 'MapChart':
        if (metricKeys.length < 3) {
            return <p className="text-slate-400 p-4 text-center">Map chart requires at least 3 metrics (latitude, longitude, value).</p>;
        }
        const latKey = metricKeys[0];
        const lonKey = metricKeys[1];
        const valueKey = metricKeys[2];
        const labelKey = dimensionKey;

        const mapData = displayData.map(d => ({
            lat: parseFloat(d[latKey]),
            lon: parseFloat(d[lonKey]),
            value: parseFloat(d[valueKey]),
            label: labelKey ? d[labelKey] : `${valueKey}: ${d[valueKey] ? d[valueKey].toLocaleString() : 'N/A'}`
        })).filter(d => !isNaN(d.lat) && !isNaN(d.lon) && !isNaN(d.value));

        if (mapData.length === 0) {
            return <p className="text-slate-400 p-4 text-center">No valid geographic data points found.</p>;
        }
        
        const bounds = mapData.length > 0
          ? [[Math.min(...mapData.map(d => d.lat)), Math.min(...mapData.map(d => d.lon))], [Math.max(...mapData.map(d => d.lat)), Math.max(...mapData.map(d => d.lon))]]
          : [[51.505, -0.09], [51.51, -0.1]];
        
        const values = mapData.map(d => d.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        
        const getRadius = (value: number) => {
            if (maxVal === minVal) return 10;
            // Scale radius from 5 to 25 based on value
            const scale = (value - minVal) / (maxVal - minVal);
            return 5 + scale * 20;
        };

      return (
        <MapContainer bounds={bounds as LatLngBoundsExpression} style={{ height: '100%', width: '100%' }} zoom={10}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.carto.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {mapData.map((point, index) => (
            <CircleMarker
              key={index}
              center={[point.lat, point.lon]}
              radius={getRadius(point.value)}
              pathOptions={{ 
                  color: COLORS[2 % COLORS.length],
                  fillColor: COLORS[0 % COLORS.length],
                  fillOpacity: 0.6,
                  weight: 1
              }}
            >
              <Popup>
                  <b>{point.label}</b><br/>
                  {valueKey}: {point.value.toLocaleString()}
              </Popup>
              <LeafletTooltip>
                   <b>{point.label}</b><br/>
                   {valueKey}: {point.value.toLocaleString()}
              </LeafletTooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      );
    case 'Table':
      return (
        <div className="overflow-x-auto max-h-[22rem] rounded-lg border border-slate-600 shadow-lg bg-slate-700/50 backdrop-blur-sm">
          <table className="min-w-full divide-y divide-slate-600 text-xs sm:text-sm">
            <thead className="bg-slate-800/70 sticky top-0 z-10">
              <tr>
                {metricKeys.map(key => (
                  <th key={key} scope="col" className="px-4 py-3 text-left font-semibold text-slate-300 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-slate-600">
              {displayData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-600/50 transition-colors duration-100">
                  {metricKeys.map(key => (
                    <td key={`${rowIndex}-${key}`} className="px-4 py-2.5 whitespace-nowrap text-slate-300">
                      { typeof row[key] === 'number' ? row[key].toLocaleString(undefined, {maximumFractionDigits: 2}) : String(row[key] ?? 'N/A')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return <p className="text-slate-400">Unsupported chart type: {chartType}</p>;
  }
};

export default ChartRenderer;