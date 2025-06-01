import type {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {PlatformPressable, Text} from "@react-navigation/elements";
import {createStaticNavigation, useLinkBuilder} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Home, Setting4, Star} from "iconsax-react-native";
import {View} from "react-native";

import {FavouritesScreen} from "@/app/modules/Favourites/screens/FavouritesScreen";
import {HomeScreen} from "@/app/modules/Home/screens/HomeScreen";
import {NamesRowScreen} from "@/app/modules/Home/screens/NamesRowScreen";
import {colors} from "@/app/ui/config/colors";
import {StyleSheet} from "react-native-unistyles";
import {SettingsScreen} from "../modules/Settings/screens/SettingsScreen";

const TabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
	const {buildHref} = useLinkBuilder();

	return (
		<View style={styles.bottomTabs}>
			{state.routes.map((route, index) => {
				const {options} = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					});
				};

				return (
					<PlatformPressable
						key={route.key}
						href={buildHref(route.name, route.params)}
						accessibilityState={isFocused ? {selected: true} : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarButtonTestID}
						onPress={onPress}
						onLongPress={onLongPress}
						style={styles.bottomTabContainer}
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
					</PlatformPressable>
				);
			})}
		</View>
	);
};

const BOTTOM_TAB_TEXT_MAP = {
	HomeStack: "Home",
	Favourites: "Favourites",
	Settings: "Settings",
};

const HomeStack = createNativeStackNavigator({
	screens: {
		Home: HomeScreen,
		NamesRow: NamesRowScreen,
	},
	screenOptions: {
		headerShown: false,
	},
});

const RootStack = createBottomTabNavigator({
	initialRouteName: "HomeStack",
	tabBar: (props) => <TabBar {...props} />,
	screens: {
		HomeStack,
		Favourites: FavouritesScreen,
		Settings: SettingsScreen,
	},
	screenOptions: {
		headerShown: false,
		animation: "shift",
	},
});

export const Navigation = createStaticNavigation(RootStack);

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
