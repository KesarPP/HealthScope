import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Brain, 
  Smartphone, 
  Shield, 
  User, 
  UserPlus, 
  LogIn, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  Smile, 
  Frown, 
  Coffee, 
  Zap, 
  AlertTriangle, 
  Leaf, 
  Phone, 
  Users, 
  MessageCircle, 
  Send,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VitalsData {
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  temperature?: number;
  oxygenSaturation?: number;
}

interface MoodData {
  mood: string;
  description?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const MOOD_OPTIONS = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
  { id: 'stressed', label: 'Stressed', icon: Frown, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
  { id: 'tired', label: 'Tired', icon: Coffee, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { id: 'energetic', label: 'Energetic', icon: Zap, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
  { id: 'anxious', label: 'Anxious', icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  { id: 'calm', label: 'Calm', icon: Leaf, color: 'text-teal-500', bgColor: 'bg-teal-50', borderColor: 'border-teal-300' },
];

const EMERGENCY_CONTACTS = [
  { name: 'Police', number: '911', icon: Shield, description: 'Emergency Services' },
  { name: 'Ambulance', number: '911', icon: Activity, description: 'Medical Emergency' },
  { name: 'Fire Dept', number: '911', icon: AlertTriangle, description: 'Fire Emergency' },
  { name: 'Family', number: '+1 (234) 567-890', icon: Users, description: 'Emergency Contact' },
];

function HealthScope() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Vitals state
  const [vitalsForm, setVitalsForm] = useState<VitalsData>({});
  const [vitalsResult, setVitalsResult] = useState<{vitals: VitalsData, analysis: string} | null>(null);
  
  // Mood state
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodDescription, setMoodDescription] = useState<string>('');
  const [moodRecommendations, setMoodRecommendations] = useState<string>('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Sakhi, your AI health assistant. I can help you with health questions, provide wellness tips, and offer guidance. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // API mutations
  const vitalsAnalysisMutation = useMutation({
    mutationFn: async (vitals: VitalsData) => {
      const response = await fetch('/api/vitals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitals),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze vitals');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setVitalsResult(data);
      toast({
        title: "Analysis Complete",
        description: "Your vitals have been analyzed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const moodRecommendationsMutation = useMutation({
    mutationFn: async (moodData: MoodData) => {
      const response = await fetch('/api/mood/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moodData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get recommendations');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setMoodRecommendations(data.recommendations);
      toast({
        title: "Recommendations Ready",
        description: "Personalized activities have been suggested for your mood.",
      });
    },
    onError: (error) => {
      toast({
        title: "Recommendations Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, history }: { message: string; history: ChatMessage[] }) => {
      const response = await fetch('/api/chat/sakhi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          chatHistory: history.map(msg => ({ role: msg.role, content: msg.content }))
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response from Sakhi');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      }]);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, chatMutation.isPending]);

  // Handle vitals form submission
  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasVitals = Object.values(vitalsForm).some(value => value !== undefined && value !== null && value !== '');
    if (!hasVitals) {
      toast({
        title: "No Vitals Entered",
        description: "Please enter at least one vital sign measurement.",
        variant: "destructive",
      });
      return;
    }
    
    vitalsAnalysisMutation.mutate(vitalsForm);
  };

  // Handle mood selection
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    const moodData: MoodData = { mood, description: moodDescription };
    moodRecommendationsMutation.mutate(moodData);
  };

  // Handle chat submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({ message: chatInput.trim(), history: chatMessages });
    setChatInput('');
  };

  // Handle quick chat questions
  const handleQuickQuestion = (question: string) => {
    setChatInput(question);
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({ message: question, history: chatMessages });
  };

  // Handle authentication placeholder
  const handleAuth = (type: 'login' | 'signup') => {
    toast({
      title: `${type === 'login' ? 'Login' : 'Sign Up'} Successful`,
      description: "Welcome to HealthScope! You can now access all features.",
    });
  };

  // Emergency contact handler
  const handleEmergencyCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="health-gradient p-2 rounded-xl">
                <Heart className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">HealthScope</h1>
                <p className="text-xs text-gray-500">Your Health Companion</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#vitals" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Vitals
              </a>
              <a href="#mood" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                <Smile className="h-4 w-4 mr-2" />
                Mood
              </a>
              <a href="#emergency" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Emergency
              </a>
              <a href="#chatbot" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Sakhi
              </a>
            </div>
            
            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" onClick={() => handleAuth('login')} className="text-blue-600 hover:text-blue-700">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
              <Button onClick={() => handleAuth('signup')} className="bg-blue-600 hover:bg-blue-700">
                Sign Up
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#vitals" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Vitals</a>
              <a href="#mood" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Mood</a>
              <a href="#emergency" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Emergency</a>
              <a href="#chatbot" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Sakhi</a>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Button variant="ghost" onClick={() => handleAuth('login')} className="w-full justify-start">
                  Login
                </Button>
                <Button onClick={() => handleAuth('signup')} className="w-full mt-2">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="health-gradient p-8 rounded-3xl text-white mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to HealthScope</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">Your comprehensive health and wellness management platform powered by AI</p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm">Secure & Private</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                <span className="text-sm">AI-Powered</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                <span className="text-sm">Mobile Friendly</span>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section id="auth" className="mb-12 grid md:grid-cols-2 gap-6">
          {/* Login Card */}
          <Card className="health-card-shadow">
            <CardHeader className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <p className="text-gray-600">Sign in to your account</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAuth('login'); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <Input type="password" placeholder="Enter your password" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Sign Up Card */}
          <Card className="health-card-shadow">
            <CardHeader className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <p className="text-gray-600">Create your account</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAuth('signup'); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input type="text" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" placeholder="Enter your email" />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Vitals Tracking Section */}
        <section id="vitals" className="mb-12">
          <Card className="health-card-shadow">
            <CardHeader className="text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-red-500" />
              </div>
              <CardTitle className="text-3xl mb-2">Vitals Tracking</CardTitle>
              <p className="text-gray-600">Track your vital signs and get AI-powered health insights</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Vitals Input Form */}
                <div>
                  <h4 className="text-xl font-semibold mb-6 flex items-center">
                    <Activity className="h-5 w-5 mr-3 text-blue-600" />
                    Record Your Vitals
                  </h4>
                  
                  <form className="space-y-6" onSubmit={handleVitalsSubmit}>
                    {/* Heart Rate */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Heart className="inline h-4 w-4 mr-2 text-red-500" />
                        Heart Rate (BPM)
                      </label>
                      <Input 
                        type="number" 
                        placeholder="72" 
                        min="40" 
                        max="200"
                        value={vitalsForm.heartRate || ''}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, heartRate: e.target.value ? Number(e.target.value) : undefined }))}
                      />
                    </div>

                    {/* Blood Pressure */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Droplets className="inline h-4 w-4 mr-2 text-blue-500" />
                        Blood Pressure
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          type="number" 
                          placeholder="120" 
                          min="70" 
                          max="200"
                          value={vitalsForm.systolicBP || ''}
                          onChange={(e) => setVitalsForm(prev => ({ ...prev, systolicBP: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                        <Input 
                          type="number" 
                          placeholder="80" 
                          min="40" 
                          max="120"
                          value={vitalsForm.diastolicBP || ''}
                          onChange={(e) => setVitalsForm(prev => ({ ...prev, diastolicBP: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Systolic / Diastolic</p>
                    </div>

                    {/* Body Temperature */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Thermometer className="inline h-4 w-4 mr-2 text-orange-500" />
                        Body Temperature (°F)
                      </label>
                      <Input 
                        type="number" 
                        placeholder="98.6" 
                        step="0.1" 
                        min="95" 
                        max="110"
                        value={vitalsForm.temperature || ''}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, temperature: e.target.value ? Number(e.target.value) : undefined }))}
                      />
                    </div>

                    {/* Oxygen Saturation */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Wind className="inline h-4 w-4 mr-2 text-green-500" />
                        Oxygen Saturation (%)
                      </label>
                      <Input 
                        type="number" 
                        placeholder="98" 
                        min="80" 
                        max="100"
                        value={vitalsForm.oxygenSaturation || ''}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, oxygenSaturation: e.target.value ? Number(e.target.value) : undefined }))}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg"
                      disabled={vitalsAnalysisMutation.isPending}
                    >
                      <Brain className="h-5 w-5 mr-2" />
                      {vitalsAnalysisMutation.isPending ? 'Analyzing...' : 'Get AI Health Insights'}
                    </Button>
                  </form>
                </div>

                {/* AI Suggestions Display */}
                <div>
                  <h4 className="text-xl font-semibold mb-6 flex items-center">
                    <Brain className="h-5 w-5 mr-3 text-green-600" />
                    AI Health Insights
                  </h4>
                  
                  {vitalsAnalysisMutation.isPending && (
                    <div className="bg-blue-50 p-6 rounded-xl text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-blue-600 font-medium">Analyzing your vitals...</p>
                    </div>
                  )}

                  {vitalsResult && (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-600" />
                        Your Latest Readings
                      </h5>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {vitalsResult.vitals.heartRate && (
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-xs text-gray-500">Heart Rate</div>
                            <div className="text-lg font-bold text-red-500">{vitalsResult.vitals.heartRate} BPM</div>
                          </div>
                        )}
                        {vitalsResult.vitals.systolicBP && vitalsResult.vitals.diastolicBP && (
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-xs text-gray-500">Blood Pressure</div>
                            <div className="text-lg font-bold text-blue-500">{vitalsResult.vitals.systolicBP}/{vitalsResult.vitals.diastolicBP}</div>
                          </div>
                        )}
                        {vitalsResult.vitals.temperature && (
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-xs text-gray-500">Temperature</div>
                            <div className="text-lg font-bold text-orange-500">{vitalsResult.vitals.temperature}°F</div>
                          </div>
                        )}
                        {vitalsResult.vitals.oxygenSaturation && (
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-xs text-gray-500">Oxygen Sat</div>
                            <div className="text-lg font-bold text-green-500">{vitalsResult.vitals.oxygenSaturation}%</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                        <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-green-600" />
                          AI Recommendation
                        </h6>
                        <p className="text-gray-600 whitespace-pre-wrap">{vitalsResult.analysis}</p>
                      </div>
                    </div>
                  )}

                  {!vitalsResult && !vitalsAnalysisMutation.isPending && (
                    <div className="bg-gray-50 p-8 rounded-xl text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Enter your vital signs above to receive personalized AI health insights</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mood Tracking Section */}
        <section id="mood" className="mb-12">
          <Card className="health-card-shadow">
            <CardHeader className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smile className="h-10 w-10 text-purple-500" />
              </div>
              <CardTitle className="text-3xl mb-2">Mood Tracking</CardTitle>
              <p className="text-gray-600">Track your mood and get personalized activity recommendations</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Mood Selection */}
                <div>
                  <h4 className="text-xl font-semibold mb-6 flex items-center">
                    <Heart className="h-5 w-5 mr-3 text-purple-500" />
                    How are you feeling?
                  </h4>

                  {/* Mood Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {MOOD_OPTIONS.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood.id)}
                        disabled={moodRecommendationsMutation.isPending}
                        className={`
                          ${mood.bgColor} hover:${mood.bgColor.replace('50', '100')} 
                          border-2 border-transparent hover:${mood.borderColor} 
                          p-6 rounded-xl text-center transition-all group
                          ${selectedMood === mood.id ? `${mood.borderColor} ring-2 ring-opacity-50` : ''}
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <mood.icon className={`${mood.color} h-8 w-8 mb-3 mx-auto group-hover:scale-110 transition-transform`} />
                        <p className="font-medium text-gray-800">{mood.label}</p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Mood Input */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Describe your mood
                    </label>
                    <Textarea 
                      placeholder="How are you feeling today?" 
                      rows={3}
                      value={moodDescription}
                      onChange={(e) => setMoodDescription(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Activity Recommendations */}
                <div>
                  <h4 className="text-xl font-semibold mb-6 flex items-center">
                    <Activity className="h-5 w-5 mr-3 text-green-600" />
                    Recommended Activities
                  </h4>

                  {moodRecommendationsMutation.isPending && (
                    <div className="bg-purple-50 p-6 rounded-xl text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-purple-600 font-medium">Finding perfect activities for you...</p>
                    </div>
                  )}

                  {moodRecommendations && selectedMood && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                      <div className="mb-4">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          <Smile className="inline h-3 w-3 mr-1" />
                          Current Mood: {MOOD_OPTIONS.find(m => m.id === selectedMood)?.label}
                        </span>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                        <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-purple-600" />
                          Personalized Recommendations
                        </h6>
                        <p className="text-gray-600 whitespace-pre-wrap">{moodRecommendations}</p>
                      </div>
                    </div>
                  )}

                  {!moodRecommendations && !moodRecommendationsMutation.isPending && (
                    <div className="bg-gray-50 p-8 rounded-xl text-center">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select your mood above to get personalized activity recommendations</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Emergency Contacts Section */}
        <section id="emergency" className="mb-12">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg p-8 text-white">
            <div className="text-center mb-8">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Emergency Contacts</h3>
              <p className="opacity-90">Quick access to important emergency numbers</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {EMERGENCY_CONTACTS.map((contact) => (
                <div
                  key={contact.name}
                  onClick={() => handleEmergencyCall(contact.number)}
                  className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-opacity-30 transition-all group cursor-pointer"
                >
                  <div className="bg-white bg-opacity-30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <contact.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{contact.name}</h4>
                  <p className="text-2xl font-bold">{contact.number}</p>
                  <p className="text-sm opacity-80 mt-1">{contact.description}</p>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Poison Control</p>
                <p className="text-lg font-bold">1-800-222-1222</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Crisis Text Line</p>
                <p className="text-lg font-bold">Text HOME to 741741</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                <Phone className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Suicide Prevention</p>
                <p className="text-lg font-bold">988</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Chatbot Sakhi Section */}
        <section id="chatbot" className="mb-12">
          <Card className="health-card-shadow overflow-hidden">
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Meet Sakhi</h3>
                  <p className="opacity-90">Your AI Health Assistant</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">Online and ready to help</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="h-96 flex flex-col">
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4"
              >
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`p-4 rounded-lg shadow-sm max-w-md ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <span className={`text-xs mt-2 block ${
                        message.role === 'user' ? 'opacity-80' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {message.role === 'user' && (
                      <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {chatMutation.isPending && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white p-4 rounded-lg rounded-tl-none shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <form className="flex space-x-3" onSubmit={handleChatSubmit}>
                  <Input 
                    type="text" 
                    placeholder="Ask Sakhi anything about your health..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatMutation.isPending}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={chatMutation.isPending || !chatInput.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
                
                {/* Quick Questions */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleQuickQuestion("How much water should I drink daily?")}
                      disabled={chatMutation.isPending}
                    >
                      Daily water intake
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleQuickQuestion("What are some good exercises for beginners?")}
                      disabled={chatMutation.isPending}
                    >
                      Exercise tips
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleQuickQuestion("How to manage stress naturally?")}
                      disabled={chatMutation.isPending}
                    >
                      Stress management
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="health-gradient p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">HealthScope</h3>
                  <p className="text-gray-300 text-sm">Your Health Companion</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">Empowering you to take control of your health with AI-powered insights, comprehensive tracking, and personalized recommendations.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#vitals" className="hover:text-white transition-colors">Vitals Tracking</a></li>
                <li><a href="#mood" className="hover:text-white transition-colors">Mood Tracking</a></li>
                <li><a href="#emergency" className="hover:text-white transition-colors">Emergency Contacts</a></li>
                <li><a href="#chatbot" className="hover:text-white transition-colors">AI Assistant</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2024 HealthScope. All rights reserved. Built with ❤️ for your health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HealthScope />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
