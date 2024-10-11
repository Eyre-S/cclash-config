import { LoaderFunctionArgs } from "@remix-run/node";
import { readTemplate, TemplateIndex } from "~/.server/templates/template";

import css from "./dashboard.uuid.module.stylus"
import { useLoaderData } from "@remix-run/react";
import { classes } from "~/utils/jsx-helper";

export async function loader ({ params }: LoaderFunctionArgs) {
	
	const uuid = params.uuid as string
	const item = TemplateIndex.findByUUID(uuid) as TemplateIndex
	
	return {
		item: item,
		content: item.getTemplate()
	}
	
}

export default function () {
	
	const data = useLoaderData<typeof loader>()
	
	return <>
		<div className={classes(css.itemEdit)}>
			<textarea
				className={classes(css.editor)}
				defaultValue={data.content} />
		</div>
	</>
	
}