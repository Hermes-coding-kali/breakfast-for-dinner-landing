// src/components/ScrollToHash.jsx
import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {scrollToId} from '../utils/scrollToId';

export default function ScrollToHash({offset = 0}) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const t = setTimeout(() => scrollToId(id, offset), 50); // wait for sections to mount
    return () => clearTimeout(t);
  }, [location.hash, offset]);

  return null;
}
