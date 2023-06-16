import { createMemo, createSignal, For, onMount } from "solid-js";
import { trimPost } from "../library";
import { quipStore, setQuipStore } from "../stores/quip-store";
import DisplayPost from "./DisplayPost";
import Editor from "./Editor";

const postsUrl = `${import.meta.env.VITE_API_BASE_URL}/timeline`;

export default props => {
	let loadMoreButton;
	const [lastPostId, setLastPostId] = createSignal("");
	const loadPosts = async (lastPostId = undefined) => {
		const response = await fetch(lastPostId ? `${postsUrl}?lastPostId=${lastPostId}` : postsUrl);
		if (response.status === 200) {
			const posts = (await response.json()).posts;
			if (posts.length) {
				setQuipStore("quips", quips => [...quips, ...posts]);
				setLastPostId(posts.at(-1)._id);
				return;
			}
			loadMoreButton.textContent = "No More Posts";
			loadMoreButton.disabled = true;
		}
	};
	onMount(async () => {
		await loadPosts();
	});
	const renderRecursive = (post, isReply = false, parentBlurb = undefined) => {
		const replies = createMemo(() => quipStore.quips.filter(reply => reply.replyTo === post._id));
		return (
			<>
				<DisplayPost post={post} hasReplies={replies().length} isReply={isReply} parentBlurb={parentBlurb}/>
				<For each={replies()}>{(reply, index) => renderRecursive(reply, true, trimPost(post.content))}</For>
			</>
		);
	};
	return (
		<>
			<Editor id="post-editor" classList={{ "mb-2": true }}/>
			<ul class="list-group">
				<For each={quipStore.quips}>{(quip, index) => !quip.replyTo && renderRecursive(quip)}</For>
			</ul>
			<div class="my-2">
				<button ref={loadMoreButton} class="btn btn-primary form-control" onClick={() => loadPosts(lastPostId())}>Load More</button>
			</div>
		</>
	);
};