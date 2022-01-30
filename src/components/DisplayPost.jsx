import { createSignal } from "solid-js";
import { BsStar, BsStarFill, BsChatRight } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import Editor from "./Editor";

export default props => {
	const [faveFlag, setFaveFlag] = createSignal(false);
	const [repeatFlag, setRepeatFlag] = createSignal(false);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const toggleFave = event => {
		setFaveFlag(value => !value);
	};
	const toggleRepeat = event => {
		setRepeatFlag(value => !value);
	};
	const toggleReply = event => {
		let sourceActionBar = event.target.closest(".action-bar");
		let editorInstance = document.getElementById("reply-editor") || <Editor id="reply-editor"/>;
		if(editorInstance.parentElement === sourceActionBar) {
			sourceActionBar.removeChild(editorInstance);
		} else {
			sourceActionBar.appendChild(editorInstance);
		}
		editorInstance = null;
		sourceActionBar = null;
	};
	return (
		<div class="list-group-item p-0">
			<div class="card-body">
				<p class="card-text">{props.text}</p>
			</div>
			<div class="card-footer action-bar p-2">
				<div class="d-flex justify-content-end">
					<div onClick={toggleFave}>{faveFlag() ? <BsStarFill color="gold"/> : <BsStar/>}</div>
					<div onClick={toggleRepeat}>{repeatFlag() ? <FiRepeat color="green"/> : <FiRepeat/>}</div>
					<div onClick={toggleReply}><BsChatRight/></div>
				</div>
			</div>
		</div>
	);
};