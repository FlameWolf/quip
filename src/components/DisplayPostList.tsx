import { createMemo, For } from "solid-js";
import { escapeHtml, trimPost } from "../library";
import DisplayPost from "./DisplayPost";
import type { Post } from "../types";
import type { DisplayPostListProps } from "../types/DisplayPostListProps";

export default (props: DisplayPostListProps) => {
	const posts = createMemo(() => props.posts || []);
	const topLevelPosts = createMemo(() => posts().filter(post => !post.replyTo || !posts().some(parent => parent._id === post.replyTo)));
	const getPostBlurb = (post: Post) => {
		let blurb = escapeHtml(trimPost(post.content));
		if (!blurb) {
			const { mediaFile } = post.attachments ?? {};
			if (mediaFile) {
				const blurbPrefix = mediaFile.fileType === "image" ? "Image" : mediaFile.fileType === "video" ? "Video" : "Media";
				blurb = `[${blurbPrefix}] <img class="blurb-media" src="${escapeHtml(mediaFile.src)}" alt="${escapeHtml(mediaFile.description || "Media attachment")}"/>`;
			}
		}
		return blurb;
	};
	const renderRecursive = (post: Post, isReply: boolean | string = false, parentBlurb: string | undefined = undefined) => {
		const replies = createMemo(() => posts().filter(reply => reply.replyTo === post._id));
		return (
			<>
				<DisplayPost post={post} hasReplies={replies().length} isReply={isReply || post.replyTo} parentBlurb={parentBlurb}/>
				<For each={replies()}>{reply => renderRecursive(reply, true, getPostBlurb(post))}</For>
			</>
		);
	};
	return (
		<ul class="list-group">
			<For each={topLevelPosts()}>{post => renderRecursive(post)}</For>
		</ul>
	);
};
