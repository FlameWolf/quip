import { Show } from "solid-js";

export default props => {
	const post = props.post;
	const handle = post.author.handle;
	return (
		<>
			<div data-post-id={post._id} class="card" classList={{ "reply": props.isReply }}>
				<div class="post-header">
					<div>@</div>
					<a class="author.handle" href={`/${handle}`}>{handle}</a>
					<Show when={props.parentBlurb}>
						<div>&#xA0;</div>
						<div innerHTML={`Replied to "${props.parentBlurb}"`}></div>
					</Show>
				</div>
				<div class="card-body">
					<p class="card-text" innerHTML={post.content?.replace(/\n/g, "<br/>")}></p>
				</div>
			</div>
		</>
	);
};