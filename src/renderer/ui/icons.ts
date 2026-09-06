// Icon assets exported from the Figma design. Sizes are the leaf (vector) sizes in px
// so each glyph keeps the geometry it has in the 10x10 icon frame of the design.
// @ts-ignore
import micOff from '../../../static/images/ui/icon-mic-off.svg'; // @ts-ignore
import headset from '../../../static/images/ui/icon-headset.svg'; // @ts-ignore
import settings from '../../../static/images/ui/icon-settings.svg'; // @ts-ignore
import code from '../../../static/images/ui/icon-code.svg'; // @ts-ignore
import headerBg from '../../../static/images/ui/header-bg.svg';

export interface IconAsset {
	src: string;
	width: number;
	height: number;
}

export const Icons: { [key: string]: IconAsset } = {
	micOff: { src: micOff, width: 7.49, height: 8.75 },
	headset: { src: headset, width: 8.75, height: 8.13 },
	settings: { src: settings, width: 8.48, height: 8.96 },
	code: { src: code, width: 8.33, height: 7.27 },
};

export const HeaderBackground: string = headerBg;
