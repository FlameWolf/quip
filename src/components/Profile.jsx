import { useParams } from "@solidjs/router";
import { createResource, For, Show, Suspense } from "solid-js";
import DisplayPost from "./DisplayPost";

export default props => {
	const params = useParams();
	const [profileUser] = createResource(async handle => await (await fetch(`${import.meta.env.VITE_API_BASE_URL}users/${params.handle}`)).json());
	const [userQuips, { mutate, refetch }] = createResource(async handle => await (await fetch(`${import.meta.env.VITE_API_BASE_URL}users/${params.handle}/posts`)).json());
	return (
		<Suspense fallback={<h4>Loading...</h4>}>
			<Show when={profileUser.state === "ready"}>
				<div class="card mb-2">
					<div class="card-header">
						<div class="card-title">@{profileUser().user.handle}</div>
					</div>
					<div class="card-body">
						<p>{userQuips()?.length} Quips</p>
					</div>
				</div>
			</Show>
			<ul class="list-group">
				<Show when={userQuips.state === "ready"}>
					<For each={userQuips().posts}>
					{
						(quip, index) => <DisplayPost post={quip}/>
					}
					</For>
				</Show>
			</ul>
		</Suspense>
	);
};