
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Check, ArrowRight, Globe, User, ListFilter, Upload } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const AVAILABLE_TOPICS = [
  "Technology", "Politics", "Business", "Science", 
  "Health", "Entertainment", "Sports", "Environment"
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", 
  "Australia", "Global"
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("India");
  const [email, setEmail] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [prioritizeLocal, setPrioritizeLocal] = useState(true);
  const [profileImage, setProfileImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
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

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleComplete = () => {
    onComplete({
      name: name || "User",
      email: email || "",
      country,
      topics: selectedTopics,
      prioritizeLocal,
      detoxLevel: 'medium',
      avoidHarmfulContent: true,
      neutralizeNegativeNews: true,
      sensitiveTopics: [],
      capacityLimit: 10,
      profileImage: profileImage || undefined
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-calm-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= i ? 'bg-brand-500' : 'bg-slate-100'}`}></div>
            ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                    <User size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Welcome to Clarity</h2>
                <p className="text-slate-500">Let's personalize your detox experience.</p>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col items-center mb-4">
                    <div className="h-24 w-24 rounded-full bg-amber-200 flex items-center justify-center text-black text-3xl font-bold overflow-hidden shadow-lg border-4 border-white mb-4">
                        {profileImage ? (
                            <img src={profileImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'G'
                        )}
                    </div>
                    
                    <div 
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={`w-full p-4 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}
                        onClick={() => document.getElementById('onboarding-file-upload')?.click()}
                    >
                        <Upload className={`transition-colors ${isDragging ? 'text-brand-600' : 'text-slate-400'}`} size={24} />
                        <p className="text-xs font-medium text-slate-500">Drag & drop or click to upload</p>
                        <input 
                            id="onboarding-file-upload"
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">What should we call you?</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
                        placeholder="Your Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL (Optional)</label>
                    <input 
                        type="text" 
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
                        placeholder="Or paste an image URL here"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Where are you based?</label>
                    <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
                    >
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <button 
                onClick={() => setStep(2)}
                disabled={!name}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                Next <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                        <ListFilter size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Your Interests</h2>
                    <p className="text-slate-500">Select topics you want to focus on.</p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                    {AVAILABLE_TOPICS.map(topic => (
                        <button
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                selectedTopics.includes(topic) 
                                ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                     <button 
                        onClick={() => setStep(1)}
                        className="w-1/3 bg-slate-100 text-slate-600 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                        Back
                    </button>
                    <button 
                        onClick={() => setStep(3)}
                        disabled={selectedTopics.length === 0}
                        className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {step === 3 && (
             <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <Globe size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Final Adjustments</h2>
                    <p className="text-slate-500">Customize your feed priority.</p>
                </div>

                <div 
                    onClick={() => setPrioritizeLocal(!prioritizeLocal)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${prioritizeLocal ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${prioritizeLocal ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white'}`}>
                        {prioritizeLocal && <Check size={14} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Prioritize {country} News</h4>
                        <p className="text-xs text-slate-500">Your feed will show more stories from your region.</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-600 text-center italic">
                        "You are all set to experience a cleaner, calmer information diet."
                    </p>
                </div>

                <div className="flex gap-3">
                     <button 
                        onClick={() => setStep(2)}
                        className="w-1/3 bg-slate-100 text-slate-600 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleComplete}
                        className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
                    >
                        Start Detox
                    </button>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
