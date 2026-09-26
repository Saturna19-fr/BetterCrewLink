import React from 'react';
import Box from '@mui/material/Box';
import { ui, DotVariant } from './tokens';

const colors: { [key in DotVariant]: { bg: string; border: string } } = {
	green: { bg: ui.green, border: ui.greenBorder },
	yellow: { bg: ui.yellow, border: ui.yellowBorder },
	red: { bg: ui.red, border: ui.redBorder },
	gray: { bg: ui.gray, border: ui.grayBorder },
};

const dot = {
	width: 6,
	height: 6,
	borderRadius: '40px',
	borderStyle: 'solid',
	borderWidth: 1,
	boxSizing: 'border-box',
	flexShrink: 0,
	display: 'inline-block',
} as const;

interface StatusDotProps {
	variant: DotVariant;
}

const StatusDot: React.FC<StatusDotProps> = function ({ variant }: StatusDotProps) {
	const c = colors[variant];
	return <Box component="span" sx={dot} style={{ backgroundColor: c.bg, borderColor: c.border }} />;
};

export default StatusDot;
