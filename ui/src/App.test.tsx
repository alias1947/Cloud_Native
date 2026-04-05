import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App smoke test', () => {
  beforeAll(() => {
    global.fetch = jest.fn().mockResolvedValue(
      {
        ok: true,
        json: async () => ({ services: [], metrics: [], alerts: [] }),
      } as any
    );
  });

  afterAll(() => {
    (global.fetch as jest.Mock).mockRestore();
  });

  test('renders platform title', async () => {
    render(<App />);
    const title = await screen.findByText(/cloud-native platform/i);
    expect(title).toBeTruthy();
  });
});
