import React, { useContext, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import Footer from '../components/Footer';
import SupportLink from '../components/SupportLink';
import PlayerRow from '../ui/PlayerRow';
import DevPanel from '../ui/DevPanel';
import { HeaderLayer } from '../ui/Header';
import Pill from '../ui/Pill';
import RoundButton from '../ui/RoundButton';
import StatusDot from '../ui/StatusDot';
import { Icons } from '../ui/icons';
import { ui } from '../ui/tokens';
import { GameStateContext, PlayerColorContext, SettingsContext } from '../state/contexts';
import { GameState } from '../../common/AmongUsState';
import { SocketConfig } from '../../common/ISettings';
import { IpcHandlerMessages } from '../../common/ipc-messages';
import { ipcRenderer } from '../lib/electron-bridge';
import { useVoiceEngine } from '../voice/useVoiceController';

export interface VoiceProps {
	t: (key: string) => string;
	error: string;
	devOpen?: boolean;
	onDevClose?: () => void;
}

const styles = {
	error: {
		position: 'absolute',
		top: ui.headerHeight,
		left: 24,
		right: 24,
		bottom: ui.footerHeight,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		'& .MuiTypography-root': {
			fontFamily: ui.font,
		},
	},
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
		gap: '10px',
		overflowY: 'auto',
		overflowX: 'hidden',
	},
	notice: {
		fontFamily: ui.font,
		fontSize: 10,
		opacity: 0.8,
		textAlign: 'center',
		padding: '0 4px',
		flexShrink: 0,
	},
	centered: {
		display: 'flex',
		justifyContent: 'center',
		width: '100%',
		flexShrink: 0,
	},
	empty: {
		fontFamily: ui.font,
		fontSize: 11,
		opacity: 0.6,
		marginTop: '20px',
		userSelect: 'none',
	},
	counter: {
		WebkitAppRegion: 'no-drag',
		position: 'absolute',
		left: 166,
		top: 46,
		width: 38,
		height: 30,
		borderRadius: '5px',
		backgroundColor: ui.pill,
		boxSizing: 'border-box',
		padding: '0 0 0 9px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	counterRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '5px',
		padding: '1px',
		height: 14,
		boxSizing: 'border-box',
		fontFamily: ui.font,
		fontSize: 10,
		lineHeight: '12px',
		color: ui.pillText,
		userSelect: 'none',
	},
} as const;

const MicGlyph: React.FC = () => (
	<svg viewBox="0 0 24 24" fill="white">
		<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
	</svg>
);

const DEFAULT_PLAYER_CONFIG: SocketConfig = { volume: 1, isMuted: false };

