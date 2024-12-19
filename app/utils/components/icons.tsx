import './icons.stylus'
import styles from './icons.module.stylus'

import { CSSProperties } from 'react'
import { classes } from '../jsx-helper'
import { it } from '../fp'

interface MaterialSymbolProps {
	/**
	 * The name or ID of the symbol/icon.
	 * 
	 * For now, icon name like `star` is accepted. The code point like `0xe834` is not
	 * supported yet.
	 */
	children: string
	/**
	 * If the icon will be filled.
	 * 
	 * accepted a number within `0`-`1`. digitals within `0`-`1` like `0.5` is also
	 * supported that can make animations.
	 * 
	 * For more informations, see https://fonts.google.com/icons
	 */
	fill?: number
	/**
	 * Icon's stroke weight of the icon.
	 * 
	 * For more informations, see https://fonts.google.com/icons
	 */
	weight?: number
	/**
	 * Grade affect a symbol's thickness.
	 * 
	 * For more informations, see https://fonts.google.com/icons
	 */
	grade?: number
	/**
	 * Optical Size offers a way to automatically adjust the stroke weight when you
	 * increase or decrease the symbol size.
	 * 
	 * For more informations, see https://fonts.google.com/icons
	 */
	optical?: number
	/**
	 * If the icon should use Material Symbols default preset font-size line-height etc.
	 * 
	 * The default behavor of this component is no -- means this icons font-size and
	 * line-height etc will use the inherited value.
	 * 
	 * The default behavor of the Material Symbols library is yes. Set it to `true` to
	 * use this behavor.
	 */
	defaults?: boolean
}

/**
 * MaterialSymbol Component gives a easy way to use [Material Symbols]{https://fonts.google.com/icons}.
 * 
 * For now, the only supported version is Material Symbols (Rounded).
 */
export function MaterialSymbol (_: MaterialSymbolProps) {
	
	const type = 'rounded'
	const clazz = 'material-symbols-' + type
	const inherit_mode = !_.defaults
	
	const variables = (_.fill || _.grade || _.optical || _.weight) ? {
		fill: _.fill || 0,
		weight: _.weight || 400,
		grade: _.grade || 0,
		optical: _.optical || 24
	} : null
	const style: CSSProperties|undefined = variables ? {
		fontVariationSettings: `
			'FILL' ${variables.fill},
			'wght' ${variables.weight},
			'GRAD' ${variables.grade},
			'opsz' ${variables.optical}
		`
	} : undefined
	
	return <span
		className={classes("material-symbols", clazz, inherit_mode?styles['inherit-mode']:'')}
		style={style}
	>{_.children}</span>
	
}

export interface NerdFontSymbolProps {
	/**
	 * The name of the symbol/icon.
	 * 
	 * Can be class/name prefixed with `nf-` or nor. Cannot be icon itself or
	 * icon's UTF code.
	 */
	children: string
	/**
	 * If the icon should use Nerd Font Webfont default preset font-size line-height etc.
	 * 
	 * The default behavor of this component is no -- means this icons font-size and
	 * line-height etc will use the inherited value.
	 * 
	 * The default behavor of the Material Symbols library is yes. Set it to `true` to
	 * use this behavor.
	 */
	defaults?: boolean
}
export function NerdFontSymbol (_: NerdFontSymbolProps) {
	
	const symbolName = it(() => {
		if (_.children.startsWith('nf-'))
			return _.children.substring('nf-'.length)
		else return _.children
	})
	const inherit_mode = !_.defaults
	
	return <span
		className={classes('nf', 'nerd-font', 'nf-'+symbolName, inherit_mode?styles['inherit-mode']:'')}
	/>
	
}

export type IconModel =
	{ material?: boolean } & MaterialSymbolProps |
	{ nerd: true } & NerdFontSymbolProps

export function I (_: IconModel): JSX.Element {
	if ('nerd' in _)
		return <NerdFontSymbol {..._} />
	else
		return <MaterialSymbol {..._} />
}

export type IconDefinition = string | IconModel
export function getIcon (iconDef: IconDefinition): JSX.Element {
	if (typeof iconDef === "string") {
		return <I>{iconDef}</I>
	} else {
		return (<I {...iconDef} />)
	}
}
