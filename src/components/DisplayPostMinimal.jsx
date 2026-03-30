import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { formatTimeAgo, toLongDateString } from "../library";

export default props => {
	const post = props.post;
	const createdAt = post.createdAt;
	const handle = post.author.handle;
	return (
		<>
			<div data-post-id={post._id} class="card border px-2" classList={{ reply: props.isReply }}>
				<div class="post-header">
					<A class="handle" href={`/${handle}`}>{handle}</A>
					<Show when={props.parentBlurb}>
						<div>&#xA0;</div>
						<div innerHTML={`Replied to "${props.parentBlurb}"`}></div>
					</Show>
					<div class="ms-auto">
						<a title={toLongDateString(createdAt)}>{formatTimeAgo(createdAt)}</a>
					</div>
				</div>
				<div class="card-body px-2 pb-2">
					<p class="card-text">
						<Show when={post.content}>
							<span innerHTML={post.content.replace(/\n/g, "<br/>")}/>
						</Show>
						<Show when={post.attachments?.mediaFile}>
							<div class="mt-2">
								<img src={post.attachments.mediaFile.src} class="img-fluid rounded"/>
							</div>
						</Show>
						<Show when={post.attachments?.poll}>
							<div class="mt-2">
								<div class="card">
									<div class="card-body py-3">
										<div class="card-title">Poll</div>
										<ul class="list-group list-group-flush">
											<li class="list-group-item">{post.attachments.poll.first}</li>
											<li class="list-group-item">{post.attachments.poll.second}</li>
											<Show when={post.attachments.poll.third}>
												<li class="list-group-item">{post.attachments.poll.third}</li>
											</Show>
											<Show when={post.attachments.poll.fourth}>
												<li class="list-group-item">{post.attachments.poll.fourth}</li>
											</Show>
										</ul>
									</div>
								</div>
							</div>
						</Show>
					</p>
				</div>
			</div>
		</>
	);
};