const VoiceView: React.FC<VoiceProps> = function ({ t, error: initialError, devOpen, onDevClose }: VoiceProps) {
	const gameState = useContext(GameStateContext);
	const playerColors = useContext(PlayerColorContext);
	const [settings, setSetting] = useContext(SettingsContext);
	const { voice, controller } = useVoiceEngine();

	const myPlayer = useMemo(() => gameState?.players?.find((player) => player.isLocal), [gameState?.players]);

	const otherPlayers = useMemo(() => {
		if (!gameState?.players || !myPlayer) return [];
		return gameState.players.filter((player) => !player.isLocal);
	}, [gameState?.players, myPlayer]);

	const playerConfigs = settings.playerConfigMap;

	let displayedLobbyCode = gameState.lobbyCode;
	if (displayedLobbyCode !== 'MENU' && settings.hideCode) displayedLobbyCode = 'LOBBY';

	const serverHost = useMemo(() => {
		try {
			return new URL(settings.serverURL).host;
		} catch {
			return settings.serverURL;
		}
	}, [settings.serverURL]);

	const error = voice.error || initialError;
	const micOff = voice.muted || voice.deafened;

	const inLobby = !!myPlayer && gameState.lobbyCode !== 'MENU';
	const connectionStateOf = (clientId: number): 'disconnected' | 'novoice' | 'connected' => {
		const peer = voice.playerSocketIds[clientId];
		const connected = voice.socketClients[peer]?.clientId === clientId || false;
		return !connected ? 'disconnected' : voice.audioConnected[peer] ? 'connected' : 'novoice';
	};
	let voiceConnectedCount = 0;
	let voicePendingCount = 0;
	if (inLobby) {
		for (const player of otherPlayers) {
			if (connectionStateOf(player.clientId) === 'connected') voiceConnectedCount++;
			else voicePendingCount++;
		}
	}

	return (
		<>
			<HeaderLayer>
				<Pill left={61} top={46} width={94} title={myPlayer?.name}>
					{myPlayer?.name ?? '…'}
				</Pill>
				<Box sx={styles.counter} title="Players with voice / players still connecting">
					<Box sx={styles.counterRow}>
						<StatusDot variant="green" />
						<span>{inLobby ? voiceConnectedCount : '-'}</span>
					</Box>
					<Box sx={styles.counterRow}>
						<StatusDot variant="yellow" />
						<span>{inLobby ? voicePendingCount : '-'}</span>
					</Box>
				</Box>
				<Pill
					left={215}
					top={46}
					width={94}
					mono={displayedLobbyCode !== 'MENU'}
					title={displayedLobbyCode === 'MENU' ? t('game.menu') : displayedLobbyCode}
				>
					{displayedLobbyCode === 'MENU' ? t('game.menu') : displayedLobbyCode}
				</Pill>
				<RoundButton
					left={336}
					top={21}
					title={micOff ? 'Unmute microphone' : 'Mute microphone'}
					danger={micOff}
					icon={micOff ? Icons.micOff : undefined}
					onClick={controller.toggleMute}
				>
					<MicGlyph />
				</RoundButton>
				<RoundButton
					left={336}
					top={52}
					title={voice.deafened ? 'Undeafen' : 'Deafen'}
					danger={voice.deafened}
					icon={Icons.headset}
					onClick={controller.toggleDeafen}
				/>
			</HeaderLayer>
			{error && (
				<Box sx={styles.error}>
					<Typography align="center" variant="h6" color="error">
						ERROR
					</Typography>
					<Typography align="center" style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
						{error}
					</Typography>
					<SupportLink />
				</Box>
			)}
			{!error && (
				<Box sx={styles.body}>
					{voice.activeLobbySettings?.deadOnly && (
						<Box sx={styles.notice}>{t('settings.lobbysettings.ghost_only_warning2')}</Box>
					)}
					{voice.activeLobbySettings?.meetingGhostOnly && (
						<Box sx={styles.notice}>{t('settings.lobbysettings.meetings_only_warning2')}</Box>
					)}
					{displayedLobbyCode === 'MENU' && (
						<Box sx={styles.centered}>
							<Button
								style={{ margin: '10px', fontFamily: ui.font }}
								onClick={() => ipcRenderer.send(IpcHandlerMessages.OPEN_LOBBYBROWSER)}
								color="primary"
								variant="outlined"
								size="small"
							>
								{t('buttons.public_lobby')}
							</Button>
						</Box>
					)}
					{inLobby &&
						otherPlayers.map((player) => {
							const theirVadHidden = player.shiftedColor !== -1 && gameState?.gameState !== GameState.DISCUSSION;
							return (
								<PlayerRow
									key={player.id}
									player={player}
									connectionState={connectionStateOf(player.clientId)}
									talking={!player.inVent && !theirVadHidden && voice.otherTalking[player.clientId]}
									isAlive={!voice.otherDead[player.clientId]}
									isUsingRadio={
										(myPlayer?.isImpostor &&
											!(player.disconnected || player.bugged) &&
											voice.impostorRadioClientId === player.clientId) ||
										false
									}
									socketConfig={playerConfigs?.[player.playerConfigId] ?? DEFAULT_PLAYER_CONFIG}
									onConfigChange={(config, persist) =>
										setSetting(`playerConfigMap.${player.playerConfigId}`, config, persist)
									}
									mod={gameState.mod}
								/>
							);
						})}
					{inLobby && otherPlayers.length === 0 && <Box sx={styles.empty}>Waiting for other players{'…'}</Box>}
				</Box>
			)}
			<DevPanel
				open={!!devOpen}
				onClose={onDevClose ?? (() => undefined)}
				gameState={gameState}
				playerColors={playerColors}
				error={error}
				voice={voice}
			/>
			<Footer
				status={{
					variant: voice.connected ? 'green' : 'red',
					label: voice.connected ? `Server connected: ${serverHost}` : `Server disconnected: ${serverHost}`,
				}}
			/>
		</>
	);
};

export default VoiceView;
