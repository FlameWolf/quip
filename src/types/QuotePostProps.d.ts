import type { Post } from "./index";

export interface QuotePostProps {
	isOpen?: boolean;
	post: Post;
	onClose?: () => void;
}