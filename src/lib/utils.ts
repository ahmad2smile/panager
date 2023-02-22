import {
	isPermissionGranted,
	Options,
	requestPermission,
	sendNotification
} from "@tauri-apps/api/notification";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export async function showErrorNotification(options: Partial<Options>) {
	console.log("==================================");
	console.log(JSON.stringify({ error: options?.body || "Something went wrong" }, undefined, 4));
	console.log("==================================");

	let permissionGranted = await isPermissionGranted();

	if (!permissionGranted) {
		const permission = await requestPermission();
		permissionGranted = permission === "granted";
	}

	if (permissionGranted) {
		sendNotification({
			title: "Panager",
			body: "Something went wrong, please try again",
			...options
		});
	}
}

export async function showNotification(options: Partial<Options>) {
	let permissionGranted = await isPermissionGranted();

	if (!permissionGranted) {
		const permission = await requestPermission();
		permissionGranted = permission === "granted";
	}

	if (permissionGranted) {
		sendNotification({
			title: "Panager",
			body: "Empty Notification",
			...options
		});
	}
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
