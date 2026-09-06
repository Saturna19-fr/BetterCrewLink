import React, { useMemo } from 'react';
import { ipcRenderer } from 'electron';
import makeStyles from '@mui/styles/makeStyles';
import {
	AmongUsState,
	AudioConnected,
	ClientBoolMap,
	GameState,
	numberStringMap,
	Player,
	SocketClientMap,
} from '../../common/AmongUsState';
import { CameraLocation, MapType } from '../../common/AmongusMap';
import { ILobbySettings, playerConfigMap } from '../../common/ISettings';
import { ui, DotVariant } from './tokens';
import StatusDot from './StatusDot';

const useStyles = makeStyles(() => ({
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
		gap: 6,
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
		borderRadius: 5,
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
		gap: 8,
	},
	section: {
		background: '#2d2d2d',
		borderRadius: 8,
		padding: '6px 8px',
	},
	sectionTitle: {
		fontWeight: 700,
		fontSize: 11,
		marginBottom: 4,
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		userSelect: 'none',
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'max-content 1fr',
		columnGap: 8,
		rowGap: 1,
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
		gap: 4,
		margin: '2px 0 5px 0',
	},
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		padding: '1px 6px',
		borderRadius: 40,
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
		borderRadius: 4,
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
		padding: 20,
	},
}));

export interface DevVoiceInfo {
	serverURL: string;
	connected: boolean;
	peerCount: number;
	socketClients: SocketClientMap;
	playerSocketIds: numberStringMap;
	audioConnected: AudioConnected;
	otherTalking: ClientBoolMap;
	otherVAD: ClientBoolMap;
	otherDead: ClientBoolMap;
	playerConfigs: playerConfigMap;
	impostorRadioClientId: number;
	localTalking: boolean;
	muted: boolean;
	deafened: boolean;
	lobbySettings: ILobbySettings;
}

export interface DevPanelProps {
	open: boolean;
	onClose: () => void;
	gameState: AmongUsState;
	playerColors: string[][];
	voice?: DevVoiceInfo;
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
	const classes = useStyles();
	return (
		<div className={classes.grid}>
			{rows.map(([k, v]) => (
				<React.Fragment key={k}>
					<span className={classes.key}>{k}</span>
					<span className={classes.value}>{fmt(v)}</span>
				</React.Fragment>
			))}
		</div>
	);
};

interface BadgeProps {
	label: string;
	dot?: DotVariant;
	dim?: boolean;
}

