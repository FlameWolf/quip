import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { trimPost } from "../library";
import DisplayPost from "./DisplayPost";

export default props => {
	const posts = createMemo(() => props.posts || []);
	const topLevelPosts = createMemo(() => posts().filter(post => !post.replyTo || !posts().some(parent => parent._id === post.replyTo)));
	const getPostBlurb = post => {
		let blurb = trimPost(post.content);
		if (!blurb) {
			const { mediaFile } = post.attachments;
			if (mediaFile) {
				let blurbPrefix = mediaFile.fileType === "image" ? "Image" : mediaFile.fileType === "video" ? "Video" : "Media";
				blurb = `[${blurbPrefix}] <img class="blurb-media" src="${mediaFile.src}" alt="${mediaFile.mediaDescription || "Media attachment"}"/>`;
			}
		}
		return blurb;
	};
	const renderRecursive = (post, isReply = false, parentBlurb = undefined) => {
		const replies = createMemo(() => posts().filter(reply => reply.replyTo === post._id));
		return (
			<>
				<DisplayPost post={post} hasReplies={replies().length} isReply={isReply || post.replyTo} parentBlurb={parentBlurb}/>
				<For each={replies()}>{(reply, index) => renderRecursive(reply, true, getPostBlurb(post))}</For>
			</>
		);
	};
	return (
		<>
			<Show when={!posts()?.length}>
				<div class="text-center mt-4">
					<div class="spinner-border" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
				</div>
			</Show>
			<Show when={posts()?.length}>
				<ul class="list-group">
					<For each={topLevelPosts()}>{(post, index) => renderRecursive(post)}</For>
				</ul>
			</Show>
		</>
	);
};