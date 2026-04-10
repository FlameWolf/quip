import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { emptyString } from "../library";
import { quipStore, setQuipStore } from "../stores/quip-store";
import Editor from "./Editor";
import DisplayPostList from "./DisplayPostList";

const postsUrl = `${import.meta.env.VITE_API_BASE_URL}/timeline`;

export default props => {
	let loadMoreButton;
	const navigate = useNavigate();
	const [lastPostId, setLastPostId] = createSignal(emptyString);
	const loadPosts = async (lastPostId = undefined) => {
		const response = await fetch(lastPostId ? `${postsUrl}?lastPostId=${lastPostId}` : postsUrl);
		switch (response.status) {
			case 200:
				const posts = (await response.json()).posts;
				if (posts.length) {
					setQuipStore("quips", quips => quips.concat(posts));
					setLastPostId(posts.at(-1)._id);
					return;
				}
				loadMoreButton.textContent = "No More Posts";
				loadMoreButton.disabled = true;
				break;
			case 401:
				navigate("/auth");
				break;
			default:
				break;
		}
	};
	onMount(async () => {
		await loadPosts();
	});
	return (
		<>
			<Editor id="post-editor" classList={{ "mb-2": true }}/>
			<DisplayPostList posts={quipStore.quips}/>
			<div class="my-2">
				<button ref={loadMoreButton} class="btn btn-primary form-control" onClick={() => loadPosts(lastPostId())}>Load More</button>
			</div>
		</>
	);
};