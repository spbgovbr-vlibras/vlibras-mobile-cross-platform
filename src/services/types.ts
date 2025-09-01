export interface DictionaryData {
	wordClass?: string;
	pronunciation?: string;
	definitions?: string[];
	etymology?: string;
	gender?: string;
	imgUrl?: string;
	translations?: Record<string, string[]>;
	plural?: string;
}
