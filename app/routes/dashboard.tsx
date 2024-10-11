import { redirect, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./dashboard.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { validateLogin } from "~/apis/auth";
import { TemplateIndex, TemplateIndexDef } from "~/.server/templates/template";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import React from "react";

export const meta: MetaFunction = () => {
	return [
		{ title: "Dashboard - CClash Config Deliver" },
	];
};

export async function loader ({ request }: LoaderFunctionArgs) {
	
	if (!await validateLogin(request)) {
		return redirect("/login");
	}
	
	
	
	return {
		indexes: TemplateIndex.readIndex()
	};
	
}

function TemplateIndexItem (_: { index: TemplateIndexDef, enabled: boolean }) {
	
	return (
		<Link
			to={`/dashboard/${_.index.uuid}`}
			className={classes("template-index-item", css.templateIndexItem, _.enabled ? css.enabled : undefined)}>
			<div>
				<span>{_.index.name}</span>
			</div>
			<div className={classes(css.indicator)}></div>
		</Link>
	);
	
}

export default function Index() {
	
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const current_index = params.uuid
	
	return (
		<>
			<div className={classes(css.page)}>
				<div className={classes(css.pageSidebar)}>
					
					{data.indexes.map(item => {
						return (
							<TemplateIndexItem
								key={item.uuid}
								index={item}
								enabled={item.uuid === current_index}
							/>
						);
					})}
					
				</div>
				<div className={classes(css.pageContent)}>
					<Outlet />
				</div>
			</div>
		</>
	);
}
