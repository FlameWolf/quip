import { createMemo, createSignal, Show } from "solid-js";
import { quipStore, setQuipStore } from "../stores/quip-store";
import { produce } from "solid-js/store";

export default props => {
	const poll = createMemo(() => props.poll);
	const votes = createMemo(() => poll().votes);
	const firstOptionVotes = createMemo(() => votes().first ?? 0);
	const secondOptionVotes = createMemo(() => votes().second ?? 0);
	const thirdOptionVotes = createMemo(() => votes().third ?? 0);
	const fourthOptionVotes = createMemo(() => votes().fourth ?? 0);
	const [totalVotes, setTotalVotes] = createSignal(firstOptionVotes() + secondOptionVotes() + thirdOptionVotes() + fourthOptionVotes());
	const firstPercentage = createMemo(() => Math.round((firstOptionVotes() / (totalVotes() || 1)) * 100, 2));
	const secondPercentage = createMemo(() => Math.round((secondOptionVotes() / (totalVotes() || 1)) * 100, 2));
	const thirdPercentage = createMemo(() => Math.round((thirdOptionVotes() / (totalVotes() || 1)) * 100, 2));
	const fourthPercentage = createMemo(() => Math.round((fourthOptionVotes() / (totalVotes() || 1)) * 100, 2));
	const inactivePoll = createMemo(() => props.isOwnPoll || poll().expired || props.voted);
	const castVoteUrl = `${import.meta.env.VITE_API_BASE_URL}/posts/vote/${props.postId}`;
	const castVote = async option => {
		var response = await fetch(`${castVoteUrl}?option=${option}`);
		if (response.ok) {
			setTotalVotes(totalVotes() + 1);
			setQuipStore(
				"quips",
				quipStore.quips.findIndex(quip => quip._id === props.postId),
				produce(quip => {
					const votes = quip.attachments.poll.votes;
					votes[option] = (votes[option] || 0) + 1;
					quip.voted = option;
				})
			);
		}
	};
	return (
		<div class="card-body poll">
			<Show when={inactivePoll()}>
				<ul class="list-group">
					<Show when={inactivePoll()}>
						<li class="list-group-item position-relative">
							<div class="poll-bar" style={{ width: `${firstPercentage()}%` }}></div>
							<div class="poll-option">{poll().first}</div>
							<div class="poll-value">{firstPercentage()}</div>
						</li>
						<li class="list-group-item position-relative">
							<div class="poll-bar" style={{ width: `${secondPercentage()}%` }}></div>
							<div class="poll-option">{poll().second}</div>
							<div class="poll-value">{secondPercentage()}</div>
						</li>
						<Show when={poll().third}>
							<li class="list-group-item position-relative">
								<div class="poll-bar" style={{ width: `${thirdPercentage()}%` }}></div>
								<div class="poll-option">{poll().third}</div>
								<div class="poll-value">{thirdPercentage()}</div>
							</li>
						</Show>
						<Show when={poll().fourth}>
							<li class="list-group-item position-relative">
								<div class="poll-bar" style={{ width: `${fourthPercentage()}%` }}></div>
								<div class="poll-option">{poll().fourth}</div>
								<div class="poll-value">{fourthPercentage()}</div>
							</li>
						</Show>
					</Show>
				</ul>
			</Show>
			<Show when={!inactivePoll()}>
				<div class="d-flex flex-column poll-buttons">
					<button class="btn btn-outline-primary" onClick={() => castVote("first")}>{poll().first}</button>
					<button class="btn btn-outline-primary" onClick={() => castVote("second")}>{poll().second}</button>
					<Show when={poll().third}>
						<button class="btn btn-outline-primary" onClick={() => castVote("third")}>{poll().third}</button>
					</Show>
					<Show when={poll().fourth}>
						<button class="btn btn-outline-primary" onClick={() => castVote("fourth")}>{poll().fourth}</button>
					</Show>
					<button class="btn btn-primary" onClick={() => castVote("nota")}>NOTA</button>
				</div>
			</Show>
		</div>
	);
};