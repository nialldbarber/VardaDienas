import ReactNativeHapticFeedback from "react-native-haptic-feedback";

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

function triggerHaptic(haptic: HapticFeedbackType) {
	try {
		if (
			ReactNativeHapticFeedback &&
			typeof ReactNativeHapticFeedback.trigger === "function"
		) {
			ReactNativeHapticFeedback.trigger(haptic);
		} else {
			console.warn("Haptic feedback library not properly loaded");
		}
	} catch (error) {
		console.warn(`Haptic feedback '${haptic}' not available:`, error);
	}
}

export function hapticToTrigger(haptic: HapticFeedbackType) {
	return {
		[haptic]: () => triggerHaptic(haptic),
	};
}

// Direct export of individual haptic functions for easier usage
export const haptics = {
	impactLight: () => triggerHaptic("impactLight"),
	impactMedium: () => triggerHaptic("impactMedium"),
	impactHeavy: () => triggerHaptic("impactHeavy"),
	rigid: () => triggerHaptic("rigid"),
	soft: () => triggerHaptic("soft"),
	notificationError: () => triggerHaptic("notificationError"),
	notificationSuccess: () => triggerHaptic("notificationSuccess"),
	notificationWarning: () => triggerHaptic("notificationWarning"),
	selection: () => triggerHaptic("selection"),
};
