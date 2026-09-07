import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Users,
  MoreHorizontal,
  Briefcase,
  Gift,
  Store,
  Laptop,
  TrendingUp,
  Heart,
  PlusCircle,
  Tag,
  DollarSign,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'PlusCircle':
      return <PlusCircle className={className} />;
    case 'Tag':
      return <Tag className={className} />;
    case 'DollarSign':
      return <DollarSign className={className} />;
    case 'Wallet':
      return <Wallet className={className} />;
    case 'ArrowDownCircle':
      return <ArrowDownCircle className={className} />;
    case 'ArrowUpCircle':
      return <ArrowUpCircle className={className} />;
    default:
      return <MoreHorizontal className={className} />;
  }
};
