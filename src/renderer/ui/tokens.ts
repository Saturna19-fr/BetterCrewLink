// Design tokens taken from the "BCL App" Figma file (node 1:2 "App").
export const ui = {
	width: 370,
	height: 509,
	radius: 17,
	headerHeight: 87,
	footerHeight: 34,
	font: "'Roboto', 'Varela', sans-serif",

	bg: '#242424',
	header: '#373E53',
	row: '#555555',
	rowTalking: '#5e6270',
	pill: '#a9a9a9',
	pillText: '#000000',
	rowText: '#000000',
	buttonBorder: '#e6ffd3',
	buttonHover: 'rgba(255, 255, 255, 0.10)',
	sliderTrack: '#373e53',
	sliderKnob: '#565d74',

	green: 'rgba(95, 233, 100, 0.6)',
	greenBorder: 'rgba(77, 177, 81, 0.4)',
	yellow: 'rgba(233, 189, 95, 0.6)',
	yellowBorder: 'rgba(233, 189, 95, 0.4)',
	red: 'rgba(233, 95, 95, 0.7)',
	redBorder: 'rgba(177, 77, 77, 0.5)',
	gray: 'rgba(200, 200, 200, 0.4)',
	grayBorder: 'rgba(200, 200, 200, 0.3)',
};

export type DotVariant = 'green' | 'yellow' | 'red' | 'gray';
