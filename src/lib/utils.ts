/* eslint-disable no-constant-condition */
import { ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export const showErrorNotification = async (
	opts: Partial<{ title: string; body: string }>,
	shouldLog = false
) => {
	if (true) {
		console.log("==================================");
		console.log(JSON.stringify(opts, undefined, 4));
		console.log("==================================");
	}
};

export const showNotification = async (
	opts: Partial<{ title: string; body: string }>,
	shouldLog = false
) => {
	if (true) {
		console.log("==================================");
		console.log(JSON.stringify(opts, undefined, 4));
		console.log("==================================");
	}
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function usePersistanceState<T>(key: string) {
	const [state, setState] = useState<T | undefined>(() => {
		const val = localStorage.getItem(key);

		return val === null ? undefined : JSON.parse(val);
	});

	return [
		state,
		(val: T) => {
			setState(val);
			localStorage.setItem(key, JSON.stringify(val));
		}
	] as const;
}

export const useToggleTheme = () => {
	const [theme, setTheme] = usePersistanceState<"dark" | "light">("theme");

	useEffect(() => {
		const head = document.documentElement;

		if (
			theme === "dark" ||
			(!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
		) {
			head.classList.add("dark");
			head.dataset.theme = "dark";
		} else {
			head.classList.remove("dark");
			head.dataset.theme = "light";
		}
	}, [theme]);

	return [theme, () => setTheme(theme === "dark" ? "light" : "dark")] as const;
};
