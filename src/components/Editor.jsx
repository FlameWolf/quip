import { createPopup } from "@picmo/popup-picker";
import { position } from "caret-pos";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { contentLengthRegExp, innerHtmlAsText, insertEmojo, maxContentLength, popularEmoji, removeFormatting } from "../library";
import { BsImage } from "solid-icons/bs";
import { BiRegularPoll } from "solid-icons/bi";
import { VsChromeClose } from "solid-icons/vs";
import { setQuipStore } from "../stores/quip-store";
import { authStore } from "../stores/auth-store";

export default props => {
	let currentInstance;
	let editableDiv;
	let emojiTrigger;
	let emojiPopup;
	let mediaFileInput;
	const createPostUrl = `${import.meta.env.VITE_API_BASE_URL}posts/create`;
	const createReplyUrl = `${import.meta.env.VITE_API_BASE_URL}posts/reply/`;
	const [caret, setCaret] = createSignal(0);
	const [charCount, setCharCount] = createSignal(maxContentLength);
	const [hasPoll, setHasPoll] = createSignal(false);
	const [poll, setPoll] = createSignal({});
	const [mediaFile, setMediaFile] = createSignal();
	const getTextContent = () => innerHtmlAsText(editableDiv);
	const getCharCount = text => text.match(contentLengthRegExp)?.length || 0;
	const updateEditor = event => {
		removeFormatting(editableDiv);
		setCharCount(maxContentLength - getCharCount(getTextContent()));
	};
	const updatePoll = event => {
		const sender = event.target;
		setPoll({ ...poll(), [sender.name]: sender.value });
	};
	const resetEditor = () => {
		editableDiv.innerHTML = "";
		setHasPoll(false);
		setMediaFile();
		setCharCount(maxContentLength);
	};
	const makeQuip = async () => {
		const parentPostId = currentInstance.dataset.parentPostId;
		const formData = new FormData();
		formData.append("content", getTextContent());
		if (hasPoll()) {
			const currentPoll = poll();
			const { days, hours, minutes } = currentPoll;
			if (days || hours || minutes) {
				currentPoll.duration = (
					((parseInt(days) || 0) * 60 * 24) +
					((parseInt(hours) || 0) * 60) +
					(parseInt(minutes) || 0)
				) * 60 * 1000;
			}
			delete currentPoll.minutes;
			delete currentPoll.hours;
			delete currentPoll.days;
			formData.append("poll", JSON.stringify(currentPoll));
		}
		if (mediaFile()) {
			formData.append("media", mediaFile());
		}
		const response = await fetch(parentPostId ? `${createReplyUrl}${parentPostId}` : createPostUrl, {
			method: "POST",
			body: formData
		});
		if (response.status === 201) {
			const payload = await response.json();
			const post = payload.reply || payload.post;
			post.author = { handle: authStore.handle };
			setQuipStore("quips", quips => [post, ...quips]);
			resetEditor();
			if (props.isReply) {
				currentInstance.closest(".action-bar").querySelector(".action-buttons > div:last-child").click();
			}
		}
	};
	const characterLimitExceeded = createMemo(() => charCount() < 0);
	onMount(() => {
		emojiPopup = createPopup(
			{
				emojiSize: "1.25rem",
				showAnimation: false,
				showVariants: false
			},
			{
				position: {
					top: "1rem",
					right: "1rem"
				},
				hideOnClickOutside: false,
				hideOnEmojiSelect: false,
				showCloseButton: true,
				hideOnEscape: true
			}
		);
		emojiPopup.addEventListener("emoji:select", selection => {
			position(editableDiv, caret());
			insertEmojo(editableDiv, selection.emoji, updateEditor);
		});
	});
	return (
		<div ref={currentInstance} {...props} class="bg-white text-black border rounded p-2">
			<div ref={editableDiv} class="p-2 outline-0" contentEditable={true} onInput={updateEditor} onBlur={_ => setCaret(position(editableDiv).pos)}></div>
			<Show when={hasPoll()}>
				<div class="card mb-1" onInput={updatePoll}>
					<div class="card-body px-2">
						<input class="form-control my-1" name="first" type="text" placeholder="Option 1"/>
						<input class="form-control my-1" name="second" type="text" placeholder="Option 2"/>
						<input class="form-control my-1" name="third" type="text" placeholder="Option 3 (Optional)"/>
						<input class="form-control my-1" name="fourth" type="text" placeholder="Option 4 (Optional)"/>
					</div>
					<div class="card-footer">
						<p>Duration</p>
						<div class="row gx-2">
							<div class="col-4">
								<div class="bg-light border rounded p-2">
									<p>Days</p>
									<select name="days" class="form-select">
										<option>0</option>
										<option selected="true">1</option>
										<For each={[...Array(5).keys()]}>
										{
											(day, index) => <option>{day + 2}</option>
										}
										</For>
									</select>
								</div>
							</div>
							<div class="col-4">
								<div class="bg-light border rounded p-2">
									<p>Hours</p>
									<select name="hours" class="form-select">
										<option>0</option>
										<For each={[...Array(23).keys()]}>
										{
											(hour, index) => <option>{hour + 1}</option>
										}
										</For>
									</select>
								</div>
							</div>
							<div class="col-4">
								<div class="bg-light border rounded p-2">
									<p>Minutes</p>
									<select name="minutes" class="form-select">
										<option>0</option>
										<For each={[...Array(59).keys()]}>
										{
											(minute, index) => <option>{minute + 1}</option>
										}
										</For>
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Show>
			<Show when={mediaFile()}>
				<div class="d-inline-block position-relative card-body pt-0 media-preview" onClick={_ => setMediaFile()}>
					<img class="img-fluid" src={URL.createObjectURL(mediaFile())}/>
					<button class="position-absolute top-0 end-0 btn btn-danger border m-1">
						<VsChromeClose/>
					</button>
				</div>
			</Show>
			<div class="d-flex justify-content-end pt-2 border-top">
				<div class="emoji-bar">
					<For each={popularEmoji}>
					{
						(emojo, index) => <div onClick={_ => insertEmojo(editableDiv, emojo, updateEditor)}>{emojo}</div>
					}
					</For>
				</div>
				<button ref={emojiTrigger} class="btn btn-light btn-sm px-3 rounded-pill ms-2" onClick={_ => emojiPopup.toggle()}>&#x2026;</button>
				<div class="char-count" classList={{ "bg-danger": characterLimitExceeded() }}>{charCount()}</div>
				<button class="btn btn-sm px-3 rounded-pill ms-2" classList={{ "btn-secondary": !hasPoll(), "btn-primary": hasPoll() }} onClick={_ => setHasPoll(!hasPoll())}><BiRegularPoll/></button>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" onClick={_ => mediaFileInput.click()}><BsImage/></button>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" disabled={charCount() === maxContentLength || characterLimitExceeded()} onClick={_ => makeQuip()}>Post</button>
				<input ref={mediaFileInput} onInput={event => setMediaFile(event.target.files?.[0])} class="visually-hidden" type="file"/>
			</div>
		</div>
	);
};