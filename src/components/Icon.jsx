// Lucide icon wrapper — usage: <Icon name="check" size={20} />
// Only the icons this site actually renders are imported, so the rest of
// lucide's icon set stays out of the bundle.
import React from 'react';
import {
  createElement,
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Circle, Copy, Menu, X,
} from 'lucide';

const icons = { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Circle, Copy, Menu, X };

const Icon = ({ name, size = 20, className = '', strokeWidth = 2.25, ...rest }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      const svg = createElement(icons[toPascal(name)] || icons.Circle);
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
