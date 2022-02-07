import Editor from "./components/Editor";
import DisplayPost from "./components/DisplayPost";
import { quipStore } from "./stores/quip-store";
import { createMemo, For } from "solid-js";
import { trimPost } from "./library";

export default props => {
	const renderRecursive = (post, isReply = false, parentBlurb = undefined) => {
		const replies = createMemo(() => quipStore.quips.filter(reply => reply.replyTo === post.id));
		return (
			<>
				<DisplayPost post={post} hasReplies={replies().length} isReply={isReply} parentBlurb={parentBlurb}/>
				<For each={replies()}>
				{
					(reply, index) => renderRecursive(reply, true, trimPost(post.content))
				}
				</For>
			</>
		);
	};
	return (
		<>
			<Editor id="post-editor" classList={{ "mb-2": true }}/>
			<ul class="list-group">
				<For each={quipStore.quips}>
				{
					(quip, index) => !quip.replyTo && renderRecursive(quip)
				}
				</For>
			</ul>
		</>
	);
};