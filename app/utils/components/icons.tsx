import { CSSProperties } from "react"

import { is, it } from "../fp"
import { classes } from "../jsx-helper"

import styles from "./icons.module.stylus"

import "./icons.stylus"

interface UniversalIconProps {
	
	/**
	 * The name of the symbol/icon.
	 * 
	 * Receives a string that indicates a unique icon under the specific icon provider.
	 * The value format may be different between different providers.
	 * 
	 * ### Material Symbols
	 * 
	 * As a material symbols, it can be the icon name (like `star`), cannot add prefixes like
	 * `material-symbols-`. It cannot be the icon's codepoint (like `e89e` or `0xe89e`).
	 * 
	 * ### Nerd Font Icons
	 * 
	 * As nerd font icon, it can be class/name prefixed with `nf-` or nor. Cannot
	 * be icon itself or icon's UTF code.
	 */
	children: string
	
	/**
	 * Additional css classes.
	 */
	className?: string
	
}

interface ExtendedIconProps extends UniversalIconProps {
	
	/**
	 * If the icon should use provides default preset `font-size` `line-height` etc.
	 * 
	 * The default value is `false` -- means this icons `font-size` and
	 * `line-height` etc will use the `inherit` value.
	 */
	defaults?: boolean
	
	/**
	 * Whether to use `display: block` to make the icon more likely a image, instead of a text.
	 * 
	 * This may fixes some issues when using the icon in the buttons or others places: the icon
	 * may looks like floating up, not aligned to the center.
	 * 
	 * Default is false, mostly means the icon will be displayed as a text (`display: inline-block`)
	 * (actually when `false`, the display method is controlled by the icon provider's default styles).
	 * 
	 * The name `mg` is a part of `img`, just be able to be combined with the name of the component `I`.
	 */
	mg?: boolean
	
}

interface MaterialSymbolProps extends UniversalIconProps {
	
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
	
	// todo:
	//  whether to add switch adjusting the baseline of icon.
	//  related documentation: https://m3.material.io/styles/icons/applying-icons#e27c90d0-0024-44b5-818c-4ccdecc87015
	
}

/**
 * MaterialSymbol Component gives a easy way to use [Material Symbols]{https://fonts.google.com/icons}.
 * 
 * For now, the only supported version is Material Symbols (Rounded).
 */
export function MaterialSymbol (_: MaterialSymbolProps) {
	
	const type = 'rounded'
	
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
		className={classes("material-symbols", 'material-symbols-'+type, _.className)}
		style={style}
	>{_.children}</span>
	
}

export interface NerdFontSymbolProps extends UniversalIconProps {}

export function NerdFontSymbol (_: NerdFontSymbolProps) {
	
	const symbolName = it(() => {
		if (_.children.startsWith('nf-'))
			return _.children.substring('nf-'.length)
		else return _.children
	})
	
	return <span
		className={classes('nf', 'nerd-font', 'nf-'+symbolName, _.className)}
	/>
	
}

export type IconModel = (
	{ material?: boolean } & MaterialSymbolProps |
	{ nerd: true } & NerdFontSymbolProps
) & ExtendedIconProps

export function I (props: IconModel): JSX.Element {
	
	const { className, defaults, mg, ...rest } = props
	const inheritMode = !defaults
	const mixedClassName = classes(
		'icon',
		is(inheritMode, styles.inheritMode),
		is(mg, styles.imgMode),
		className
	)
	
	const mixedProps = {
		className: mixedClassName,
		...rest
	}
	
	if ('nerd' in props)
		return <NerdFontSymbol {...mixedProps} />
	else
		return <MaterialSymbol {...mixedProps} />
	
}

export type IconDefinition = string | IconModel | JSX.Element
export function getIcon (iconDef: IconDefinition): JSX.Element {
	if (typeof iconDef === "string") {
		// icon as a string, uses the default icon provider: Material Symbols
		return <I>{iconDef}</I>
	} else if ("type" in iconDef) {
		// icon as a JSX.Element, just return it as is.
		return iconDef
	} else {
		// icon as an IconModel object, use this object to create the icon.
		return (<I {...iconDef} />)
	}
}
