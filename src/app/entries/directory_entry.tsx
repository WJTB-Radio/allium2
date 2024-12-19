import { ReactNode } from "react";
import { selectDirectory } from "../ipc";
import { joinPaths, removePathPrefix } from "../util/path";

export function DirectoryEntry(props: {
	children: ReactNode;
	root: string;
	value: string;
	setValue: (value: string) => void;
}) {
	return (
		<div className="entry">
			<span>
				{props.children} {joinPaths(props.root, props.value)}
			</span>
			<button
				onClick={async () => {
					const selected = await selectDirectory(props.root);
					if (selected == undefined) return;
					props.setValue(
						removePathPrefix(props.root, selected) ?? "",
					);
				}}
			>
				select directory
			</button>
		</div>
	);
}
