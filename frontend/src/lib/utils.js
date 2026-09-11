export const capitialize = (value) => {
	if (Array.isArray(value)) {
		return value.map(capitialize).filter(Boolean).join(", ");
	}

	if (typeof value !== "string" || !value) return "";

	return value.charAt(0).toUpperCase() + value.slice(1);
};