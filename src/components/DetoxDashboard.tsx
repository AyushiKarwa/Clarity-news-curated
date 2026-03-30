
import React from 'react';
import { DetoxStats } from '../types';
import { ShieldCheck, Clock, Brain, Sparkles, Ban } from 'lucide-react';

interface DetoxDashboardProps {
  stats: DetoxStats;
  mentalWellbeingMode: boolean;
  onToggleMentalWellbeing: () => void;
}

const DetoxDashboard: React.FC<DetoxDashboardProps> = ({ stats, mentalWellbeingMode, onToggleMentalWellbeing }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Quality Filter</p>
            <p className="text-2xl font-bold text-slate-800">{stats.qualityFilter}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Time Saved</p>
            <p className="text-2xl font-bold text-slate-800">{stats.timeSaved}m</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-full text-purple-600">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Mental Load</p>
            <p className="text-2xl font-bold text-slate-800">{stats.mentalLoad}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 rounded-full text-orange-600">
            <Ban size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Rejected Content</p>
            <p className="text-2xl font-bold text-slate-800">{stats.userRejectedArticles}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Recent Detox Activity</h3>
                        <p className="text-xs text-slate-500 mt-1">Real-time log of how we're protecting your feed</p>
                    </div>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full uppercase tracking-wider">Live Protection</span>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {stats.recentEvents && stats.recentEvents.length > 0 ? (
                        stats.recentEvents.map((event) => (
                            <div key={event.id} className="flex gap-4 p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                                <div className={`mt-1 p-2 rounded-lg shrink-0 ${event.type === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {event.type === 'blocked' ? <Ban size={18} /> : <Sparkles size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-brand-600 transition-colors">
                                            {event.title}
                                        </h4>
                                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        <span className={`font-bold uppercase text-[9px] mr-2 px-1.5 py-0.5 rounded ${event.type === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                            {event.type}
                                        </span>
                                        {event.reason}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <ShieldCheck size={32} />
                            </div>
                            <p className="text-slate-400 text-sm italic">No detox events recorded yet today.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Summary Card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles size={24} />
                        Your Daily Detox Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-brand-100 text-sm leading-relaxed">
                                Today, Clarity has filtered your news to ensure a healthier mental state. We've reclaimed <span className="font-bold text-white underline decoration-brand-300 underline-offset-4">{stats.timeSaved} minutes</span> of your time by removing sensationalist noise.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-700 bg-brand-500 flex items-center justify-center text-[10px] font-bold">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs text-brand-200">Protected against {stats.harmfulContentBlocked} major triggers today</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-brand-200 uppercase mb-1">Feed Purity</p>
                                <p className="text-3xl font-black">{stats.qualityFilter}%</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-brand-200 uppercase mb-1">Mental Load</p>
                                <p className="text-3xl font-black">{stats.mentalLoad}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-brand-400/10 rounded-full blur-3xl"></div>
            </div>
        </div>

        {/* Weaning Control */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Detox Protocol</h3>
                <p className="text-slate-500 text-sm mb-6">
                    Protect your mental health by automatically limiting exposure to high-stress topics and sensationalist headlines that can negatively impact your stress levels.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Mental Wellbeing Mode</span>
                        <button 
                            onClick={onToggleMentalWellbeing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${mentalWellbeingMode ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mentalWellbeingMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Currently Filtering</h4>
                        <div className="flex flex-wrap gap-2">
                            {stats.topicsAvoided.map(topic => (
                                <span key={topic} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center italic">
                    "Information is food for the mind. Choose nutritious sources."
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DetoxDashboard;
