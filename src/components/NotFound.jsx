import * as nodeEmoji from "node-emoji";

export default props => {
	const pageFacingUpEmojo = nodeEmoji.get(":page_facing_up:");
	const noEntryEmojo = nodeEmoji.get(":no_entry_sign:");
	const shrugEmojo = nodeEmoji.get(":shrug:");
	return (
		<div class="position-absolute-middle text-center w-100 p-5">
			<h1 class="text-primary">{pageFacingUpEmojo} Page {pageFacingUpEmojo}</h1>
			<hr/>
			<h1 class="text-danger">{noEntryEmojo} Not {noEntryEmojo}</h1>
			<hr/>
			<h1 class="text-primary">{shrugEmojo} Found {shrugEmojo}</h1>
		</div>
	);
};