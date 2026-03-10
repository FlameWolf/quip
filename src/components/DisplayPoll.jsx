import { Show } from "solid-js";

export default props => {
	const poll = props.poll;
	const votes = poll.votes;
	const inactivePoll = props.isOwnPoll || poll.expired || poll.voted;
	const totalVotes = votes.first + votes.second + votes.third || 0 + votes.fourth || 0;
	const firstPercentage = Math.round((votes.first / (totalVotes || 1)) * 100, 2);
	const secondPercentage = Math.round((votes.second / (totalVotes || 1)) * 100, 2);
	const thirdPercentage = Math.round((votes.third / (totalVotes || 1)) * 100, 2);
	const fourthPercentage = Math.round((votes.fourth / (totalVotes || 1)) * 100, 2);

	return (
		<div class="card-body poll">
			<Show when={inactivePoll}>
				<ul class="list-group">
					<Show when={inactivePoll}>
						<li class="list-group-item position-relative">
							<div class="poll-bar" style={{ width: `${firstPercentage}%` }}></div>
							<div class="poll-option">{poll.first}</div>
							<div class="poll-value">{firstPercentage}</div>
						</li>
						<li class="list-group-item position-relative">
							<div class="poll-bar" style={{ width: `${secondPercentage}%` }}></div>
							<div class="poll-option">{poll.second}</div>
							<div class="poll-value">{secondPercentage}</div>
						</li>
						<Show when={poll.third}>
							<li class="list-group-item position-relative">
								<div class="poll-bar" style={{ width: `${thirdPercentage}%` }}></div>
								<div class="poll-option">{poll.third}</div>
								<div class="poll-value">{thirdPercentage}</div>
							</li>
						</Show>
						<Show when={poll.fourth}>
							<li class="list-group-item position-relative">
								<div class="poll-bar" style={{ width: `${fourthPercentage}%` }}></div>
								<div class="poll-option">{poll.fourth}</div>
								<div class="poll-value">{fourthPercentage}</div>
							</li>
						</Show>
					</Show>
				</ul>
			</Show>
			<Show when={!inactivePoll}>
				<div class="d-flex flex-column poll-buttons">
					<button class="btn btn-outline-primary">{poll.first}</button>
					<button class="btn btn-outline-primary">{poll.second}</button>
					<Show when={poll.third}>
						<button class="btn btn-outline-primary">{poll.third}</button>
					</Show>
					<Show when={poll.fourth}>
						<button class="btn btn-outline-primary">{poll.fourth}</button>
					</Show>
					<button class="btn btn-outline-primary">NOTA</button>
				</div>
			</Show>
		</div>
	);
};