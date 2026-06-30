import { createMemo, createSignal, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { quipStore, setQuipStore } from "../stores/quip-store";
import { setErrorStore } from "../stores/error-store";
import { getErrorMessage } from "../library";
import type { PollVotes } from "../types";
import type { DisplayPollProps } from "../types/DisplayPollProps";

type OptionKey = "first" | "second" | "third" | "fourth";

export default (props: DisplayPollProps) => {
	const poll = createMemo(() => props.poll);
	const [votes, setVotes] = createStore<PollVotes>({ ...poll().votes });
	const [voted, setVoted] = createSignal(props.voted);
	const options = createMemo(() => (["first", "second", "third", "fourth"] as OptionKey[]).filter(key => poll()[key]).map(key => ({ key, label: poll()[key] as string })));
	const totalVotes = createMemo(() => Object.values(votes).reduce((sum: number, count) => sum + (count ?? 0), 0));
	const percentage = (count: number | undefined) => Math.round(((count ?? 0) / (totalVotes() || 1)) * 100);
	const inactivePoll = createMemo(() => props.isOwnPoll || poll().expired || voted());
	const castVoteUrl = `${import.meta.env.VITE_API_BASE_URL}/posts/vote/${props.postId}`;
	const castVote = async (option: string) => {
		try {
			const response = await fetch(`${castVoteUrl}?option=${option}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			setVotes(option, count => (count ?? 0) + 1);
			setVoted(option);
			const index = quipStore.quips.findIndex(quip => quip._id === props.postId);
			if (index > -1) {
				setQuipStore(
					"quips",
					index,
					produce(quip => {
						const storeVotes = quip.attachments!.poll!.votes;
						storeVotes[option] = (storeVotes[option] || 0) + 1;
						quip.voted = option;
					})
				);
			}
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	return (
		<div class="card-body poll">
			<Show
				when={inactivePoll()}
				fallback={
					<div class="d-flex flex-column poll-buttons">
						<For each={options()}>
							{option => (
								<button class="btn btn-outline-primary" onClick={() => castVote(option.key)}>{option.label}</button>
							)}
						</For>
						<button class="btn btn-primary" onClick={() => castVote("nota")}>NOTA</button>
					</div>
				}>
				<ul class="list-group">
					<For each={options()}>
						{option => (
							<li class="list-group-item position-relative">
								<div class="poll-bar" style={{ width: `${percentage(votes[option.key])}%` }}></div>
								<div class="poll-option">{option.label}</div>
								<div class="poll-value">{percentage(votes[option.key])}</div>
							</li>
						)}
					</For>
				</ul>
			</Show>
		</div>
	);
};