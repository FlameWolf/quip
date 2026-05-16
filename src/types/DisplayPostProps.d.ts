import type { Post } from "./index";

export interface DisplayPostProps {
	post: Post;
	hasReplies?: number;
	isReply?: boolean | string;
	parentBlurb?: string;
}