import React, { useContext } from 'react';
import Footer from '../components/Footer';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SupportLink from '../components/SupportLink';
import LaunchButton from '../components/LaunchButton';
import Box from '@mui/material/Box';
import { HeaderLayer } from '../ui/Header';
import Pill from '../ui/Pill';
import DevPanel from '../ui/DevPanel';
import { ui } from '../ui/tokens';
import { GameStateContext, PlayerColorContext } from '../state/contexts';

const styles = {
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
		gap: '10px',
		overflowY: 'auto',
	},
	error: {
		paddingTop: '8px',
		'& .MuiTypography-root': {
			fontFamily: ui.font,
		},
	},
	waiting: {
		fontFamily: ui.font,
		fontWeight: 700,
		fontSize: 14,
		marginTop: '6px',
		userSelect: 'none',
	},
	open_message: {
		fontFamily: ui.font,
		fontSize: 12,
		opacity: 0.8,
		marginTop: '10px',
		marginBottom: '2px',
		userSelect: 'none',
	},
} as const;

export interface MenuProps {
	t: (key: string) => string;
	error: string;
	devOpen?: boolean;
	onDevClose?: () => void;
}

const Menu: React.FC<MenuProps> = function ({ t, error, devOpen, onDevClose }: MenuProps) {
	const gameState = useContext(GameStateContext);
	const playerColors = useContext(PlayerColorContext);

	return (
		<>
			<HeaderLayer>
				<Pill left={61} top={46} width={248} title={t('game.waiting')}>
					{t('game.waiting')}
				</Pill>
			</HeaderLayer>
			<Box sx={styles.body}>
				{error ? (
					<Box sx={styles.error}>
						<Typography align="center" variant="h6" color="error">
							{t('game.error')}
						</Typography>
						<Typography align="center" style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
							{error}
						</Typography>
						<SupportLink />
					</Box>
				) : (
					<>
						<CircularProgress color="primary" size={36} />
						<Box component="span" sx={styles.waiting}>
							{t('game.waiting')}
						</Box>
						<Box component="span" sx={styles.open_message}>
							{t('game.open')}
						</Box>
						<LaunchButton t={t} />
					</>
				)}
			</Box>
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
