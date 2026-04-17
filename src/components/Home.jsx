import { createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { emptyString, getErrorMessage } from "../library";
import { quipStore, setQuipStore } from "../stores/quip-store";
import { setErrorStore } from "../stores/error-store";
import Editor from "./Editor";
import DisplayPostList from "./DisplayPostList";

const postsUrl = `${import.meta.env.VITE_API_BASE_URL}/timeline`;

export default props => {
	let loadMoreButton;
	const navigate = useNavigate();
	const [lastPostId, setLastPostId] = createSignal(emptyString);
	const loadPosts = async (lastPostId = undefined) => {
		try {
			const response = await fetch(lastPostId ? `${postsUrl}?lastPostId=${lastPostId}` : postsUrl);
			switch (response.status) {
				case 200:
					const posts = (await response.json()).posts;
					if (posts.length) {
						setQuipStore("quips", quips => quips.concat(posts));
						setLastPostId(posts.at(-1)._id);
						return;
					}
					if(loadMoreButton) {
						loadMoreButton.textContent = "No More Posts";
						loadMoreButton.disabled = true;
					}
					break;
				case 401:
					navigate("/auth");
					break;
				default:
					setErrorStore("message", await getErrorMessage(response));
					break;
			}
		} catch (err) {
			setErrorStore("message", err.message);
		}
	};
	onMount(async () => {
		setQuipStore("quips", []);
		await loadPosts();
	});
	return (
		<>
			<Editor id="post-editor" classList={{ "mb-2": true }}/>
			<Show when={!quipStore.quips.length}>
				<div class="d-flex justify-content-center align-items-center text-info border border-info rounded p-3">
					<div>No posts to display.</div>
				</div>
			</Show>
			<Show when={quipStore.quips.length}>
				<DisplayPostList posts={quipStore.quips}/>
				<div class="my-2">
					<button ref={loadMoreButton} class="btn btn-primary form-control" onClick={() => loadPosts(lastPostId())}>Load More</button>
				</div>
			</Show>
		</>
	);
};