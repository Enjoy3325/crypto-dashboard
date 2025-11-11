import { render, screen } from '@testing-library/react';
import { CryptoChart } from '../CryptoChart';

const mockData = [
  { date: '2023-01-01', price: 30000 },
  { date: '2023-01-02', price: 31000 },
  { date: '2023-01-03', price: 32000 },
];

describe('CryptoChart', () => {
  it('renders the chart title', () => {
    render(<CryptoChart data={mockData} />);
    expect(screen.getByText('Bitcoin Price')).toBeInTheDocument();
  });

  it('renders with provided data', () => {
    render(<CryptoChart data={mockData} />);
    // Check if chart container is rendered
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});