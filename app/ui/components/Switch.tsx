import React from "react";
import {Pressable} from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import {StyleSheet} from "react-native-unistyles";

import {haptics$} from "@/app/store/haptics";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {colors} from "@/app/ui/config/colors";
import {haptics} from "@/app/utils/haptics";
import {use$} from "@legendapp/state/react";

type LabelPosition = "left" | "right" | "inline-left" | "inline-right";

type Props = {
	value: boolean;
	onValueChange: (value: boolean) => void;
	label?: string;
	labelPosition?: LabelPosition;
	disabled?: boolean;
	size?: "small" | "medium" | "large";
	testID?: string;
};

const SWITCH_CONFIG = {
	small: {
		width: 44,
		height: 24,
		thumbSize: 18,
		thumbOffset: 3,
	},
	medium: {
		width: 52,
		height: 28,
		thumbSize: 22,
		thumbOffset: 3,
	},
	large: {
		width: 60,
		height: 32,
		thumbSize: 26,
		thumbOffset: 3,
	},
};

export function Switch({
	value,
	onValueChange,
	label,
	labelPosition = "right",
	disabled = false,
	size = "medium",
	testID,
}: Props) {
	const animatedValue = useSharedValue(value ? 1 : 0);
	const pressScale = useSharedValue(1);
	const hapticsEnabled = use$(haptics$.enabled);

	const config = SWITCH_CONFIG[size];

	React.useEffect(() => {
		animatedValue.value = withSpring(value ? 1 : 0, {
			damping: 15,
			stiffness: 200,
		});
	}, [value, animatedValue]);

	const handlePress = () => {
		if (disabled) return;

		haptics.impactMedium();
		onValueChange(!value);
	};

	const handlePressIn = () => {
		if (disabled) return;
		pressScale.value = withSpring(0.95, {
			damping: 15,
			stiffness: 300,
		});
	};

	const handlePressOut = () => {
		if (disabled) return;
		pressScale.value = withSpring(1, {
			damping: 15,
			stiffness: 300,
		});
	};

	const trackAnimatedStyle = useAnimatedStyle(() => {
		const backgroundColor = interpolateColor(
			animatedValue.value,
			[0, 1],
			disabled ? ["#E5E5E5", "#B0B0B0"] : ["#E5E5E5", colors.primary],
		);

		return {
			backgroundColor,
			transform: [{scale: pressScale.value}],
		};
	});

	const thumbAnimatedStyle = useAnimatedStyle(() => {
		const translateX =
			animatedValue.value *
			(config.width - config.thumbSize - config.thumbOffset * 2);

		return {
			transform: [{translateX}, {scale: pressScale.value}],
		};
	});

	const switchElement = (
		<Pressable
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			disabled={disabled}
			testID={testID}
			style={[
				styles.pressableArea,
				{
					width: config.width + 8,
					height: config.height + 8,
				},
			]}
		>
			<Animated.View
				style={[
					styles.track,
					{
						width: config.width,
						height: config.height,
						borderRadius: config.height / 2,
					},
					trackAnimatedStyle,
				]}
			>
				<Animated.View
					style={[
						styles.thumb,
						{
							width: config.thumbSize,
							height: config.thumbSize,
							borderRadius: config.thumbSize / 2,
							top: config.thumbOffset,
							left: config.thumbOffset,
						},
						thumbAnimatedStyle,
					]}
				/>
			</Animated.View>
		</Pressable>
	);

	if (!label) {
		return switchElement;
	}

	const isInline = labelPosition.includes("inline");
	const isLeft = labelPosition.includes("left");

	if (isInline) {
		return (
			<Pressable
				onPress={handlePress}
				disabled={disabled}
				style={[styles.inlineContainer, disabled && styles.disabled]}
			>
				{isLeft && (
					<Text style={[styles.inlineLabel, styles.inlineLabelLeft]}>
						{label}
					</Text>
				)}
				{switchElement}
				{!isLeft && (
					<Text style={[styles.inlineLabel, styles.inlineLabelRight]}>
						{label}
					</Text>
				)}
			</Pressable>
		);
	}

	return (
		<View style={styles.container}>
			{isLeft && (
				<Text style={[styles.label, disabled && styles.labelDisabled]}>
					{label}
				</Text>
			)}
			{switchElement}
			{!isLeft && (
				<Text style={[styles.label, disabled && styles.labelDisabled]}>
					{label}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create(({colors}) => ({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		minHeight: 44,
	},
	inlineContainer: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 44,
	},
	pressableArea: {
		justifyContent: "center",
		alignItems: "center",
	},
	track: {
		justifyContent: "center",
		shadowColor: colors.black,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	thumb: {
		backgroundColor: colors.white,
		position: "absolute",
		shadowColor: colors.black,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 3,
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		color: colors.black,
		flex: 1,
	},
	labelDisabled: {
		color: colors.grey,
	},
	inlineLabel: {
		fontSize: 16,
		fontWeight: "500",
		color: colors.black,
	},
	inlineLabelLeft: {
		marginRight: 12,
	},
	inlineLabelRight: {
		marginLeft: 12,
	},
	disabled: {
		opacity: 0.6,
	},
}));
