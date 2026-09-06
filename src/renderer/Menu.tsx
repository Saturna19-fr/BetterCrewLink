import React, { useContext } from 'react';
import Footer from './Footer';
import makeStyles from '@mui/styles/makeStyles';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SupportLink from './SupportLink';
import LaunchButton from './LaunchButton';
import { HeaderLayer } from './ui/Header';
import Pill from './ui/Pill';
import DevPanel from './ui/DevPanel';
import { ui } from './ui/tokens';
import { GameStateContext, PlayerColorContext } from './contexts';

const useStyles = makeStyles(() => ({
	body: {
		position: 'absolute',
		top: ui.headerHeight,
		left: 24,
		width: 321,
		bottom: ui.footerHeight,
		padding: '13px 6px',
		boxSizing: 'border-box',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		overflowY: 'auto',
	},
	error: {
		paddingTop: 8,
		'& .MuiTypography-root': {
			fontFamily: ui.font,
		},
	},
	waiting: {
		fontFamily: ui.font,
		fontWeight: 700,
		fontSize: 14,
		marginTop: 6,
		userSelect: 'none',
	},
	open_message: {
		fontFamily: ui.font,
		fontSize: 12,
		opacity: 0.8,
		marginTop: 10,
		marginBottom: 2,
		userSelect: 'none',
	},
}));

export interface MenuProps {
	t: (key: string) => string;
	error: string;
	devOpen?: boolean;
	onDevClose?: () => void;
}

const Menu: React.FC<MenuProps> = function ({ t, error, devOpen, onDevClose }: MenuProps) {
	const classes = useStyles();
	const gameState = useContext(GameStateContext);
	const playerColors = useContext(PlayerColorContext);

	return (
		<>
			<HeaderLayer>
				<Pill left={61} top={46} width={248} title={t('game.waiting')}>
					{t('game.waiting')}
				</Pill>
			</HeaderLayer>
			<div className={classes.body}>
				{error ? (
					<div className={classes.error}>
						<Typography align="center" variant="h6" color="error">
							{t('game.error')}
						</Typography>
						<Typography align="center" style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
							{error}
						</Typography>
						<SupportLink />
					</div>
				) : (
					<>
						<CircularProgress color="primary" size={36} />
						<span className={classes.waiting}>{t('game.waiting')}</span>
						<span className={classes.open_message}>{t('game.open')}</span>
						<LaunchButton t={t} />
					</>
				)}
			</div>
			<DevPanel
				open={!!devOpen}
				onClose={onDevClose ?? (() => undefined)}
				gameState={gameState}
				playerColors={playerColors}
				error={error}
			/>
			<Footer />
		</>
	);
};

export default Menu;
