import React from 'react';
import { LayoutDashboard, Shirt, Heart, PieChart, Settings, Plus, X, Sparkles } from 'lucide-react';

export const DashboardIcon: React.FC = () => <LayoutDashboard className="h-6 w-6" />;
export const WardrobeIcon: React.FC = () => <Shirt className="h-6 w-6" />;
export const OutfitIcon: React.FC = () => <Heart className="h-6 w-6" />;
export const AnalyticsIcon: React.FC = () => <PieChart className="h-6 w-6" />;
export const SettingsIcon: React.FC = () => <Settings className="h-6 w-6" />;
export const PlusIcon: React.FC = () => <Plus className="h-6 w-6" />;
export const CloseIcon: React.FC = () => <X className="h-6 w-6" />;
export const SparklesIcon: React.FC = () => <Sparkles className="h-6 w-6" />;
