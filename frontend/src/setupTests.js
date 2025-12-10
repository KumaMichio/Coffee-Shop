// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.URL.createObjectURL for Goong Maps compatibility
if (typeof window !== 'undefined' && !window.URL.createObjectURL) {
  window.URL.createObjectURL = jest.fn(() => 'mocked-url');
}

// Mock window.URL.revokeObjectURL
if (typeof window !== 'undefined' && !window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = jest.fn();
}