import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { ui } from './tokens';
import { Icons, HeaderBackground } from './icons';
import RoundButton from './RoundButton';

const useStyles = makeStyles(() => ({
	root: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: ui.headerHeight,
		zIndex: 100,
		WebkitAppRegion: 'drag',
		userSelect: 'none',
		pointerEvents: 'none',
		'& > *': {
			pointerEvents: 'auto',
		},
	},
	bg: {
		// The blue tab shape doubles as the window drag handle.
		WebkitAppRegion: 'drag',
		position: 'absolute',
		top: 0,
		left: 0,
		width: ui.width,
		height: ui.headerHeight,
		display: 'block',
	},
	title: {
		position: 'absolute',
		top: 14,
		left: 40,
		right: 40,
		height: 14,
		lineHeight: '14px',
		textAlign: 'center',
		fontFamily: ui.font,
		fontWeight: 700,
		fontSize: 12,
		color: 'white',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		pointerEvents: 'none',
	},
	// Quit button: quiet by default, turns into a solid red disc on hover.
	close: {
		borderColor: 'rgba(255, 255, 255, 0.35)',
		'& > span > svg': {
			width: 9,
			height: 9,
			transition: 'transform .15s ease-out',
		},
		'&:hover': {
			backgroundColor: '#e5484d',
			borderColor: '#e5484d',
		},
		'&:hover > span > svg': {
			transform: 'rotate(90deg)',
		},
		'&:active': {
			backgroundColor: '#c73a3f',
			borderColor: '#c73a3f',
			transform: 'scale(0.94)',
		},
	},
}));

export interface HeaderProps {
	title: string;
	devOpen?: boolean;
	onDev: () => void;
	onSettings: () => void;
	onClose: () => void;
}

/**
 * Top 87px of the window: the blue "tab" shape from the design, the app title,
 * and the dev-info / settings / quit buttons. Screens add their own controls
 * (pills, mute buttons) in a layer above this one, see HeaderLayer.
 */
const RawHeader: React.FC<HeaderProps> = function ({ title, devOpen, onDev, onSettings, onClose }: HeaderProps) {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<img src={HeaderBackground} className={classes.bg} alt="" draggable={false} />
			<span className={classes.title}>{title}</span>
			<RoundButton left={10} top={21} icon={Icons.code} title="Dev info" active={devOpen} onClick={onDev} />
			<RoundButton left={10} top={52} icon={Icons.settings} title="Settings" onClick={onSettings} />
			<RoundButton left={305} top={21} title="Quit BetterCrewLink" onClick={onClose} className={classes.close}>
				<svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round">
					<path d="M2 2L8 8M8 2L2 8" />
				</svg>
			</RoundButton>
		</div>
	);
};

const Header = React.memo(RawHeader);
export default Header;

const useLayerStyles = makeStyles(() => ({
	layer: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: ui.headerHeight,
		zIndex: 101,
		pointerEvents: 'none',
		'& > *': {
			pointerEvents: 'auto',
		},
	},
}));

interface HeaderLayerProps {
	children?: React.ReactNode;
}

/** Absolutely-positioned layer sitting on top of the Header for per-screen controls. */
export const HeaderLayer: React.FC<HeaderLayerProps> = function ({ children }: HeaderLayerProps) {
	const classes = useLayerStyles();
	return <div className={classes.layer}>{children}</div>;
};
