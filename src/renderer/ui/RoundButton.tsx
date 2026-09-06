import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { ui } from './tokens';
import { IconAsset } from './icons';

const useStyles = makeStyles(() => ({
	root: {
		WebkitAppRegion: 'no-drag',
		position: 'absolute',
		width: 24,
		height: 24,
		boxSizing: 'border-box',
		borderRadius: 100,
		border: `1px solid ${ui.buttonBorder}`,
		background: 'transparent',
		padding: 0,
		margin: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		outline: 'none',
		color: 'white',
		transition: 'background-color .15s ease-out, border-color .15s ease-out, opacity .15s ease-out',
		'&:hover': {
			backgroundColor: ui.buttonHover,
		},
		'&:active': {
			backgroundColor: 'rgba(255, 255, 255, 0.2)',
		},
		'&:disabled': {
			opacity: 0.4,
			cursor: 'default',
		},
	},
	danger: {
		borderColor: '#ff6b6b',
		backgroundColor: 'rgba(255, 107, 107, 0.18)',
		'&:hover': {
			backgroundColor: 'rgba(255, 107, 107, 0.3)',
		},
	},
	active: {
		backgroundColor: 'rgba(230, 255, 211, 0.22)',
		boxShadow: `0 0 0 1px ${ui.buttonBorder} inset`,
		'&:hover': {
			backgroundColor: 'rgba(230, 255, 211, 0.32)',
		},
	},
	iconBox: {
		width: 10,
		height: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'none',
		'& > svg': {
			width: 12,
			height: 12,
		},
	},
	img: {
		display: 'block',
	},
}));

export interface RoundButtonProps {
	left?: number;
	top?: number;
	right?: number;
	icon?: IconAsset;
	title?: string;
	danger?: boolean;
	active?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
}

const RoundButton: React.FC<RoundButtonProps> = function ({
	left,
	top,
	right,
	icon,
	title,
	danger,
	active,
	disabled,
	onClick,
	className,
	style,
	children,
}: RoundButtonProps) {
	const classes = useStyles();
	return (
		<button
			type="button"
			title={title}
			disabled={disabled}
			onClick={onClick}
			className={[classes.root, danger ? classes.danger : '', active ? classes.active : '', className ?? ''].join(' ')}
			style={{ left, top, right, ...style }}
		>
			<span className={classes.iconBox}>
				{icon ? (
					<img src={icon.src} width={icon.width} height={icon.height} className={classes.img} alt="" />
				) : (
					children
				)}
			</span>
		</button>
	);
};

export default RoundButton;
