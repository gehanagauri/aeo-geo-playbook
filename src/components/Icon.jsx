// Lucide icon wrapper — usage: <Icon name="check" size={20} />
import React from 'react';
import { createElement, icons } from 'lucide';

const lucide = { createElement, icons };

const Icon = ({ name, size = 20, className = '', strokeWidth = 2.25, ...rest }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (lucide && ref.current) {
      ref.current.innerHTML = '';
      const svg = lucide.createElement(lucide.icons[toPascal(name)] || lucide.icons.Circle);
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', strokeWidth);
      ref.current.appendChild(svg);
    }
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={`inline-flex items-center justify-center ${className}`} {...rest} />;
};

function toPascal(s) {
  return s.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

export default Icon;
