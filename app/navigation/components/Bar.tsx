import type {BottomTabNavigationOptions} from "@react-navigation/bottom-tabs";
import {PlatformPressable, Text} from "@react-navigation/elements";
import {
	type NavigationRoute,
	type ParamListBase,
	useLinkBuilder,
} from "@react-navigation/native";
import {Home, Setting4, Star} from "iconsax-react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import {StyleSheet} from "react-native-unistyles";

import {colors} from "@/app/ui/config/colors";
import {hapticToTrigger} from "@/app/utils/haptics";

const BOTTOM_TAB_TEXT_MAP = {
	HomeStack: "Home",
	Favourites: "Favourites",
	Settings: "Settings",
};

const AnimatedPressable = Animated.createAnimatedComponent(PlatformPressable);

type Props = {
	label:
		| string
		| ((props: {
				focused: boolean;
				color: string;
				position: "beside-icon" | "below-icon";
				children: string;
		  }) => React.ReactNode);
	route: NavigationRoute<ParamListBase, string>;
	isFocused: boolean;
	options: BottomTabNavigationOptions;
	onPress: () => void;
	onLongPress?: () => void;
};

export function Bar({
	label,
	route,
	isFocused,
	options,
	onPress,
	onLongPress,
}: Props) {
	const {buildHref} = useLinkBuilder();
	const scale = useSharedValue(1);
	const haptic = hapticToTrigger("impactMedium");

	const handlePressIn = () => {
		scale.value = withSpring(0.95);
	};
	const handlePressOut = () => {
		scale.value = withSpring(1);
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{scale: scale.value}],
	}));

	return (
		<AnimatedPressable
			key={route.key}
			href={buildHref(route.name, route.params)}
			accessibilityState={isFocused ? {selected: true} : {}}
			accessibilityLabel={options.tabBarAccessibilityLabel}
			testID={options.tabBarButtonTestID}
			onPress={() => {
				onPress();
				haptic.impactMedium();
			}}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			onLongPress={onLongPress}
			pressOpacity={1}
			style={[styles.bottomTabContainer, animatedStyle]}
		>
			{label === "HomeStack" ? (
				<Home
					size="27"
					color={colors.primary}
					variant={isFocused ? "Bold" : "Outline"}
				/>
			) : label === "Favourites" ? (
				<Star
					size="27"
					color={colors.primary}
					variant={isFocused ? "Bold" : "Outline"}
				/>
			) : label === "Settings" ? (
				<Setting4
					size="27"
					color={colors.primary}
					variant={isFocused ? "Bold" : "Outline"}
				/>
			) : null}
			<Text style={styles.bottomTabText}>
				{BOTTOM_TAB_TEXT_MAP[label as keyof typeof BOTTOM_TAB_TEXT_MAP]}
			</Text>
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create(({colors, sizes}, rt) => ({
	bottomTabs: {
		flexDirection: "row",
	},
	bottomTabContainer: {
		flex: 1,
		paddingTop: sizes["3px"],
		backgroundColor: colors.white,
		alignItems: "center",
		paddingBottom: rt.insets.bottom,
	},
	bottomTabText: {
		color: colors.primary,
		fontSize: 12,
		marginTop: sizes["3px"],
	},
}));
