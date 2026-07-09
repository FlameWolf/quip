import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { formatTimeAgo, nullId, parseContent, toLongDateString } from "../library";
import type { Post } from "../types";
import type { DisplayPostMinimalProps } from "../types/DisplayPostMinimalProps";

export default (props: DisplayPostMinimalProps) => {
	const post = props.post;
	const createdAt = post.createdAt;
	const attachments = post.attachments;
	const { poll, mediaFile, post: attachedPost } = attachments || {};
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
					<p class="card-text text-break">
						<Show when={post.content}>
							<span innerHTML={parseContent(post.content)}/>
						</Show>
						<Show when={poll}>
							<div class="mt-2">
								<div class="card">
									<div class="card-body py-3">
										<div class="card-title">Poll</div>
										<ul class="list-group list-group-flush">
											<li class="list-group-item">{poll!.first}</li>
											<li class="list-group-item">{poll!.second}</li>
											<Show when={poll!.third}>
												<li class="list-group-item">{poll!.third}</li>
											</Show>
											<Show when={poll!.fourth}>
												<li class="list-group-item">{poll!.fourth}</li>
											</Show>
										</ul>
									</div>
								</div>
							</div>
						</Show>
						<Show when={mediaFile}>
							<div class="mt-2">
								<Show when={mediaFile!.fileType === "image"}>
									<img class="img-fluid" alt={mediaFile!.description} src={mediaFile!.src}/>
								</Show>
								<Show when={mediaFile!.fileType === "video"}>
									<video class="img-fluid" aria-label={mediaFile!.description} src={mediaFile!.src} controls={true}/>
								</Show>
							</div>
						</Show>
						<Show when={typeof attachedPost === "string"}>
							<span>&#xA0;</span>
							<Show when={attachedPost !== nullId} fallback={<div class="text-bg-secondary border rounded p-3">The quoted post is not available.</div>}>
								<A class="text-break" href={`/post/${attachedPost as string}`} innerHTML={`${globalThis.location.origin}/post/${attachedPost as string}`} {...({ resolve: false } as any)}></A>
							</Show>
						</Show>
						<Show when={typeof attachedPost === "object"}>
							<span>&#xA0;</span>
							<A class="text-break" href={`/post/${(attachedPost as Post)._id}`} innerHTML={`${globalThis.location.origin}/post/${(attachedPost as Post)._id}`} {...({ resolve: false } as any)}></A>
						</Show>
					</p>
				</div>
			</div>
		</>
	);
};