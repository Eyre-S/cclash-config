import { MetaDescriptor, MetaFunction } from "@remix-run/node";

import { loader as rootLoader } from "~/root"

export type AppLoaders <R> = R & {
	"root": typeof rootLoader
}

export type AppMetaFunction <L, R> = MetaFunction<
	L,
	AppLoaders<R>
>

export type AppMatches <R> = Parameters<AppMetaFunction<any, R>>[0]['matches']

export function defineMeta <L, R> (metaFunction: AppMetaFunction<L, R>): AppMetaFunction<L, R> {
	return metaFunction
}

export function defineAppTitle <R> (matches: AppMatches<R>, ...title: string[]): MetaDescriptor {
	const _matches = matches as AppMatches<{}>
	const _title = [...title.reverse(), _matches.find(match => match.id == "root")?.data.siteName || ""]
	return { title: _title.join(' - ') }
}
