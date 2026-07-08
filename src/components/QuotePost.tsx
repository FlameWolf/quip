import { createSignal } from "solid-js";
import { Modal } from "solid-bootstrap";
import Editor from "./Editor";
import DisplayPostMinimal from "./DisplayPostMinimal";
import type { QuotePostProps } from "../types/QuotePostProps";

export default (props: QuotePostProps) => {
	const [isOpen, setIsOpen] = createSignal(props.isOpen || false);
	const quotedPost = props.post;

	const closeModal = () => {
		setIsOpen(false);
		props.onClose?.();
	};
	return (
		<Modal class="modal-fullscreen-sm-down" show={isOpen()} onHide={closeModal}>
			<Modal.Header closeButton={true}>
				<Modal.Title>Quote Post</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Editor isQuote={true} quotedPost={quotedPost} onSubmit={closeModal}/>
				<div class="mt-3 border-top pt-3">
					<DisplayPostMinimal post={quotedPost}/>
				</div>
			</Modal.Body>
		</Modal>
	);
};