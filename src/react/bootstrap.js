import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/app.jsx';


let placeholder = document.getElementById('app');

const config = JSON.parse(placeholder.dataset.config);

const root = createRoot(placeholder);

root.render(<App config={config} />);
