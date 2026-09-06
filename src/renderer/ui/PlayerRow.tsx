import React, { useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Slider from '@mui/material/Slider';
import Avatar from '../Avatar';
import { Player } from '../../common/AmongUsState';
import { SocketConfig } from '../../common/ISettings';
import { ModsType } from '../../common/Mods';
import { ui } from './tokens';
import { Icons } from './icons';
import RoundButton from './RoundButton';

const AVATAR_SIZE = 30; // 30px + 2px border on each side = the 34px circle of the design

const useStyles = makeStyles(() => ({
	row: {
		position: 'relative',
		width: '100%',
		height: 41,
		flexShrink: 0,
		borderRadius: 8,
		backgroundColor: ui.row,
		boxSizing: 'border-box',
		transition: 'background-color .15s ease-out',
	},
	rowTalking: {
		backgroundColor: ui.rowTalking,
	},
	rowMuted: {
		opacity: 0.75,
	},
	avatar: {
		position: 'absolute',
		left: 12,
		top: 7,
		width: AVATAR_SIZE,
		height: AVATAR_SIZE,
		'& .MuiSvgIcon-root': {
			fontSize: 14,
			padding: 1,
		},
	},
	name: {
		position: 'absolute',
		left: 58,
		top: 8,
		maxWidth: 200,
		height: 12,
		lineHeight: '12px',
		fontFamily: ui.font,
		fontWeight: 600,
		fontSize: 10,
		color: ui.rowText,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		userSelect: 'none',
	},
	dead: {
		textDecoration: 'line-through',
		opacity: 0.7,
	},
	sliderWrap: {
		position: 'absolute',
		left: 58,
		top: 24,
		width: 54,
		height: 12,
		display: 'flex',
		alignItems: 'center',
	},
	slider: {
		height: 4,
		padding: '4px 0 !important',
		color: ui.sliderKnob,
		'& .MuiSlider-rail': {
			backgroundColor: ui.sliderTrack,
			opacity: 1,
			height: 4,
			borderRadius: 43,
		},
		'& .MuiSlider-track': {
			backgroundColor: '#6a7290',
			border: 'none',
			height: 4,
			borderRadius: 43,
		},
		'& .MuiSlider-thumb': {
			width: 6,
			height: 6,
			backgroundColor: ui.sliderKnob,
			'&:before': { boxShadow: 'none' },
			'&:hover, &.Mui-focusVisible, &.Mui-active': {
				boxShadow: '0 0 0 4px rgba(86, 93, 116, 0.35)',
			},
		},
		'& .MuiSlider-valueLabel': {
			fontSize: 9,
			fontFamily: ui.font,
			padding: '2px 5px',
			backgroundColor: ui.header,
			borderRadius: 4,
		},
	},
}));

export interface PlayerRowProps {
	player: Player;
	talking: boolean;
	isAlive: boolean;
	connectionState: 'disconnected' | 'novoice' | 'connected';
	isUsingRadio: boolean;
	socketConfig: SocketConfig;
	onConfigChange: () => void;
	mod: ModsType;
}

/** One row of the player list: avatar, name, volume slider and a mute toggle. */
const PlayerRow: React.FC<PlayerRowProps> = function ({
	player,
	talking,
	isAlive,
	connectionState,
	isUsingRadio,
	socketConfig,
	onConfigChange,
	mod,
}: PlayerRowProps) {
	const classes = useStyles();
	const [volume, setVolume] = useState<number>(socketConfig.volume ?? 1);
	const [muted, setMuted] = useState<boolean>(socketConfig.isMuted === true);

	useEffect(() => {
		setVolume(socketConfig.volume ?? 1);
		setMuted(socketConfig.isMuted === true);
	}, [socketConfig]);

	const toggleMute = () => {
		socketConfig.isMuted = !socketConfig.isMuted;
		setMuted(socketConfig.isMuted);
		onConfigChange();
	};

	const rowClass = [classes.row, talking ? classes.rowTalking : '', muted ? classes.rowMuted : ''].join(' ');

	return (
		<div className={rowClass}>
			<div className={classes.avatar}>
				<Avatar
					connectionState={connectionState}
					player={player}
					talking={talking}
					borderColor="#2ecc71"
					isAlive={isAlive}
					isUsingRadio={isUsingRadio}
					size={AVATAR_SIZE}
					mod={mod}
				/>
			</div>
			<span className={classes.name + (isAlive ? '' : ' ' + classes.dead)} title={player.name}>
				{player.name}
			</span>
			<div className={classes.sliderWrap}>
				<Slider
					className={classes.slider}
					size="small"
					value={volume}
					min={0}
					max={2}
					step={0.02}
					disabled={muted}
					onChange={(_, newValue: number | number[]) => {
						const v = newValue as number;
						socketConfig.volume = v;
						setVolume(v);
					}}
					onChangeCommitted={() => onConfigChange()}
					valueLabelDisplay="auto"
					valueLabelFormat={(value) => Math.floor(value * 100) + '%'}
					aria-label={`${player.name} volume`}
				/>
			</div>
			<RoundButton
				left={270}
				top={10}
				icon={Icons.headset}
				danger={muted}
				title={muted ? 'Unmute player' : 'Mute player'}
				onClick={toggleMute}
			/>
		</div>
	);
};

export default React.memo(PlayerRow);