const Badge: React.FC<BadgeProps> = function ({ label, dot, dim }: BadgeProps) {
	const classes = useStyles();
	return (
		<span className={classes.badge + (dim ? ' ' + classes.muted : '')}>
			{dot && <StatusDot variant={dot} />}
			{label}
		</span>
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
	const classes = useStyles();

	const players = useMemo(() => {
		const list = gameState?.players ? [...gameState.players] : [];
		return list.sort((a, b) => Number(b.isLocal) - Number(a.isLocal) || a.id - b.id);
	}, [gameState?.players]);

	if (!open) return <></>;

	const me = players.find((p) => p.isLocal);
	const hasGame = !!gameState && gameState.gameState !== undefined;

	const copyJson = () => {
		const dump = { gameState, voice: voice ? { ...voice, lobbySettings: voice.lobbySettings } : undefined, error };
		navigator.clipboard.writeText(JSON.stringify(dump, null, 2)).catch(() => undefined);
	};

	const stateName = (s: GameState | undefined) => (s === undefined ? '–' : `${GameState[s]} (${s})`);

	return (
		<div className={classes.root}>
			<div className={classes.toolbar}>
				<span className={classes.title}>Dev info</span>
				<button className={classes.tool} onClick={copyJson} title="Copy everything as JSON">
					Copy JSON
				</button>
				<button className={classes.tool} onClick={() => ipcRenderer.send('reload')} title="Reload the app">
					Reload
				</button>
				<button className={classes.tool} onClick={onClose} title="Close">
					✕
				</button>
			</div>
			<div className={classes.scroll}>
				{error && (
					<div className={classes.section}>
						<div className={classes.sectionTitle}>
							<StatusDot variant="red" /> Error
						</div>
						<span className={classes.value}>{error}</span>
					</div>
				)}

				<div className={classes.section}>
					<div className={classes.sectionTitle}>
						<StatusDot variant={hasGame ? 'green' : 'gray'} /> Game
					</div>
					{hasGame ? (
						<Rows
							rows={[
								['state', stateName(gameState.gameState)],
								['previous state', stateName(gameState.oldGameState)],
								['lobby code', `${gameState.lobbyCode} (${gameState.lobbyCodeInt})`],
								['map', `${MapType[gameState.map]} (${gameState.map})`],
								['mod', gameState.mod],
								['server', gameState.currentServer],
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
						<span className={classes.muted}>No game state yet. Open Among Us.</span>
					)}
				</div>

				{voice && (
					<div className={classes.section}>
						<div className={classes.sectionTitle}>
							<StatusDot variant={voice.connected ? 'green' : 'red'} /> Voice
						</div>
						<Rows
							rows={[
								['server', voice.serverURL],
								['socket', voice.connected ? 'connected' : 'disconnected'],
								['peers', voice.peerCount],
								['known sockets', Object.keys(voice.socketClients).length],
								['audio streams', Object.values(voice.audioConnected).filter(Boolean).length],
								[
									'me',
									`${voice.localTalking ? 'talking' : 'silent'}, ${voice.muted ? 'muted' : 'unmuted'}, ${
										voice.deafened ? 'deafened' : 'hearing'
									}`,
								],
								['radio clientId', voice.impostorRadioClientId],
							]}
						/>
						<div className={classes.sectionTitle} style={{ marginTop: 6 }}>
							Lobby settings
						</div>
						<Rows rows={Object.entries(voice.lobbySettings ?? {}) as [string, unknown][]} />
					</div>
				)}

				{players.length === 0 && hasGame && <div className={classes.empty}>No players in memory.</div>}

				{players.map((p: Player) => {
					const color = playerColors?.[p.colorId]?.[0];
					const peer = voice?.playerSocketIds[p.clientId];
					const socketClient = peer !== undefined ? voice?.socketClients[peer] : undefined;
					const socketOk = !!socketClient && socketClient.clientId === p.clientId;
					const audioOk = peer !== undefined && !!voice?.audioConnected[peer];
					const cfg = voice?.playerConfigs[p.nameHash];
					const talking = p.isLocal ? voice?.localTalking : voice?.otherTalking[p.clientId];
					const vad = p.isLocal ? undefined : voice?.otherVAD[p.clientId];
					const usingRadio = voice ? voice.impostorRadioClientId === p.clientId : false;
					const isHost = gameState.hostId === p.clientId;
					const dist = me && !p.isLocal ? Math.hypot(p.x - me.x, p.y - me.y) : undefined;

					return (
						<div className={classes.section} key={`${p.id}-${p.clientId}`}>
							<div className={classes.sectionTitle}>
								<span className={classes.swatch} style={{ background: color ?? '#888' }} />
								<span className={classes.playerName} title={p.name}>
									{p.name || '(no name)'}
								</span>
								<span className={classes.muted} style={{ marginLeft: 'auto' }}>
									#{p.id}
								</span>
							</div>
							<div className={classes.badges}>
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
							</div>
							<Rows
								rows={[
									['id / clientId', `${p.id} / ${p.clientId}`],
									['nameHash', p.nameHash],
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
												['VAD', vad],
												['dead (voice)', voice.otherDead[p.clientId]],
												[
													'volume',
													cfg ? `${Math.round((cfg.volume ?? 1) * 100)}%${cfg.isMuted ? ' (muted)' : ''}` : 'default',
												],
										  ] as [string, unknown][])
										: []),
								]}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default DevPanel;
