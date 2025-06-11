import type {BottomTabNavigationOptions} from "@react-navigation/bottom-tabs";
import {PlatformPressable} from "@react-navigation/elements";
import {
	type NavigationRoute,
	type ParamListBase,
	useLinkBuilder,
} from "@react-navigation/native";
import {Home, Setting4, Star} from "iconsax-react-native";
import {useTranslation} from "react-i18next";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import {StyleSheet} from "react-native-unistyles";

import {Text} from "@/app/ui/components/Text";
import {colors} from "@/app/ui/config/colors";
import {hapticToTrigger} from "@/app/utils/haptics";

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
	const {t} = useTranslation();
	const {buildHref} = useLinkBuilder();
	const scale = useSharedValue(1);
	const haptic = hapticToTrigger("impactMedium");

	const getTabText = (routeName: string) => {
		switch (routeName) {
			case "HomeStack":
				return t("navigation.home");
			case "Favourites":
				return t("navigation.favourites");
			case "Settings":
				return t("navigation.settings");
			default:
				return routeName;
		}
	};

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
			<Text style={styles.bottomTabText}>{getTabText(label as string)}</Text>
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create(({colors, sizes, tokens}, rt) => ({
	bottomTabs: {
		flexDirection: "row",
	},
	bottomTabContainer: {
		flex: 1,
		paddingTop: sizes["3px"],
		backgroundColor: tokens.background.primary,
		alignItems: "center",
		paddingBottom: rt.insets.bottom,
	},
	bottomTabText: {
		color: tokens.text.primary,
		fontSize: 12,
		marginTop: sizes["3px"],
	},
}));
