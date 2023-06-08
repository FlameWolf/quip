import { useParams } from "@solidjs/router";
import { createMemo, For } from "solid-js";
import { quipStore } from "../stores/quip-store";
import { userStore } from "../stores/user-store";
import DisplayPost from "./DisplayPost";

export default props => {
	const params = useParams();
	const profileUser = userStore.users.find(
		user => user.handle.toLowerCase() === params.handle.toLowerCase()
	);
	const userQuips = createMemo(
		() => quipStore.quips.filter(quip => quip.author._id === profileUser.id)
	);
	return (
		<>
			<div class="card mb-2">
				<div class="card-header">
					<div class="card-title">@{profileUser.handle}</div>
				</div>
				<div class="card-body">
					<p>{userQuips().length} Quips</p>
				</div>
			</div>
			<ul class="list-group">
				<For each={userQuips()}>
				{
					(quip, index) => <DisplayPost post={quip}/>
				}
				</For>
			</ul>
		</>
	);
};