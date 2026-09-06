import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { ui, DotVariant } from './tokens';

const colors: { [key in DotVariant]: { bg: string; border: string } } = {
	green: { bg: ui.green, border: ui.greenBorder },
	yellow: { bg: ui.yellow, border: ui.yellowBorder },
	red: { bg: ui.red, border: ui.redBorder },
	gray: { bg: ui.gray, border: ui.grayBorder },
};

const useStyles = makeStyles(() => ({
	dot: {
		width: 6,
		height: 6,
		borderRadius: 40,
		borderStyle: 'solid',
		borderWidth: 1,
		boxSizing: 'border-box',
		flexShrink: 0,
		display: 'inline-block',
	},
}));

interface StatusDotProps {
	variant: DotVariant;
	className?: string;
}

const StatusDot: React.FC<StatusDotProps> = function ({ variant, className }: StatusDotProps) {
	const classes = useStyles();
	const c = colors[variant];
	return (
		<span
			className={classes.dot + (className ? ' ' + className : '')}
			style={{ backgroundColor: c.bg, borderColor: c.border }}
		/>
	);
};

export default StatusDot;
