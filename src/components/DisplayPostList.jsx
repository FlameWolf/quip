import { createMemo, For } from "solid-js";
import { trimPost } from "../library";
import DisplayPost from "./DisplayPost";

export default props => {
	const posts = createMemo(() => props.posts);
	const renderRecursive = (post, isReply = false, parentBlurb = undefined) => {
		const replies = createMemo(() => posts().filter(reply => reply.replyTo === post._id));
		return (
			<>
				<DisplayPost post={post} hasReplies={replies().length} isReply={isReply || post.replyTo} parentBlurb={parentBlurb}/>
				<For each={replies()}>{(reply, index) => renderRecursive(reply, true, trimPost(post.content))}</For>
			</>
		);
	};
	return (
		<ul class="list-group">
			<For each={posts()}>{(post, index) => (!post.replyTo || !posts().some(parent => parent._id === post.replyTo)) && renderRecursive(post)}</For>
		</ul>
	);
};