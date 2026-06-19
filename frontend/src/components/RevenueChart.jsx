import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Reusable Revenue Chart component matching the TikXpress dark UI dashboard layout
const RevenueChart = ({ data = [], title = "Revenue Analytics", subtitle = "Revenue growth overview" }) => {
    
    // Safety check: Extract raw array if wrapped in an object response template { success: true, data: [...] }
    const rawDataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

    // Safety check: Map and normalize any backend response structure dynamically
    const normalizedData = rawDataArray.map(item => {
        // Detect time label: prioritizes 'date', then 'name', then fallback to '_id' or 'month'
        const label = item.date || item.name || item._id || item.month || 'N/A';
        
        // Detect financial value: prioritizes 'revenue', then 'totalRevenue', then fallback to 'amount' or 0
        const value = Number(item.revenue !== undefined ? item.revenue : (item.totalRevenue !== undefined ? item.totalRevenue : (item.amount || 0)));
        
        return {
            chartLabel: label,
            chartValue: value
        };
    });

    return (
        // Styled with smooth dark slate background and borders matching TikXpress dark UI dashboard
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl w-full h-[350px] flex flex-col justify-between">
            {/* Dynamic Header Section - Uses props passed from the dashboard layout */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
                <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            
            {/* Chart Container - Fixed height section ensuring Recharts rendering engine activates properly */}
            <div className="w-full h-[220px] relative">
                {/* minWidth and minHeight prevents the chart from collapsing inside Flexbox layout */}
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={normalizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {/* Smooth glowing green gradient definition for the area fill */}
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        {/* Dark grid lines blending with the workspace background */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        
                        {/* Uses the safely normalized keys so charts always render regardless of backend schema */}
                        <XAxis 
                            dataKey="chartLabel" 
                            stroke="#64748b" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={10} 
                        />
                        <YAxis 
                            stroke="#64748b" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false}
                            tickMargin={8}
                        />
                        
                        {/* Tooltip customized to dark palette with clean drop-shadow formatting */}
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#0f172a', 
                                borderRadius: '12px', 
                                border: '1px solid #334155', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                color: '#fff'
                            }}
                            formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                        />
                        {/* Styled line stroke with emerald green matching the live stats card components */}
                        <Area type="monotone" dataKey="chartValue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;