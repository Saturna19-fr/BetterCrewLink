import React from 'react';
import Box from '@mui/material/Box';
import { ui } from './tokens';

const styles = {
	pill: {
		WebkitAppRegion: 'no-drag',
		position: 'absolute',
		boxSizing: 'border-box',
		height: 28,
		padding: '7px 8px',
		borderRadius: '5px',
		backgroundColor: ui.pill,
		color: ui.pillText,
		fontFamily: ui.font,
		fontWeight: 700,
		fontSize: 12,
		lineHeight: '14px',
		textAlign: 'center',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	mono: {
		fontFamily: "'Source Code Pro', 'Roboto', monospace",
		letterSpacing: 1,
	},
	label: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		width: '100%',
	},
} as const;

export interface PillProps {
	left: number;
	top: number;
	width: number;
	height?: number;
	mono?: boolean;
	title?: string;
	onClick?: () => void;
	children?: React.ReactNode;
}

const Pill: React.FC<PillProps> = function ({ left, top, width, height, mono, title, onClick, children }: PillProps) {
	return (
		<Box
			sx={[styles.pill, !!mono && styles.mono]}
			style={{ left, top, width, height, cursor: onClick ? 'pointer' : 'default' }}
			title={title}
			onClick={onClick}
		>
			<Box component="span" sx={styles.label}>
				{children}
			</Box>
		</Box>
	);
};

export default Pill;
