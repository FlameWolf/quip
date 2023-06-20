import { createSignal, createMemo, onMount, Show, For } from "solid-js";
import emojiData from "@emoji-mart/data";
import { Picker } from "emoji-mart";
import { computePosition, autoUpdate, offset, autoPlacement } from "@floating-ui/dom";
import { position } from "caret-pos";
import { contentLengthRegExp, insertEmojo, maxContentLength, popularEmoji } from "../library";
import { BsImage } from "solid-icons/bs";
import { BiRegularPoll } from "solid-icons/bi";
import { VsChromeClose } from "solid-icons/vs";
import { themeStore } from "../stores/theme-store";
import { setQuipStore } from "../stores/quip-store";
import { authStore } from "../stores/auth-store";

const createPostUrl = `${import.meta.env.VITE_API_BASE_URL}/posts/create`;
const createReplyUrl = `${import.meta.env.VITE_API_BASE_URL}/posts/reply`;

export default props => {
	let currentInstance;
	let plainTextInput;
	let emojiPickerContainer;
	let emojiTrigger;
	let mediaFileInput;
	let editorLineHeight;
	const [caret, setCaret] = createSignal(0);
	const [hasEmojiPicker, setHasEmojiPicker] = createSignal(false);
	const [charCount, setCharCount] = createSignal(maxContentLength);
	const [hasPoll, setHasPoll] = createSignal(false);
	const [poll, setPoll] = createSignal({});
	const [mediaFile, setMediaFile] = createSignal();
	const getCharCount = text => text.match(contentLengthRegExp)?.length || 0;
	const updateEditor = () => {
		const text = plainTextInput.value;
		plainTextInput.parentNode.setAttribute("data-replicated-value", text);
		plainTextInput.style.overflowY = plainTextInput.scrollHeight > (plainTextInput.offsetHeight + editorLineHeight) ? "scroll" : "";
		setCharCount(maxContentLength - getCharCount(text.trim()));
	};
	const updatePoll = event => {
		const sender = event.target;
		setPoll({ ...poll(), [sender.name]: sender.value });
	};
	const resetEditor = () => {
		plainTextInput.value = "";
		setHasPoll(false);
		setMediaFile();
		setCharCount(maxContentLength);
	};
	const makeQuip = async () => {
		const parentPostId = currentInstance.dataset.parentPostId;
		const formData = new FormData();
		formData.append("content", plainTextInput.value.trim());
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
		const response = await fetch(parentPostId ? `${createReplyUrl}/${parentPostId}` : createPostUrl, {
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
				currentInstance.closest(".action-bar").querySelector(".hstack > button:last-child").click();
			}
		}
	};
	const characterLimitExceeded = createMemo(() => charCount() < 0);
	const dismissEmojiPicker = event => {
		const sender = event.target;
		if(sender != emojiTrigger && sender.getRootNode?.()?.host?.tagName != "EM-EMOJI-PICKER") {
			setHasEmojiPicker(false);
		}
	};
	const toggleEmojiMart = () => {
		autoUpdate(emojiTrigger, emojiPickerContainer, () => {
			computePosition(emojiTrigger, emojiPickerContainer, {
				middleware: [offset(4), autoPlacement()]
			}).then(({ x, y }) => {
				Object.assign(emojiPickerContainer.style, {
					left: `${x}px`,
					top: `${y}px`
				});
			});
		});
		setHasEmojiPicker(!hasEmojiPicker());
	}
	onMount(() => {
		setTimeout(() => {
			editorLineHeight = parseInt(getComputedStyle(plainTextInput).lineHeight);
		});
	});
	return (
		<div ref={currentInstance} {...props} class="editor border rounded p-2 overflow-hidden" onClick={dismissEmojiPicker}>
			<div class="autogrow" tabIndex={-1}>
				<textarea ref={plainTextInput} onInput={updateEditor} onBlur={() => setCaret(position(plainTextInput).pos)}></textarea>
			</div>
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
								<div class="border rounded p-2">
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
								<div class="border rounded p-2">
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
								<div class="border rounded p-2">
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
				<div class="d-inline-block position-relative card-body pt-0 media-preview" onClick={() => setMediaFile()}>
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
						(emojo, index) => <div onClick={() => insertEmojo(plainTextInput, emojo, updateEditor)}>{emojo}</div>
					}
					</For>
				</div>
				<div ref={emojiPickerContainer} class="emoji-picker-container border rounded" classList={{ "d-none": !hasEmojiPicker() }}>
				<button style="" class="btn btn-danger btn-sm p-0 rounded-50">
					<i class="bi bi-x-lg"></i>
				</button>
				{
					new Picker({
						data: emojiData,
						theme: themeStore.theme,
						onEmojiSelect: event => insertEmojo(plainTextInput, event.native, updateEditor)
					})
				}
				</div>
				<button ref={emojiTrigger} class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" classList={{ "active": hasEmojiPicker() }} onClick={toggleEmojiMart}>&#x2026;</button>
				<div class="char-count" classList={{ "bg-danger text-light": characterLimitExceeded() }}>{charCount()}</div>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" classList={{ "active": hasPoll() }} onClick={() => setHasPoll(!hasPoll())}><BiRegularPoll class="poll-icon"/></button>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" onClick={() => mediaFileInput.click()}><BsImage/></button>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" disabled={charCount() === maxContentLength || characterLimitExceeded()} onClick={() => makeQuip()}>Post</button>
				<input ref={mediaFileInput} onInput={event => setMediaFile(event.target.files?.[0])} class="visually-hidden" type="file"/>
			</div>
		</div>
	);
};