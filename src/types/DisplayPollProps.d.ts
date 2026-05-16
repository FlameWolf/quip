import type { Poll } from "./index";

export interface DisplayPollProps {
	poll: Poll;
	isOwnPoll: boolean;
	voted?: string;
	postId: string;
}