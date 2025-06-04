import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import {reduceArrayToObject} from "@/app/utils/arrays";

export const HapticFeedback = {
	impactHeavy: "impactHeavy",
	impactLight: "impactLight",
	impactMedium: "impactMedium",
	rigid: "rigid",
	soft: "soft",
	notificationError: "notificationError",
	notificationSuccess: "notificationSuccess",
	notificationWarning: "notificationWarning",
	selection: "selection",
} as const;

export type HapticFeedbackType =
	(typeof HapticFeedback)[keyof typeof HapticFeedback];

export function hapticToTrigger(haptic: HapticFeedbackType) {
	return {
		[haptic]: () => ReactNativeHapticFeedback.trigger(haptic),
	};
}

export const haptics = reduceArrayToObject(
	Object.values(HapticFeedback).map(hapticToTrigger),
);
