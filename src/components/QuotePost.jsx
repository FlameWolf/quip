import { createSignal } from "solid-js";
import Editor from "./Editor";
import DisplayPostMinimal from "./DisplayPostMinimal";

export default props => {
	const [isOpen, setIsOpen] = createSignal(props.isOpen || false);
	const quotedPost = props.post;

	const closeModal = () => {
		setIsOpen(false);
		props.onClose?.();
	}

	return (
		<Show when={isOpen()}>
			<div class="modal d-block open">
				<div class="modal-dialog modal-dialog-centered">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Quote Post</h5>
							<button type="button" class="btn-close" onClick={closeModal}></button>
						</div>
						<div class="modal-body">
							<Editor isQuote={true} quotedPost={quotedPost} onCreate={closeModal}/>
							<div class="mt-3 border-top pt-3">
								<DisplayPostMinimal post={quotedPost}/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Show>
	);
};
