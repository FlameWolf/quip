import type { Post } from "./index";

export interface DisplayPostMinimalProps {
	post: Post;
	isReply?: boolean;
	parentBlurb?: string;
}