import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', submissions: 12, engagement: 240 },
  { name: 'Tue', submissions: 18, engagement: 450 },
  { name: 'Wed', submissions: 45, engagement: 980 },
  { name: 'Thu', submissions: 30, engagement: 1200 },
  { name: 'Fri', submissions: 68, engagement: 1890 },
  { name: 'Sat', submissions: 90, engagement: 2390 },
  { name: 'Sun', submissions: 120, engagement: 3490 },
];

export const AnalyticsPreview: React.FC = () => {
  return (
    <section className="py-32 bg-slate-900 relative overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        <div className="lg:w-1/2">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Real-time insights for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">data-driven growth</span>
          </h2>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            Stop guessing. Track submission volume, judge progress, and campaign performance in real-time. 
            Identify bottlenecks instantly.
          </p>
          <ul className="space-y-4 text-slate-300">
            {[
              { color: 'bg-indigo-500', text: "Submission heatmaps" },
              { color: 'bg-purple-500', text: "Judge scoring consistency analysis" },
              { color: 'bg-cyan-500', text: "Revenue & entry fee tracking" }
            ].map((item, idx) => (
              <motion.li 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center group cursor-default"
              >
                <span className={`w-2 h-2 rounded-full ${item.color} mr-3 group-hover:scale-125 transition-transform`}></span>
                <span className="group-hover:text-white transition-colors font-medium">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div 
          className="lg:w-1/2 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-white font-semibold text-lg">Performance</h3>
                <p className="text-xs text-slate-400">Live data from last 7 days</p>
              </div>
              <select className="bg-black/20 text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1.5 outline-none hover:border-white/20 transition-colors">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="engagement" stroke="#818cf8" fillOpacity={1} fill="url(#colorEngagement)" strokeWidth={2} />
                  <Area type="monotone" dataKey="submissions" stroke="#c084fc" fillOpacity={1} fill="url(#colorSubmissions)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};