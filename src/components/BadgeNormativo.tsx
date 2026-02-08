
import React from 'react';
import { GravedadFalta } from '../types';

interface BadgeNormativoProps {
  gravedad: GravedadFalta;
}

const BadgeNormativo: React.FC<BadgeNormativoProps> = ({ gravedad }) => {
  const getStyles = () => {
    // FIX: Use string literals for switch cases as GravedadFalta is a union type, not an object/enum value.
    switch (gravedad) {
      case 'LEVE':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RELEVANTE':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'GRAVISIMA_EXPULSION':
        return 'bg-red-100 text-red-700 border-red-200 font-black ring-1 ring-red-400/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    // FIX: Use string literal for comparison because GravedadFalta is a type definition.
    if (gravedad === 'GRAVISIMA_EXPULSION') return 'Gravísima / Expulsión';
    return gravedad.charAt(0) + gravedad.slice(1).toLowerCase();
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStyles()} uppercase tracking-wider`}>
      {getLabel()}
    </span>
  );
};

export default BadgeNormativo;
