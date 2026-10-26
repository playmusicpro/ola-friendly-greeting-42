import { useEffect, useState } from 'react';

/** One decorative, noninteractive layer shared by public and protected routes. */
export default function AmbientBackground() {
  const [paused, setPaused] = useState(() => document.hidden);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return <div className="ambient-background" aria-hidden="true" data-paused={paused} />;
}