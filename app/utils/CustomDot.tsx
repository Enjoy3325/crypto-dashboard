export const CustomDot = ({ cx, cy, stroke, dataKey }: any) => {
	if (cx === undefined || cy === undefined) return null
	const color = dataKey === 'BTC' ? '#FFD700' : '#00ffa5'
	return (
		<circle
			cx={cx}
			cy={cy}
			r={6}
			stroke={color}
			strokeWidth={2}
			fill='white'
			style={{ transition: 'all 0.2s' }}
		/>
	)
}
