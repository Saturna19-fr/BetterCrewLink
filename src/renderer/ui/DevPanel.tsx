import React, { useContext, useMemo } from 'react';
import Box from '@mui/material/Box';
import { ipcRenderer } from '../lib/electron-bridge';
import { AmongUsState, GameState, Player } from '../../common/AmongUsState';
import { CameraLocation, MapType } from '../../common/AmongusMap';
import { SettingsContext } from '../state/contexts';
import { VoiceSnapshot } from '../voice/types';
import { ui, DotVariant } from './tokens';
import StatusDot from './StatusDot';

const styles = {
	root: {
		position: 'absolute',
		top: ui.headerHeight,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 98,
		background: 'rgba(23, 23, 23, 0.94)',
		backdropFilter: 'blur(4px)',
		display: 'flex',
		flexDirection: 'column',
		fontFamily: ui.font,
		fontSize: 10,
		color: 'white',
		WebkitAppRegion: 'no-drag',
	},
	toolbar: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		padding: '8px 12px 6px 12px',
		borderBottom: '1px solid rgba(255,255,255,0.08)',
		flexShrink: 0,
	},
	title: {
		fontWeight: 700,
		fontSize: 12,
		marginRight: 'auto',
		userSelect: 'none',
	},
	tool: {
		fontFamily: ui.font,
		fontSize: 10,
		fontWeight: 600,
		color: 'white',
		background: 'rgba(255,255,255,0.08)',
		border: '1px solid rgba(255,255,255,0.18)',
		borderRadius: '5px',
		padding: '3px 8px',
		cursor: 'pointer',
		outline: 'none',
		'&:hover': {
			background: 'rgba(255,255,255,0.16)',
		},
	},
	scroll: {
		overflowY: 'auto',
		overflowX: 'hidden',
		padding: '8px 12px 12px 12px',
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
	},
	section: {
		background: '#2d2d2d',
		borderRadius: '8px',
		padding: '6px 8px',
	},
	sectionTitle: {
		fontWeight: 700,
		fontSize: 11,
		marginBottom: '4px',
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		userSelect: 'none',
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'max-content 1fr',
		columnGap: '8px',
		rowGap: '1px',
		alignItems: 'baseline',
	},
	key: {
		color: 'rgba(255,255,255,0.55)',
		whiteSpace: 'nowrap',
	},
	value: {
		fontFamily: "'Source Code Pro', monospace",
		fontSize: 10,
		wordBreak: 'break-all',
	},
	badges: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '4px',
		margin: '2px 0 5px 0',
	},
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '4px',
		padding: '1px 6px',
		borderRadius: '40px',
		fontSize: 9,
		fontWeight: 700,
		letterSpacing: 0.3,
		background: 'rgba(255,255,255,0.08)',
		border: '1px solid rgba(255,255,255,0.15)',
		userSelect: 'none',
	},
	swatch: {
		width: 12,
		height: 12,
		borderRadius: '4px',
		border: '1px solid rgba(255,255,255,0.3)',
		flexShrink: 0,
	},
	playerName: {
		fontWeight: 700,
		fontSize: 11,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	muted: {
		color: 'rgba(255,255,255,0.45)',
	},
	empty: {
		opacity: 0.6,
		textAlign: 'center',
		padding: '20px',
	},
} as const;

export interface DevPanelProps {
	open: boolean;
	onClose: () => void;
	gameState: AmongUsState;
	playerColors: string[][];
	voice?: VoiceSnapshot;
	error?: string;
}

const fmt = (v: unknown): string => {
	if (v === undefined) return '–';
	if (v === null) return 'null';
	if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(3);
	if (typeof v === 'boolean') return v ? 'true' : 'false';
	if (Array.isArray(v)) return v.length ? v.join(', ') : '[]';
	if (typeof v === 'object') return JSON.stringify(v);
	return String(v);
};

const hex = (n: number | undefined): string => (n === undefined ? '–' : '0x' + (n >>> 0).toString(16).toUpperCase());

interface RowsProps {
	rows: [string, unknown][];
}

const Rows: React.FC<RowsProps> = function ({ rows }: RowsProps) {
	return (
		<Box sx={styles.grid}>
			{rows.map(([k, v]) => (
				<React.Fragment key={k}>
					<Box component="span" sx={styles.key}>
						{k}
					</Box>
					<Box component="span" sx={styles.value}>
						{fmt(v)}
					</Box>
				</React.Fragment>
			))}
		</Box>
	);
};

