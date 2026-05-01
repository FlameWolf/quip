import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { formatTimeAgo, parseContent, toLongDateString, trimPost } from "../library";
import { FaSolidImage, FaSolidListDots } from "solid-icons/fa";
import { RiDocumentFileTextFill } from "solid-icons/ri";

export default props => {
	const post = props.post;
	const createdAt = post.createdAt;
	const attachments = post.attachments;
	const { poll, mediaFile, post: attachedPost } = attachments || {};
	const { attachments: nestedAttachments } = attachedPost || {};
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
							<span innerHTML={parseContent(post.content)}/>
						</Show>
						<Show when={poll}>
							<div class="mt-2">
								<div class="card">
									<div class="card-body py-3">
										<div class="card-title">Poll</div>
										<ul class="list-group list-group-flush">
											<li class="list-group-item">{poll.first}</li>
											<li class="list-group-item">{poll.second}</li>
											<Show when={poll.third}>
												<li class="list-group-item">{poll.third}</li>
											</Show>
											<Show when={poll.fourth}>
												<li class="list-group-item">{poll.fourth}</li>
											</Show>
										</ul>
									</div>
								</div>
							</div>
						</Show>
						<Show when={mediaFile}>
							<div class="mt-2">
								<Show when={mediaFile.fileType === "image"}>
									<img class="img-fluid" alt={mediaFile.description} src={mediaFile.src}/>
								</Show>
								<Show when={mediaFile.fileType === "video"}>
									<video class="img-fluid" alt={mediaFile.description} src={mediaFile.src} controls={true}/>
								</Show>
							</div>
						</Show>
						<Show when={attachedPost}>
							<div class="border rounded mt-2">
								<ul class="list-group list-group-flush">
									<Show when={attachedPost.content}>
										<li class="list-group-item">
											<span innerHTML={trimPost(attachedPost.content)}></span>
										</li>
									</Show>
									<Show when={nestedAttachments?.poll}>
										<li class="list-group-item">
											<span><FaSolidListDots/></span>
											<span class="fst-italic">&#xA0;[Poll]</span>
										</li>
									</Show>
									<Show when={nestedAttachments?.mediaFile}>
										<li class="list-group-item">
											<span><FaSolidImage/></span>
											<span class="fst-italic">&#xA0;[Media]</span>
										</li>
									</Show>
									<Show when={typeof attachedPost === "string" || nestedAttachments?.post}>
										<li class="list-group-item">
											<span><RiDocumentFileTextFill/></span>
											<span class="fst-italic">&#xA0;[Quote]</span>
										</li>
									</Show>
								</ul>
							</div>
						</Show>
					</p>
				</div>
			</div>
		</>
	);
};