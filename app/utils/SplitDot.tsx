export const SplitDot = ({ cx, cy, stroke, dataKey }: any) => {
	if (cx === undefined || cy === undefined) return null
	const color = dataKey === 'BTC' ? '#FFD700' : '#00ffa5'
	return (
		<rect
			x={cx - 3}
			y={cy - 3}
			width={6}
			height={6}
			fill={color}
			stroke='white'
			strokeWidth={1.5}
			rx={1}
			ry={1}
			style={{ transition: 'all 0.2s' }}
		/>
	)
}
