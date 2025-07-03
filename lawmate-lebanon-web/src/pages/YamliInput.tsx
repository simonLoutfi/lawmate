import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Yamli?: any;
  }
}

const YamliInput = () => {
  const inputRef = useRef(null);

  useEffect(() => {
    // Load the Yamli script
    const script = document.createElement('script');
    script.src = 'https://api.yamli.com/js/yamli_api.js';
    script.type = 'text/javascript';
    script.onload = () => {
      if (
        typeof window.Yamli === 'object' &&
        window.Yamli.init({ uiLanguage: 'en', startMode: 'onOrUserDefault' })
      ) {
        window.Yamli.yamlify(inputRef.current.id, {
          settingsPlacement: 'bottomLeft',
        });
      }
    };
    document.body.appendChild(script);

    // Optional cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <input
      id="questionInput"
      ref={inputRef}
      type="text"
      placeholder="Type here..."
      className="border p-2 w-full"
    />
  );
};

export default YamliInput;
