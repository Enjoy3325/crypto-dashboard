import { fireEvent, render, screen } from '@testing-library/react'

import { CryptoChart } from '../CryptoChart/CryptoChart'
import React from 'react'

// Mock ResizeObserver for chart rendering tests
beforeAll(() => {
	class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	;(global as any).ResizeObserver = ResizeObserver
})

//Easy mock data for basic rendering tests
const mockData = [
	{ date: '2025-11-11', price: 30000 },
	{ date: '2025-11-12', price: 30500 },
]

describe('CryptoChart simple test', () => {
	it('renders basic dashboard elements', () => {
		render(<CryptoChart data={mockData} />)

		expect(screen.getByText(/Crypto Dashboard/i)).toBeInTheDocument()
		expect(screen.getByText(/Real-time analytics for/i)).toBeInTheDocument()
	})

	it('timeframe buttons can be clicked', () => {
		render(<CryptoChart data={mockData} />)

		// Timeframe buttons
		const button24h = screen.getByRole('button', { name: /24H/i })
		const button7d = screen.getByRole('button', { name: /7D/i })

		fireEvent.click(button7d)
		fireEvent.click(button24h)
	})

	it('chart type buttons can be clicked if exist', () => {
		render(<CryptoChart data={mockData} />)

		const buttonLine = screen.queryByRole('button', { name: /Line/i })
		if (buttonLine) fireEvent.click(buttonLine)

		const buttonBar = screen.queryByRole('button', { name: /Bar/i })
		if (buttonBar) fireEvent.click(buttonBar)
	})
})
