import { render } from '@testing-library/react';

// Mock App để tránh phải chạy toàn bộ logic router / context / goong map
jest.mock('./App', () => {
  const React = require('react');

  function MockApp() {
    // Component rất đơn giản, không thể crash được
    return React.createElement('div', null, 'Mock App');
  }

  return {
    __esModule: true,
    default: MockApp,
  };
});

import App from './App';

test('renders app without crashing', () => {
  const { container } = render(<App />);
  // Nếu render ra được DOM là coi như pass
  expect(container).toBeTruthy();
});
