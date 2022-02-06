import Editor from "./components/Editor";
import DisplayPost from "./components/DisplayPost";
import { quipStore, setQuipStore } from "./store/quip-store";
import { createMemo, For } from "solid-js";
import { trimPost } from "./library";

function App() {
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
			<div class="row">
				<div class="col px-5 py-3">
					<Editor id="post-editor" classList={{ "mb-2": true }}/>
					<ul class="list-group">
						<For each={quipStore.quips}>
						{
							(quip, index) => !quip.replyTo && renderRecursive(quip)
						}
						</For>
					</ul>
				</div>
			</div>
		</>
	);
}

export default App;