import { Show } from "solid-js";
import { formatTimeAgo, toLongDateString } from "../library";

export default props => {
	const post = props.post;
	const createdAt = post.createdAt;
	const handle = post.author.handle;
	return (
		<>
			<div data-post-id={post._id} class="card" classList={{ "reply": props.isReply }}>
				<div class="post-header">
					<a class="handle" href={`/${handle}`}>{handle}</a>
					<Show when={props.parentBlurb}>
						<div>&#xA0;</div>
						<div innerHTML={`Replied to "${props.parentBlurb}"`}></div>
					</Show>
					<div class="ms-auto">
						<a title={toLongDateString(createdAt)}>{formatTimeAgo(createdAt)}</a>
					</div>
				</div>
				<div class="card-body px-2 pb-2">
					<p class="card-text" innerHTML={post.content?.replace(/\n/g, "<br/>")}></p>
				</div>
			</div>
		</>
	);
};