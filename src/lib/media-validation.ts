export function isSafeMediaUrl(value: string | null) {
	if (!value) return true;
	if (value.startsWith("/") && !value.startsWith("//")) return true;
	try {
		return new URL(value).protocol === "https:";
	} catch {
		return false;
	}
}

export function isSafeMediaReference(url: string | null, key: string | null) {
	if (!isSafeMediaUrl(url)) return false;
	if (!key) return true;
	return Boolean(url) && /^school\/[a-zA-Z0-9/_-]{1,240}$/.test(key) && !key.split("/").includes("..");
}