interface BadgeProps {
	label: string;
	dot?: DotVariant;
	dim?: boolean;
}

const Badge: React.FC<BadgeProps> = function ({ label, dot, dim }: BadgeProps) {
	return (
		<Box component="span" sx={[styles.badge, !!dim && styles.muted]}>
			{dot && <StatusDot variant={dot} />}
			{label}
		</Box>
	);
};

/**
 * Debug overlay listing everything the app knows about the game and every player:
 * role, life/vent/connection states, cosmetics, positions, voice peer status and per-player audio config.
 */
const DevPanel: React.FC<DevPanelProps> = function ({
	open,
	onClose,
	gameState,
	playerColors,
	voice,
	error,
}: DevPanelProps) {
	const [settings] = useContext(SettingsContext);
	const playerConfigs = settings.playerConfigMap ?? {};

	const players = useMemo(() => {
		const list = gameState?.players ? [...gameState.players] : [];
		return list.sort((a, b) => Number(b.isLocal) - Number(a.isLocal) || a.id - b.id);
	}, [gameState?.players]);

	if (!open) return <></>;

	const me = players.find((p) => p.isLocal);
	const hasGame = !!gameState && gameState.gameState !== undefined;

	const copyJson = () => {
		const dump = { gameState, voice, serverURL: settings.serverURL, playerConfigs, error };
		navigator.clipboard.writeText(JSON.stringify(dump, null, 2)).catch(() => undefined);
	};

	const stateName = (s: GameState | undefined) => (s === undefined ? '–' : `${GameState[s]} (${s})`);

	return (
		<Box sx={styles.root}>
			<Box sx={styles.toolbar}>
				<Box component="span" sx={styles.title}>
					Dev info
				</Box>
				<Box component="button" sx={styles.tool} onClick={copyJson} title="Copy everything as JSON">
					Copy JSON
				</Box>
				<Box
					component="button"
					sx={styles.tool}
					onClick={() => ipcRenderer.send('reload', 'main')}
					title="Reload the app"
				>
					Reload
				</Box>
				<Box component="button" sx={styles.tool} onClick={onClose} title="Close">
					✕
				</Box>
			</Box>
			<Box sx={styles.scroll}>
				{error && (
					<Box sx={styles.section}>
						<Box sx={styles.sectionTitle}>
							<StatusDot variant="red" /> Error
						</Box>
						<Box component="span" sx={styles.value}>
							{error}
						</Box>
					</Box>
				)}

				<Box sx={styles.section}>
					<Box sx={styles.sectionTitle}>
						<StatusDot variant={hasGame ? 'green' : 'gray'} /> Game
					</Box>
					{hasGame ? (
						<Rows
							rows={[
								['state', stateName(gameState.gameState)],
								['previous state', stateName(gameState.oldGameState)],
								['lobby code', `${gameState.lobbyCode} (${gameState.lobbyCodeInt})`],
								['map', `${MapType[gameState.map]} (${gameState.map})`],
								['mod', gameState.mod],
								['players', `${players.length} / ${gameState.maxPlayers}`],
								['my clientId', gameState.clientId],
								['host clientId', `${gameState.hostId}${gameState.isHost ? ' (me)' : ''}`],
								['comms sabotaged', gameState.comsSabotaged],
								['camera', `${CameraLocation[gameState.currentCamera]} (${gameState.currentCamera})`],
								['light radius', `${fmt(gameState.lightRadius)}${gameState.lightRadiusChanged ? ' (changed)' : ''}`],
								['closed doors', gameState.closedDoors],
								['old meeting hud', gameState.oldMeetingHud],
							]}
						/>
					) : (
						<Box component="span" sx={styles.muted}>
							No game state yet. Open Among Us.
						</Box>
					)}
				</Box>

				{voice && (
					<Box sx={styles.section}>
						<Box sx={styles.sectionTitle}>
							<StatusDot variant={voice.connected ? 'green' : 'red'} /> Voice
						</Box>
						<Rows
							rows={[
								['server', settings.serverURL],
								['socket', voice.connected ? 'connected' : 'disconnected'],
								['peers', Object.keys(voice.audioConnected).length],
								['known sockets', Object.keys(voice.socketClients).length],
								['audio streams', Object.values(voice.audioConnected).filter(Boolean).length],
								[
									'me',
									`${voice.talking ? 'talking' : 'silent'}, ${voice.muted ? 'muted' : 'unmuted'}, ${
										voice.deafened ? 'deafened' : 'hearing'
									}`,
								],
								['radio clientId', voice.impostorRadioClientId],
							]}
						/>
						<Box sx={styles.sectionTitle} style={{ marginTop: 6 }}>
							Lobby settings
						</Box>
						<Rows rows={Object.entries(voice.activeLobbySettings ?? {}) as [string, unknown][]} />
					</Box>
				)}

				{players.length === 0 && hasGame && <Box sx={styles.empty}>No players in memory.</Box>}

				{players.map((p: Player) => {
					const color = playerColors?.[p.colorId]?.[0];
					const peer = voice?.playerSocketIds[p.clientId];
					const socketClient = peer !== undefined ? voice?.socketClients[peer] : undefined;
					const socketOk = !!socketClient && socketClient.clientId === p.clientId;
					const audioOk = peer !== undefined && !!voice?.audioConnected[peer];
					const cfg = playerConfigs[p.playerConfigId];
					const talking = p.isLocal ? voice?.talking : voice?.otherTalking[p.clientId];
					const usingRadio = voice ? voice.impostorRadioClientId === p.clientId : false;
					const isHost = gameState.hostId === p.clientId;
					const dist = me && !p.isLocal ? Math.hypot(p.x - me.x, p.y - me.y) : undefined;

					return (
						<Box sx={styles.section} key={`${p.id}-${p.clientId}`}>
							<Box sx={styles.sectionTitle}>
								<Box component="span" sx={styles.swatch} style={{ background: color ?? '#888' }} />
								<Box component="span" sx={styles.playerName} title={p.name}>
									{p.name || '(no name)'}
								</Box>
								<Box component="span" sx={styles.muted} style={{ marginLeft: 'auto' }}>
									#{p.id}
								</Box>
							</Box>
							<Box sx={styles.badges}>
								{p.isLocal && <Badge label="LOCAL" />}
								{isHost && <Badge label="HOST" />}
								<Badge label={p.isImpostor ? 'IMPOSTOR' : 'CREWMATE'} dot={p.isImpostor ? 'red' : 'green'} />
								<Badge label={p.isDead ? 'DEAD' : 'ALIVE'} dot={p.isDead ? 'gray' : 'green'} dim={!p.isDead} />
								{p.inVent && <Badge label="IN VENT" dot="yellow" />}
								{p.disconnected && <Badge label="DISCONNECTED" dot="red" />}
								{p.bugged && <Badge label="BUGGED" dot="red" />}
								{p.isDummy && <Badge label="DUMMY" dot="gray" />}
								{p.shiftedColor !== -1 && <Badge label={`SHAPESHIFTED → ${p.shiftedColor}`} dot="yellow" />}
								{voice && !p.isLocal && (
									<Badge
										label={!socketOk ? 'NO SOCKET' : audioOk ? 'VOICE OK' : 'NO AUDIO'}
										dot={!socketOk ? 'red' : audioOk ? 'green' : 'yellow'}
									/>
								)}
								{voice && (
									<Badge label={talking ? 'TALKING' : 'SILENT'} dot={talking ? 'green' : 'gray'} dim={!talking} />
								)}
								{cfg?.isMuted && <Badge label="MUTED BY ME" dot="red" />}
								{usingRadio && <Badge label="RADIO" dot="yellow" />}
							</Box>
							<Rows
								rows={[
									['id / clientId', `${p.id} / ${p.clientId}`],
									['playerConfigId', p.playerConfigId],
									['color', `${p.colorId}${color ? ' ' + color : ''}`],
									[
										'hat / skin / visor / pet',
										`${p.hatId || '–'} / ${p.skinId || '–'} / ${p.visorId || '–'} / ${p.petId}`,
									],
									['position', `x ${fmt(p.x)}  y ${fmt(p.y)}`],
									...(dist !== undefined ? ([['distance to me', dist]] as [string, unknown][]) : []),
									['ptr / object / task', `${hex(p.ptr)} / ${hex(p.objectPtr)} / ${hex(p.taskPtr)}`],
									...(voice && !p.isLocal
										? ([
												['socket id', peer ?? '–'],
												[
													'socket client',
													socketClient ? `player ${socketClient.playerId}, client ${socketClient.clientId}` : '–',
												],
												['audio stream', audioOk],
												['dead (voice)', voice.otherDead[p.clientId]],
												[
													'volume',
													cfg ? `${Math.round((cfg.volume ?? 1) * 100)}%${cfg.isMuted ? ' (muted)' : ''}` : 'default',
												],
											] as [string, unknown][])
										: []),
								]}
							/>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

export default DevPanel;
