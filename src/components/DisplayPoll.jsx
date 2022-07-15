import { Show } from "solid-js";

export default props => {
	const poll = props.poll;
	const votes = poll.votes;
	const inactivePoll = props.isOwnPoll || poll.expired || poll.voted;
	const totalVotes = votes.first + votes.second + votes.third || 0 + votes.fourth || 0;
	const firstPercentage = (votes.first/(totalVotes || 1)) * 100;
	const secondPercentage = (votes.second/(totalVotes || 1)) * 100;
	const thirdPercentage = (votes.third/(totalVotes || 1)) * 100;
	const fourthPercentage = (votes.fourth/(totalVotes || 1)) * 100;
	console.log(poll, totalVotes);

	return (
		<div class="card-body poll">
			<ul class="list-group">
				<Show when={inactivePoll}>
					<li class="list-group-item position-relative">
						<div class="poll-bar" style={{ width: `${firstPercentage}%` }}></div>
						<div class="poll-option">{poll.first}</div>
						<div class="poll-value">{firstPercentage}%</div>
					</li>
					<li class="list-group-item position-relative">
						<div class="poll-bar" style={{ width: `${secondPercentage}%` }}></div>
						<div class="poll-option">{poll.second}</div>
						<div class="poll-value">{secondPercentage}%</div>
					</li>
					<Show when={poll.third}>
						<li class="list-group-item position-relative">
							<div class="poll-bar" style={{ width: `${thirdPercentage}%` }}></div>
							<div class="poll-option">{poll.third}</div>
							<div class="poll-value">{thirdPercentage}%</div>
						</li>
					</Show>
					<Show when={poll.fourth}>
						<li class="list-group-item position-relative">
							<div class="poll-bar" style={{ width: `${fourthPercentage}%` }}></div>
							<div class="poll-option">{poll.fourth}</div>
							<div class="poll-value">{fourthPercentage}%</div>
						</li>
					</Show>
				</Show>
				<Show when={!inactivePoll}>
					<li class="list-group-item">
						<span>{poll.first}</span>
					</li>
					<li class="list-group-item">
						<span>{poll.second}</span>
					</li>
					<Show when={poll.third}>
						<li class="list-group-item">
							<span>{poll.third}</span>
						</li>
					</Show>
					<Show when={poll.fourth}>
						<li class="list-group-item">
							<span>{poll.fourth}</span>
						</li>
					</Show>
				</Show>
			</ul>
		</div>
	);
};