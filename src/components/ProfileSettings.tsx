
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, LogOut, ArrowLeft, Check, User, Mail, Globe, ListFilter, X, Plus, AlertCircle, Upload } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
  onBack: () => void;
}

const AVAILABLE_TOPICS = [
  "Technology", "Politics", "Business", "Science", 
  "Health", "Entertainment", "Sports", "Environment"
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", 
  "Australia", "Global"
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate, onLogout, onBack }) => {
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    topics: profile.topics || [],
    sensitiveTopics: profile.sensitiveTopics || []
  });
  const [saved, setSaved] = useState(false);
  const [newSensitiveTopic, setNewSensitiveTopic] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleChange('profileImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleTopic = (topic: string) => {
    const currentTopics = formData.topics || [];
    if (currentTopics.includes(topic)) {
      handleChange('topics', currentTopics.filter(t => t !== topic));
    } else {
      handleChange('topics', [...currentTopics, topic]);
    }
  };

  const addSensitiveTopic = () => {
    if (newSensitiveTopic.trim() && !formData.sensitiveTopics.includes(newSensitiveTopic.trim())) {
      handleChange('sensitiveTopics', [...formData.sensitiveTopics, newSensitiveTopic.trim()]);
      setNewSensitiveTopic("");
    }
  };

  const removeSensitiveTopic = (topic: string) => {
    handleChange('sensitiveTopics', formData.sensitiveTopics.filter(t => t !== topic));
  };

  const handleSave = () => {
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-500 hover:text-brand-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Profile & Settings</h2>
        </div>
        <button 
          onClick={onLogout}
          className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Personal Details */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <User size={16} /> Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-2">
              <div className="h-24 w-24 rounded-full bg-amber-200 flex items-center justify-center text-black text-3xl font-bold overflow-hidden shadow-lg border-4 border-white shrink-0">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'G'
                )}
              </div>
              
              <div className="flex-1 w-full space-y-3">
                <div 
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={`w-full p-4 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-300'}`}
                    onClick={() => document.getElementById('settings-file-upload')?.click()}
                >
                    <Upload className={`transition-colors ${isDragging ? 'text-brand-600' : 'text-slate-400'}`} size={20} />
                    <p className="text-xs font-medium text-slate-500">Drag & drop or click to upload</p>
                    <input 
                        id="settings-file-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Or Image URL</label>
                    <input 
                        type="text" 
                        value={formData.profileImage || ''}
                        onChange={(e) => handleChange('profileImage', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm"
                    />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                 <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                 />
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Globe size={16} /> Region & Content
          </h3>
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <select 
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
          
          <div 
              onClick={() => handleChange('prioritizeLocal', !formData.prioritizeLocal)}
              className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4 ${formData.prioritizeLocal ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
          >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${formData.prioritizeLocal ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white'}`}>
                  {formData.prioritizeLocal && <Check size={12} />}
              </div>
              <div>
                  <h4 className="font-bold text-slate-800 text-sm">Prioritize Local News</h4>
                  <p className="text-xs text-slate-500">Show more stories from {formData.country}.</p>
              </div>
          </div>
        </section>

        {/* Detox Settings */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ListFilter size={16} /> Detox Preferences
          </h3>
          <div className="space-y-3">
            <div 
                onClick={() => handleChange('avoidHarmfulContent', !formData.avoidHarmfulContent)}
                className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4 ${formData.avoidHarmfulContent ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${formData.avoidHarmfulContent ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white'}`}>
                    {formData.avoidHarmfulContent && <Check size={12} />}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">Avoid Harmful Content</h4>
                    <p className="text-xs text-slate-500">Filter out graphic violence and distressing news.</p>
                </div>
            </div>

            <div 
                onClick={() => handleChange('neutralizeNegativeNews', !formData.neutralizeNegativeNews)}
                className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4 ${formData.neutralizeNegativeNews ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${formData.neutralizeNegativeNews ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white'}`}>
                    {formData.neutralizeNegativeNews && <Check size={12} />}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">Neutralize Negative News</h4>
                    <p className="text-xs text-slate-500">Rewrite sensationalist headlines into constructive language.</p>
                </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl">
                <label className="block text-sm font-bold text-slate-800 mb-1">Daily Capacity Limit</label>
                <p className="text-xs text-slate-500 mb-3">Maximum number of news stories to read per day.</p>
                <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="5"
                    value={formData.capacityLimit}
                    onChange={(e) => handleChange('capacityLimit', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                    <span>5 stories</span>
                    <span className="text-brand-600">{formData.capacityLimit} stories</span>
                    <span>50 stories</span>
                </div>
            </div>
          </div>
        </section>

        {/* Topics */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ListFilter size={16} /> Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  formData.topics.includes(topic) 
                  ? 'bg-slate-800 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        {/* Sensitive Topics */}
        <section className="space-y-4 p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500" /> Sensitive Topics
            </h3>
            <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase">
              Detox Active
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Add keywords or topics that you are sensitive to. Our AI will automatically **neutralize** or **filter** news containing these words to protect your mental wellbeing.
          </p>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newSensitiveTopic}
              onChange={(e) => setNewSensitiveTopic(e.target.value)}
              placeholder="e.g. Accidents, War, Pandemics, Death"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && addSensitiveTopic()}
            />
            <button 
              onClick={addSensitiveTopic}
              className="px-4 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="text-sm font-bold">Add</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Sensitive List</h4>
            <div className="flex flex-wrap gap-2">
              {formData.sensitiveTopics.map(topic => (
                <span 
                  key={topic}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-orange-200 text-orange-700 rounded-xl text-xs font-bold shadow-sm animate-in fade-in zoom-in duration-200"
                >
                  {topic}
                  <button 
                    onClick={() => removeSensitiveTopic(topic)}
                    className="text-orange-300 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {formData.sensitiveTopics.length === 0 && (
                <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                   <AlertCircle size={24} className="mb-2 opacity-20" />
                   <p className="text-xs italic">No sensitive topics added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Add Suggestions */}
          <div className="pt-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Common Triggers</h4>
            <div className="flex flex-wrap gap-2">
              {["Death", "Accidents", "War", "Crime", "Sickness", "Natural Disasters"].filter(t => !formData.sensitiveTopics.includes(t)).map(topic => (
                <button
                  key={topic}
                  onClick={() => handleChange('sensitiveTopics', [...formData.sensitiveTopics, topic])}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-bold transition-colors"
                >
                  + {topic}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
           <button 
             onClick={handleSave}
             className={`px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 transition-all ${saved ? 'bg-emerald-500' : 'bg-brand-600 hover:bg-brand-700'}`}
           >
             {saved ? <Check size={18} /> : <Save size={18} />}
             {saved ? 'Saved' : 'Save Changes'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileSettings;
