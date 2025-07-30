import React from "react";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import {StyleSheet} from "react-native-unistyles";

import {settings$} from "@/app/store/settings";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {hapticToTrigger} from "@/app/utils/haptics";
import {use$} from "@legendapp/state/react";

type Props = {
	months: string[];
	onMonthSelect: (monthIndex: number) => void;
	containerHeight: number;
};

export function FastScrollIndex({
	months,
	onMonthSelect,
	containerHeight,
}: Props) {
	const translateY = useSharedValue(0);
	const isActive = useSharedValue(false);
	const currentIndex = useSharedValue(-1);
	const hapticsEnabled = use$(settings$.haptics);
	const haptic = hapticToTrigger("impactLight");

	const monthLetters = React.useMemo(() => {
		return months.map((month) => month.charAt(0).toUpperCase());
	}, [months]);

	const triggerHapticFeedback = () => {
		if (hapticsEnabled) {
			haptic.impactLight();
		}
	};

	const handlePositionUpdate = (y: number, isInitial = false) => {
		const clampedY = Math.max(0, Math.min(y, containerHeight));
		translateY.value = clampedY;

		const rawIndex = (clampedY / containerHeight) * monthLetters.length;
		const index = Math.min(Math.floor(rawIndex), monthLetters.length - 1);

		if (currentIndex.value !== index) {
			currentIndex.value = index;
			runOnJS(onMonthSelect)(index);
			if (!isInitial) {
				runOnJS(triggerHapticFeedback)();
			}
		}
	};

	const panGesture = Gesture.Pan()
		.minDistance(0)
		.onStart((event) => {
			isActive.value = true;
			runOnJS(handlePositionUpdate)(event.y, true);
		})
		.onUpdate((event) => {
			runOnJS(handlePositionUpdate)(event.y, false);
		})
		.onEnd(() => {
			isActive.value = false;
			currentIndex.value = -1;
		})
		.onFinalize(() => {
			isActive.value = false;
			currentIndex.value = -1;
		});

	const tapGesture = Gesture.Tap()
		.onBegin((event) => {
			isActive.value = true;
			runOnJS(handlePositionUpdate)(event.y, true);
		})
		.onEnd(() => {
			isActive.value = false;
			currentIndex.value = -1;
		})
		.onFinalize(() => {
			isActive.value = false;
			currentIndex.value = -1;
		});

	const combinedGesture = Gesture.Simultaneous(panGesture, tapGesture);

	const indicatorStyle = useAnimatedStyle(() => {
		return {
			opacity: isActive.value ? 1 : 0,
			transform: [
				{
					translateY: translateY.value - 12.5,
				},
			],
		};
	});

	const containerStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: isActive.value
				? "rgba(164, 52, 58, 0.1)"
				: "transparent",
		};
	});

	return (
		<View style={styles.container}>
			<GestureDetector gesture={combinedGesture}>
				<Animated.View
					style={[
						styles.scrollTrack,
						containerStyle,
						{height: containerHeight},
					]}
				>
					{monthLetters.map((letter, index) => (
						<View key={`${letter}-${index}`} style={styles.letterContainer}>
							<Text style={styles.letter}>{letter}</Text>
						</View>
					))}
					<Animated.View style={[styles.indicator, indicatorStyle]} />
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	container: {
		position: "absolute",
		right: 5,
		top: 0,
		bottom: 0,
		justifyContent: "center",
		zIndex: 10,
		width: 35,
		pointerEvents: "box-none",
	},
	scrollTrack: {
		width: 35,
		borderRadius: 17,
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 20,
		pointerEvents: "auto",
	},
	letterContainer: {
		justifyContent: "center",
		alignItems: "center",
		height: 20,
	},
	letter: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.primary,
	},
	indicator: {
		position: "absolute",
		width: 25,
		height: 25,
		borderRadius: 12.5,
		backgroundColor: colors.primary,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: colors.black,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
}));
