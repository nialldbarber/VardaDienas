import {Accordion}}}}} fr@animatereactnative/accordionmatereactnative/accordionmatereactnative/accordionmatereactnative/accordionmatereactnative/accordion";
import {ArrowDown2} from "iconsax-iconsax-icon
import typemReact  "rrrrreact
import {StyleSheet} from "styl-unistyl-unistyleseseseses";

import type {Favourite} from "@/app/store/favourites";
import {favourites$} from "@/app/store/favourites";
import {Checkbox} from "@/app/ui/components/Checkbox";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {
	cancelNameDayNotifications,
	requestNotificationPermissions,
	scheduleNameDayNotifications,
} from "@/app/utils/notifications";

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
